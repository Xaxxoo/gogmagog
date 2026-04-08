// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  Gog & Magog — Onchain Survival (Celo EVM)
 * @notice Players must call tendBase() at least once every 24 hours or their
 *         base decays. Agents (authorized EOAs / Safe sub-accounts) may call
 *         on behalf of the player via the agent system.
 *
 *         Decay schedule  : every DECAY_INTERVAL seconds all resources drop DECAY_AMOUNT
 *         Streak tracking : consecutive daily tending increments streak counter
 *         Agent system    : player pre-authorizes an agent address with a scope mask
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GogAndMagog is Ownable, ReentrancyGuard {

    /* ─────────── CONSTANTS ─────────── */

    uint256 public constant DECAY_INTERVAL   = 24 hours;
    uint256 public constant DECAY_AMOUNT     = 8;         // % per interval
    uint256 public constant MAX_RESOURCE     = 100;
    uint256 public constant TEND_RESTORE     = 15;        // % restored on tend
    uint256 public constant SCAVENGE_FOOD    = 22;
    uint256 public constant SCAVENGE_WATER   = 12;
    uint256 public constant REINFORCE_WALLS  = 30;
    uint256 public constant AGENT_FEE_MIN    = 0.01 ether; // min CELO to hire agent

    /* ─────────── TYPES ─────────── */

    struct Base {
        uint32  walls;
        uint32  water;
        uint32  food;
        uint64  lastTend;       // unix timestamp of last tend
        uint64  lastDecay;      // unix timestamp of last decay
        uint32  streak;         // consecutive daily tends
        uint32  longestStreak;
        bool    initialized;
    }

    uint8 public constant SCOPE_TEND      = 1 << 0;  // 0x01
    uint8 public constant SCOPE_SCAVENGE  = 1 << 1;  // 0x02
    uint8 public constant SCOPE_REINFORCE = 1 << 2;  // 0x04
    uint8 public constant SCOPE_RAID      = 1 << 3;  // 0x08
    uint8 public constant SCOPE_ALL       = 0x0F;

    struct Agent {
        address agentAddress;
        uint8   scopeMask;
        uint64  expiresAt;
        bool    active;
    }

    /* ─────────── STORAGE ─────────── */

    mapping(address => Base)  public bases;
    mapping(address => Agent) public agents;    // player => their hired agent
    mapping(address => address) public agentOf; // agentAddress => player

    uint256 public totalPlayers;
    uint256 public protocolFeeBalance;

    /* ─────────── EVENTS ─────────── */

    event BaseInitialized(address indexed player);
    event BaseTended(address indexed player, address indexed actor, uint256 streak);
    event BaseDecayed(address indexed player, uint32 walls, uint32 water, uint32 food);
    event Scavenged(address indexed player, address indexed actor);
    event WallsReinforced(address indexed player, address indexed actor, uint32 newWalls);
    event AgentHired(address indexed player, address indexed agent, uint8 scopeMask, uint64 expiresAt);
    event AgentDismissed(address indexed player, address indexed agent);
    event BaseAttacked(address indexed attacker, address indexed target, uint256 damage);
    event BaseDestroyed(address indexed player);

    /* ─────────── MODIFIERS ─────────── */

    modifier authorized(address player, uint8 scope) {
        require(
            msg.sender == player || _isAuthorizedAgent(player, scope),
            "Not authorized"
        );
        _;
    }

    modifier ensureDecay(address player) {
        _applyDecay(player);
        _;
    }

    /* ─────────── INIT ─────────── */

    function initBase() external {
        require(!bases[msg.sender].initialized, "Already initialized");
        bases[msg.sender] = Base({
            walls:          80,
            water:          80,
            food:           80,
            lastTend:       uint64(block.timestamp),
            lastDecay:      uint64(block.timestamp),
            streak:         0,
            longestStreak:  0,
            initialized:    true
        });
        totalPlayers++;
        emit BaseInitialized(msg.sender);
    }

    /* ─────────── CORE ACTIONS ─────────── */

    /**
     * @notice Tend your base — restores all resources and increments streak.
     *         Must be called at least once every DECAY_INTERVAL to maintain streak.
     */
    function tendBase()
        external
        ensureDecay(msg.sender)
        authorized(msg.sender, SCOPE_TEND)
    {
        address player = _resolvePlayer(msg.sender);
        Base storage b = bases[player];
        require(b.initialized, "Base not initialized");

        b.walls = uint32(_min(b.walls + TEND_RESTORE, MAX_RESOURCE));
        b.water = uint32(_min(b.water + TEND_RESTORE, MAX_RESOURCE));
        b.food  = uint32(_min(b.food  + TEND_RESTORE, MAX_RESOURCE));

        // Streak: count if tending within 48h window (grace period)
        if (block.timestamp - b.lastTend <= DECAY_INTERVAL * 2) {
            b.streak++;
        } else {
            b.streak = 1;  // reset
        }
        if (b.streak > b.longestStreak) b.longestStreak = b.streak;
        b.lastTend = uint64(block.timestamp);

        emit BaseTended(player, msg.sender, b.streak);
    }

    function scavenge()
        external
        ensureDecay(msg.sender)
        authorized(msg.sender, SCOPE_SCAVENGE)
    {
        address player = _resolvePlayer(msg.sender);
        Base storage b = bases[player];
        require(b.initialized, "Base not initialized");

        b.food  = uint32(_min(b.food  + SCAVENGE_FOOD,  MAX_RESOURCE));
        b.water = uint32(_min(b.water + SCAVENGE_WATER, MAX_RESOURCE));

        emit Scavenged(player, msg.sender);
    }

    function reinforceWalls()
        external
        ensureDecay(msg.sender)
        authorized(msg.sender, SCOPE_REINFORCE)
    {
        address player = _resolvePlayer(msg.sender);
        Base storage b = bases[player];
        require(b.initialized, "Base not initialized");

        b.walls = uint32(_min(b.walls + REINFORCE_WALLS, MAX_RESOURCE));

        emit WallsReinforced(player, msg.sender, b.walls);
    }

    /**
     * @notice Raid a neighboring base. Deals damage proportional to your streak.
     *         Requires walls > 20 to initiate.
     */
    function raidBase(address target)
        external
        ensureDecay(msg.sender)
        authorized(msg.sender, SCOPE_RAID)
        nonReentrant
    {
        address attacker = _resolvePlayer(msg.sender);
        require(attacker != target, "Cannot raid yourself");

        Base storage aBase = bases[attacker];
        Base storage tBase = bases[target];
        require(aBase.initialized && tBase.initialized, "Uninit base");
        require(aBase.walls > 20, "Walls too low to raid");

        // Damage scales with attacker streak, capped at 25
        uint256 damage = _min(5 + aBase.streak, 25);
        tBase.walls = uint32(tBase.walls > damage ? tBase.walls - damage : 0);

        // Small cost to attacker
        aBase.walls = uint32(aBase.walls > 3 ? aBase.walls - 3 : 0);

        if (tBase.walls == 0 && tBase.water == 0 && tBase.food == 0) {
            emit BaseDestroyed(target);
        }

        emit BaseAttacked(attacker, target, damage);
    }

    /* ─────────── AGENT SYSTEM ─────────── */

    /**
     * @notice Hire an agent to act on your behalf.
     * @param  agentAddress  EOA or contract that will sign transactions
     * @param  scopeMask     Bitfield of allowed actions (SCOPE_* constants)
     * @param  durationDays  How many days the agent is authorized
     */
    function hireAgent(
        address agentAddress,
        uint8   scopeMask,
        uint256 durationDays
    ) external payable {
        require(msg.value >= AGENT_FEE_MIN * durationDays, "Insufficient fee");
        require(agentAddress != address(0), "Invalid agent");
        require(agentAddress != msg.sender, "Cannot agent yourself");
        require(durationDays > 0 && durationDays <= 365, "Invalid duration");

        // Dismiss existing agent if any
        Agent storage existing = agents[msg.sender];
        if (existing.active) {
            agentOf[existing.agentAddress] = address(0);
        }

        uint64 expiresAt = uint64(block.timestamp + durationDays * 1 days);

        agents[msg.sender] = Agent({
            agentAddress: agentAddress,
            scopeMask:    scopeMask,
            expiresAt:    expiresAt,
            active:       true
        });
        agentOf[agentAddress] = msg.sender;

        // 90% to protocol treasury, 10% burned (sent to zero)
        protocolFeeBalance += (msg.value * 90) / 100;

        emit AgentHired(msg.sender, agentAddress, scopeMask, expiresAt);
    }

    function dismissAgent() external {
        Agent storage a = agents[msg.sender];
        require(a.active, "No active agent");
        agentOf[a.agentAddress] = address(0);
        a.active = false;
        emit AgentDismissed(msg.sender, a.agentAddress);
    }

    /* ─────────── VIEWS ─────────── */

    function getBaseState(address player)
        external
        view
        returns (uint32 walls, uint32 water, uint32 food, uint64 lastTend, uint32 streak, uint32 longestStreak)
    {
        Base storage b = bases[player];
        return (b.walls, b.water, b.food, b.lastTend, b.streak, b.longestStreak);
    }

    function getAgentStatus(address player)
        external
        view
        returns (bool active, address agentAddress, uint8 scopeMask, uint64 expiresAt)
    {
        Agent storage a = agents[player];
        bool isActive = a.active && block.timestamp < a.expiresAt;
        return (isActive, a.agentAddress, a.scopeMask, a.expiresAt);
    }

    function hoursUntilDecay(address player) external view returns (uint256) {
        Base storage b = bases[player];
        if (!b.initialized) return 0;
        uint256 elapsed = block.timestamp - b.lastDecay;
        if (elapsed >= DECAY_INTERVAL) return 0;
        return (DECAY_INTERVAL - elapsed) / 1 hours;
    }

    /* ─────────── INTERNAL ─────────── */

    function _applyDecay(address player) internal {
        Base storage b = bases[player];
        if (!b.initialized) return;

        uint256 intervals = (block.timestamp - b.lastDecay) / DECAY_INTERVAL;
        if (intervals == 0) return;

        uint256 totalDecay = intervals * DECAY_AMOUNT;

        b.walls = uint32(b.walls > totalDecay ? b.walls - totalDecay : 0);
        b.water = uint32(b.water > totalDecay ? b.water - totalDecay : 0);
        b.food  = uint32(b.food  > totalDecay ? b.food  - totalDecay : 0);
        b.lastDecay = uint64(b.lastDecay + intervals * DECAY_INTERVAL);

        emit BaseDecayed(player, b.walls, b.water, b.food);
    }

    function _isAuthorizedAgent(address player, uint8 scope) internal view returns (bool) {
        address p = agentOf[msg.sender];
        if (p != player) return false;
        Agent storage a = agents[player];
        return a.active
            && block.timestamp < a.expiresAt
            && (a.scopeMask & scope) != 0;
    }

    function _resolvePlayer(address actor) internal view returns (address) {
        address p = agentOf[actor];
        return p != address(0) ? p : actor;
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /* ─────────── ADMIN ─────────── */

    function withdrawFees() external onlyOwner {
        uint256 amount = protocolFeeBalance;
        protocolFeeBalance = 0;
        payable(owner()).transfer(amount);
    }

    receive() external payable {}
}
