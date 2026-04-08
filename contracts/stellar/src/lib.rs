//! Gog & Magog — Onchain Survival (Stellar Soroban)
//!
//! Mirror of the Celo contract, implemented as a Soroban smart contract.
//! Players tend their base daily; agents are separate Stellar keypairs
//! authorized through Soroban's contract-level auth system.

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol,
    symbol_short, vec, log, panic_with_error,
};

/* ─────────── CONSTANTS ─────────── */

const DECAY_LEDGERS: u64        = 17280; // ~24h at 5s/ledger
const DECAY_AMOUNT: u32         = 8;
const MAX_RESOURCE: u32         = 100;
const TEND_RESTORE: u32         = 15;
const SCAVENGE_FOOD: u32        = 22;
const SCAVENGE_WATER: u32       = 12;
const REINFORCE_WALLS: u32      = 30;

/* ─────────── SCOPE BITMASK ─────────── */

pub const SCOPE_TEND:      u8 = 1 << 0;
pub const SCOPE_SCAVENGE:  u8 = 1 << 1;
pub const SCOPE_REINFORCE: u8 = 1 << 2;
pub const SCOPE_RAID:      u8 = 1 << 3;

/* ─────────── STORAGE KEYS ─────────── */

#[contracttype]
pub enum DataKey {
    Base(Address),
    Agent(Address),      // player -> AgentConfig
    AgentOf(Address),    // agent_address -> player address
}

/* ─────────── DATA TYPES ─────────── */

#[contracttype]
#[derive(Clone)]
pub struct BaseState {
    pub walls:          u32,
    pub water:          u32,
    pub food:           u32,
    pub last_tend:      u64,  // ledger number
    pub last_decay:     u64,
    pub streak:         u32,
    pub longest_streak: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct AgentConfig {
    pub agent_address:  Address,
    pub scope_mask:     u8,
    pub expires_ledger: u64,
    pub active:         bool,
}

/* ─────────── CONTRACT ─────────── */

#[contract]
pub struct GogAndMagog;

#[contractimpl]
impl GogAndMagog {

    /* ── INITIALISE ── */

    pub fn init_base(env: Env, player: Address) {
        player.require_auth();
        let key = DataKey::Base(player.clone());
        if env.storage().persistent().has(&key) {
            panic!("Base already initialized");
        }
        let base = BaseState {
            walls:          80,
            water:          80,
            food:           80,
            last_tend:      env.ledger().sequence() as u64,
            last_decay:     env.ledger().sequence() as u64,
            streak:         0,
            longest_streak: 0,
        };
        env.storage().persistent().set(&key, &base);
    }

    /* ── TEND BASE ── */

    pub fn tend_base(env: Env, actor: Address) {
        actor.require_auth();
        let player = Self::resolve_player(&env, &actor);
        Self::apply_decay(&env, &player);

        let key = DataKey::Base(player.clone());
        let mut base: BaseState = env.storage().persistent()
            .get(&key).expect("Base not initialized");

        base.walls = (base.walls + TEND_RESTORE).min(MAX_RESOURCE);
        base.water = (base.water + TEND_RESTORE).min(MAX_RESOURCE);
        base.food  = (base.food  + TEND_RESTORE).min(MAX_RESOURCE);

        let current_ledger = env.ledger().sequence() as u64;
        let gap = current_ledger.saturating_sub(base.last_tend);
        if gap <= DECAY_LEDGERS * 2 {
            base.streak += 1;
        } else {
            base.streak = 1;
        }
        if base.streak > base.longest_streak {
            base.longest_streak = base.streak;
        }
        base.last_tend = current_ledger;

        env.storage().persistent().set(&key, &base);

        env.events().publish(
            (symbol_short!("tend"), player),
            base.streak,
        );
    }

    /* ── SCAVENGE ── */

    pub fn scavenge(env: Env, actor: Address) {
        actor.require_auth();
        let player = Self::resolve_player(&env, &actor);
        Self::apply_decay(&env, &player);

        let key = DataKey::Base(player.clone());
        let mut base: BaseState = env.storage().persistent()
            .get(&key).expect("Base not initialized");

        base.food  = (base.food  + SCAVENGE_FOOD).min(MAX_RESOURCE);
        base.water = (base.water + SCAVENGE_WATER).min(MAX_RESOURCE);

        env.storage().persistent().set(&key, &base);
        env.events().publish((symbol_short!("scavenge"), player), ());
    }

    /* ── REINFORCE WALLS ── */

    pub fn reinforce_walls(env: Env, actor: Address) {
        actor.require_auth();
        let player = Self::resolve_player(&env, &actor);
        Self::apply_decay(&env, &player);

        let key = DataKey::Base(player.clone());
        let mut base: BaseState = env.storage().persistent()
            .get(&key).expect("Base not initialized");

        base.walls = (base.walls + REINFORCE_WALLS).min(MAX_RESOURCE);
        env.storage().persistent().set(&key, &base);

        env.events().publish((symbol_short!("reinforce"), player), base.walls);
    }

    /* ── RAID ── */

    pub fn raid_base(env: Env, actor: Address, target: Address) {
        actor.require_auth();
        let attacker = Self::resolve_player(&env, &actor);
        assert!(attacker != target, "Cannot raid yourself");

        Self::apply_decay(&env, &attacker);
        Self::apply_decay(&env, &target);

        let a_key = DataKey::Base(attacker.clone());
        let t_key = DataKey::Base(target.clone());

        let mut a_base: BaseState = env.storage().persistent()
            .get(&a_key).expect("Attacker base not initialized");
        let mut t_base: BaseState = env.storage().persistent()
            .get(&t_key).expect("Target base not initialized");

        assert!(a_base.walls > 20, "Walls too low to raid");

        let damage = (5u32 + a_base.streak).min(25);
        t_base.walls = t_base.walls.saturating_sub(damage);
        a_base.walls = a_base.walls.saturating_sub(3);

        env.storage().persistent().set(&a_key, &a_base);
        env.storage().persistent().set(&t_key, &t_base);

        env.events().publish(
            (symbol_short!("raid"), attacker.clone(), target.clone()),
            damage,
        );
    }

    /* ── HIRE AGENT ── */

    /// Authorize an agent keypair to act on the player's behalf.
    /// scope_mask is a bitmask of SCOPE_* constants.
    /// duration_ledgers determines how long the agent is authorized.
    pub fn hire_agent(
        env:              Env,
        player:           Address,
        agent_address:    Address,
        scope_mask:       u8,
        duration_ledgers: u64,
    ) {
        player.require_auth();
        assert!(duration_ledgers > 0 && duration_ledgers <= 17280 * 365, "Bad duration");
        assert!(agent_address != player, "Cannot agent yourself");

        let expires = env.ledger().sequence() as u64 + duration_ledgers;

        // Deregister old agent if active
        let old_key = DataKey::Agent(player.clone());
        if let Some(old_cfg) = env.storage().persistent()
            .get::<DataKey, AgentConfig>(&old_key)
        {
            if old_cfg.active {
                env.storage().persistent()
                    .remove(&DataKey::AgentOf(old_cfg.agent_address));
            }
        }

        let cfg = AgentConfig {
            agent_address: agent_address.clone(),
            scope_mask,
            expires_ledger: expires,
            active: true,
        };

        env.storage().persistent().set(&DataKey::Agent(player.clone()), &cfg);
        env.storage().persistent().set(&DataKey::AgentOf(agent_address.clone()), &player);

        env.events().publish(
            (symbol_short!("hire"), player),
            (agent_address, scope_mask, expires),
        );
    }

    /* ── DISMISS AGENT ── */

    pub fn dismiss_agent(env: Env, player: Address) {
        player.require_auth();
        let key = DataKey::Agent(player.clone());
        let mut cfg: AgentConfig = env.storage().persistent()
            .get(&key).expect("No agent");
        env.storage().persistent().remove(&DataKey::AgentOf(cfg.agent_address.clone()));
        cfg.active = false;
        env.storage().persistent().set(&key, &cfg);
        env.events().publish((symbol_short!("dismiss"), player), ());
    }

    /* ── VIEWS ── */

    pub fn get_base(env: Env, player: Address) -> BaseState {
        env.storage().persistent()
            .get(&DataKey::Base(player))
            .expect("Base not initialized")
    }

    pub fn get_agent(env: Env, player: Address) -> Option<AgentConfig> {
        env.storage().persistent().get(&DataKey::Agent(player))
    }

    pub fn ledgers_until_decay(env: Env, player: Address) -> u64 {
        let base: BaseState = env.storage().persistent()
            .get(&DataKey::Base(player))
            .expect("Base not initialized");
        let current = env.ledger().sequence() as u64;
        let elapsed = current.saturating_sub(base.last_decay);
        if elapsed >= DECAY_LEDGERS { 0 } else { DECAY_LEDGERS - elapsed }
    }

    /* ── INTERNAL ── */

    fn apply_decay(env: &Env, player: &Address) {
        let key = DataKey::Base(player.clone());
        let maybe_base = env.storage().persistent()
            .get::<DataKey, BaseState>(&key);
        let Some(mut base) = maybe_base else { return };

        let current = env.ledger().sequence() as u64;
        let intervals = current.saturating_sub(base.last_decay) / DECAY_LEDGERS;
        if intervals == 0 { return }

        let total = (intervals * DECAY_AMOUNT as u64) as u32;
        base.walls = base.walls.saturating_sub(total);
        base.water = base.water.saturating_sub(total);
        base.food  = base.food.saturating_sub(total);
        base.last_decay += intervals * DECAY_LEDGERS;

        env.storage().persistent().set(&key, &base);
        env.events().publish(
            (symbol_short!("decay"), player.clone()),
            (base.walls, base.water, base.food),
        );
    }

    fn resolve_player(env: &Env, actor: &Address) -> Address {
        env.storage().persistent()
            .get::<DataKey, Address>(&DataKey::AgentOf(actor.clone()))
            .unwrap_or_else(|| actor.clone())
    }

    fn check_scope(env: &Env, player: &Address, actor: &Address, scope: u8) {
        if actor == player { return }
        let cfg: AgentConfig = env.storage().persistent()
            .get(&DataKey::Agent(player.clone()))
            .expect("No agent configured");
        assert!(cfg.active, "Agent not active");
        assert!(
            env.ledger().sequence() as u64 <= cfg.expires_ledger,
            "Agent expired"
        );
        assert!((cfg.scope_mask & scope) != 0, "Scope not permitted");
    }
}
