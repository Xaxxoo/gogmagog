"use client";
import { useEffect, useRef, useState } from "react";

export default function GameScene({
  wallHealth = 19,
  waterLevel = 38,
  foodLevel  = 74,
  lastAction = "",
}: {
  wallHealth?: number;
  waterLevel?: number;
  foodLevel?:  number;
  lastAction?: string;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  const legOffset = (tick % 2 === 0) ? 3 : -3;

  // Enemies advance as walls crumble
  const enemyAdvance =
    wallHealth < 15 ? 180 :
    wallHealth < 30 ? 110 :
    wallHealth < 50 ? 55  : 0;

  // Flash green briefly after tending
  const isTending = lastAction === "tend";
  // Pulse speed for fire — faster when more damaged
  const fireSpeed = wallHealth < 30 ? 0.9 : 0.5;

  return (
    <div className="w-full relative" style={{ aspectRatio: "16/9", maxHeight: 540 }}>
      <svg width="100%" viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4c878" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d4c878" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fireGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e07020" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e07020" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fireGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e03020" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e03020" stopOpacity="0" />
          </radialGradient>
          <clipPath id="sceneClip">
            <rect width="960" height="540" />
          </clipPath>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <g clipPath="url(#sceneClip)">

        {/* ── SKY ─────────────────────────────── */}
        <rect width="960" height="540" fill="#070504"/>
        <rect width="960" height="300" fill="#0d0a06"/>

        {/* Horizon haze */}
        <rect x="0" y="210" width="960" height="80" fill="#1a0e05" opacity="0.7"/>

        {/* Moon glow */}
        <circle cx="820" cy="70" r="90" fill="url(#moonGlow)"/>
        <circle cx="820" cy="70" r="36" fill="#ccc070"/>
        <circle cx="831" cy="63" r="28" fill="#0d0a06"/>

        {/* Stars */}
        {[[60,25],[130,48],[190,18],[280,35],[380,22],[450,55],[520,14],[640,40],[700,28],[760,50],[880,18],[920,42],[100,72],[340,60],[580,68]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%3===0?2:1.2} fill="#e8dfc8" opacity={0.3+0.4*(i%3)/3}/>
        ))}

        {/* Distant mountains / ruins */}
        <polygon points="0,200 60,140 110,180 170,120 230,160 290,110 350,155 410,105 470,150 530,115 580,160 640,108 700,155 760,118 820,152 880,112 960,148 960,300 0,300" fill="#130f08"/>
        <polygon points="0,230 80,175 150,200 240,165 320,195 420,158 500,188 600,162 680,192 780,165 860,190 960,168 960,300 0,300" fill="#1a1208"/>

        {/* ── GROUND ─────────────────────────── */}
        <rect x="0" y="290" width="960" height="250" fill="#1e1508"/>

        {/* Ground texture layers */}
        <rect x="0" y="290" width="960" height="30" fill="#251b0c"/>
        <rect x="0" y="460" width="960" height="80" fill="#160e05"/>

        {/* Ground cracks */}
        {[[100,320,170,355],[300,340,380,310],[500,360,560,395],[720,315,800,350],[150,420,230,445],[600,410,680,440]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a1e0a" strokeWidth="1"/>
        ))}

        {/* Dead trees */}
        <rect x="58" y="255" width="6" height="80" fill="#2a1c0a"/>
        <line x1="61" y1="275" x2="38" y2="255" stroke="#2a1c0a" strokeWidth="3"/>
        <line x1="61" y1="285" x2="82" y2="265" stroke="#2a1c0a" strokeWidth="3"/>
        <line x1="61" y1="298" x2="34" y2="285" stroke="#2a1c0a" strokeWidth="2"/>
        <rect x="900" y="258" width="6" height="80" fill="#2a1c0a"/>
        <line x1="903" y1="272" x2="924" y2="253" stroke="#2a1c0a" strokeWidth="3"/>
        <line x1="903" y1="283" x2="882" y2="265" stroke="#2a1c0a" strokeWidth="2.5"/>
        <line x1="903" y1="296" x2="926" y2="282" stroke="#2a1c0a" strokeWidth="2"/>

        {/* Scattered bones / debris */}
        <ellipse cx="110" cy="370" rx="15" ry="4" fill="#3a2c14" opacity="0.8"/>
        <ellipse cx="820" cy="380" rx="18" ry="4" fill="#3a2c14" opacity="0.7"/>
        <rect x="700" y="400" width="20" height="4" rx="2" fill="#3a2c14" opacity="0.6"/>
        <rect x="715" y="396" width="4" height="12" rx="2" fill="#3a2c14" opacity="0.6"/>

        {/* ── CITADEL WALLS ──────────────────── */}
        {/* BACK/INNER structure */}
        <rect x="240" y="240" width="480" height="200" fill="#2e2010" rx="2"/>

        {/* Right wall (DAMAGED) */}
        <rect x="660" y="255" width="22" height="185" fill="#5a3c18"/>
        <rect x="658" y="253" width="8" height="185" fill="#7a5428"/>
        {/* Cracks right wall */}
        <polyline points="665,280 663,300 668,322 662,345 666,368" fill="none" stroke="#1e1508" strokeWidth="2.5"/>
        <polyline points="672,290 674,315 670,338" fill="none" stroke="#1e1508" strokeWidth="1.5"/>
        {/* Missing chunk right */}
        <rect x="660" y="320" width="22" height="24" fill="#1e1508"/>
        <rect x="660" y="368" width="22" height="20" fill="#1e1508"/>
        {/* Rubble right */}
        <polygon points="660,388 672,400 682,395 672,388" fill="#3a2810"/>
        <polygon points="662,404 670,412 678,408 668,402" fill="#3a2810"/>

        {/* Left wall (intact but weathered) */}
        <rect x="278" y="255" width="22" height="185" fill="#5a3c18"/>
        <rect x="296" y="253" width="8" height="185" fill="#7a5428"/>
        <polyline points="284,300 282,325 286,350" fill="none" stroke="#1e1508" strokeWidth="2"/>

        {/* BOTTOM WALL */}
        <rect x="278" y="430" width="404" height="18" fill="#6a4820" rx="2"/>
        <rect x="278" y="428" width="404" height="7" fill="#8a6030"/>
        {/* Battlements bottom */}
        {Array.from({length:14}).map((_,i)=>(
          <rect key={i} x={286+i*28} y={420} width={16} height={12} rx="1" fill="#6a4820"/>
        ))}

        {/* TOP WALL — with BREACH */}
        <rect x="278" y="252" width="145" height="18" fill="#6a4820" rx="2"/>
        <rect x="278" y="250" width="145" height="7" fill="#8a6030"/>
        {/* Battlements top-left */}
        {Array.from({length:5}).map((_,i)=>(
          <rect key={i} x={286+i*28} y={242} width={16} height={12} rx="1" fill="#6a4820"/>
        ))}

        {/* BREACH GAP in top wall */}
        <rect x="423" y="248" width="96" height="22" fill="#1e1508"/>
        {/* Breach crumble edges */}
        <polygon points="423,248 435,258 423,270" fill="#3a2810"/>
        <polygon points="519,248 507,258 519,270" fill="#3a2810"/>
        {/* Breach warning */}
        <rect x="448" y="228" width="46" height="16" rx="3" fill="#5a0a0a" opacity="0.9"/>
        <text x="471" y="240" textAnchor="middle" fill="#e04040" fontSize="9" fontFamily="'Share Tech Mono'" fontWeight="bold">BREACH</text>

        {/* Top wall right — also damaged */}
        <rect x="519" y="252" width="143" height="18" fill="#6a4820" rx="2"/>
        <rect x="519" y="250" width="143" height="7" fill="#8a6030"/>
        {Array.from({length:5}).map((_,i)=>(
          <rect key={i} x={527+i*27} y={242} width={15} height={12} rx="1" fill={i===3?"#1e1508":"#6a4820"}/>
        ))}

        {/* ── INTERIOR ───────────────────────── */}
        <rect x="300" y="270" width="360" height="160" fill="#2a1c0e"/>

        {/* Inner courtyard ground detail */}
        <rect x="300" y="390" width="360" height="15" fill="#241808"/>
        {Array.from({length:18}).map((_,i)=>(
          <line key={i} x1={300+i*20} y1={390} x2={304+i*20} y2={405} stroke="#1a1008" strokeWidth="1"/>
        ))}

        {/* COMMAND TOWER — center */}
        <rect x="390" y="278" width="180" height="115" fill="#4a3018" rx="3"/>
        <rect x="388" y="275" width="184" height="10" rx="2" fill="#6a4828"/>
        {/* Tower crenellations */}
        {Array.from({length:9}).map((_,i)=>(
          <rect key={i} x={392+i*20} y={264} width={12} height={13} rx="1" fill="#5a3c20"/>
        ))}
        {/* Windows with warm light */}
        <rect x="408" y="295" width="28" height="20" rx="2" fill="#c87820" opacity="0.9"/>
        <rect x="410" y="297" width="12" height="18" rx="1" fill="#e09030" opacity="0.6"/>
        <rect x="524" y="295" width="28" height="20" rx="2" fill="#c87820" opacity="0.9"/>
        <rect x="526" y="297" width="12" height="18" rx="1" fill="#e09030" opacity="0.6"/>
        {/* Window glow on ground */}
        <ellipse cx="422" cy="318" rx="20" ry="5" fill="#e07020" opacity="0.12"/>
        <ellipse cx="538" cy="318" rx="20" ry="5" fill="#e07020" opacity="0.12"/>
        {/* Door */}
        <rect x="462" y="352" width="36" height="41" rx="3" fill="#2a1808"/>
        <path d="M462,352 Q480,340 498,352" fill="#2a1808"/>
        <circle cx="494" cy="373" r="3" fill="#c87820"/>
        {/* Door light spill */}
        <ellipse cx="480" cy="395" rx="14" ry="4" fill="#e07020" opacity="0.15"/>

        {/* Watch Tower left */}
        <rect x="308" y="278" width="46" height="98" fill="#4a3018" rx="2"/>
        <rect x="306" y="275" width="50" height="9" rx="1" fill="#6a4828"/>
        {Array.from({length:4}).map((_,i)=>(
          <rect key={i} x={310+i*12} y={265} width={8} height={12} rx="1" fill="#5a3c20"/>
        ))}
        {/* Ladder */}
        <line x1="328" y1="285" x2="328" y2="370" stroke="#3a2810" strokeWidth="2"/>
        <line x1="340" y1="285" x2="340" y2="370" stroke="#3a2810" strokeWidth="2"/>
        {[295,308,321,334,347,360].map((y,i)=>(
          <line key={i} x1="328" y1={y} x2="340" y2={y} stroke="#3a2810" strokeWidth="1.5"/>
        ))}
        {/* Watch tower window */}
        <rect x="322" y="294" width="20" height="14" rx="1" fill="#c87820" opacity="0.7"/>

        {/* Storage shed right */}
        <rect x="606" y="295" width="44" height="70" fill="#3c2812" rx="2"/>
        <rect x="604" y="292" width="48" height="7" rx="1" fill="#5a3c18"/>
        <line x1="610" y1="300" x2="608" y2="360" stroke="#2a1808" strokeWidth="2"/>
        <line x1="622" y1="302" x2="620" y2="358" stroke="#2a1808" strokeWidth="1.5"/>
        {/* Crates */}
        <rect x="612" y="340" width="18" height="14" rx="1" fill="#5a3818"/>
        <rect x="614" y="338" width="14" height="4" rx="0" fill="#7a5028"/>
        <line x1="621" y1="338" x2="621" y2="354" stroke="#4a2c10" strokeWidth="1"/>

        {/* Torches on walls */}
        <rect x="296" y="382" width="4" height="12" rx="1" fill="#5a3c18"/>
        <ellipse cx="298" cy="381" rx="4" ry="6" fill="#e07020" opacity={0.7 + 0.3 * Math.sin(tick * 0.5)}/>
        <ellipse cx="298" cy="381" rx="6" ry="10" fill="#e04010" opacity={0.3 + 0.2 * Math.sin(tick * 0.5)}/>

        <rect x="660" y="382" width="4" height="12" rx="1" fill="#5a3c18"/>
        <ellipse cx="662" cy="381" rx="4" ry="6" fill="#e07020" opacity={0.7 + 0.3 * Math.cos(tick * 0.5)}/>
        <ellipse cx="662" cy="381" rx="6" ry="10" fill="#e04010" opacity={0.3 + 0.2 * Math.cos(tick * 0.5)}/>

        {/* Torch on breach edge */}
        <rect x="420" y="260" width="3" height="10" rx="1" fill="#5a3c18"/>
        <ellipse cx="421" cy="259" rx="3" ry="5" fill="#e07020" opacity={0.6 + 0.3 * Math.sin(tick * 0.7)}/>

        {/* ── PLAYER CHARACTER ──────────────── */}
        <g transform={`translate(476, 380)`}>
          {/* Shadow */}
          <ellipse cx="4" cy="20" rx="10" ry="3" fill="#0a0805" opacity="0.6"/>
          {/* Legs */}
          <rect x={-1+legOffset/3} y="12" width="4" height="9" rx="1" fill="#2a4018"/>
          <rect x={5-legOffset/3} y="12" width="4" height="9" rx="1" fill="#2a4018"/>
          {/* Body / armor */}
          <rect x="-3" y="3" width="14" height="11" rx="2" fill="#3a5828"/>
          {/* Shoulder pads */}
          <rect x="-5" y="3" width="6" height="5" rx="1" fill="#4a6a32"/>
          <rect x="7" y="3" width="6" height="5" rx="1" fill="#4a6a32"/>
          {/* Head */}
          <circle cx="4" cy="0" r="7" fill="#c89060"/>
          {/* Helmet */}
          <rect x="-2" y="-7" width="12" height="8" rx="3" fill="#4a6a32"/>
          <rect x="0" y="-8" width="8" height="3" rx="1" fill="#5a8040"/>
          {/* Eyes */}
          <circle cx="1" cy="-1" r="1.5" fill="#1a1008"/>
          <circle cx="7" cy="-1" r="1.5" fill="#1a1008"/>
          {/* Sword */}
          <rect x="14" y="-2" width="3" height="18" rx="1" fill="#a08840"/>
          <rect x="11" y="3" width="9" height="3" rx="1" fill="#7a6030"/>
        </g>

        {/* ── GOG RODENT HORDE — RIGHT FLANK ── */}
        {/* RODENT 1 — giant war-rat (closest) */}
        <g transform={`translate(${790 - enemyAdvance + (tick%2===0?0:-2)}, 340) scale(-1, 1)`}>
          <ellipse cx="0" cy="20" rx="14" ry="4" fill="#0a0805" opacity="0.5"/>
          {/* Haunched body */}
          <ellipse cx="0" cy="8" rx="22" ry="15" fill="#5c4030"/>
          {/* Head */}
          <ellipse cx="20" cy="2" rx="16" ry="13" fill="#6a4a38"/>
          {/* LARGE EARS */}
          <ellipse cx="30" cy="-14" rx="8" ry="14" fill="#7a5848" transform="rotate(15,30,-14)"/>
          <ellipse cx="30" cy="-14" rx="5" ry="10" fill="#b04060" transform="rotate(15,30,-14)" opacity="0.7"/>
          <ellipse cx="14" cy="-16" rx="7" ry="12" fill="#7a5848" transform="rotate(-10,14,-16)"/>
          <ellipse cx="14" cy="-16" rx="4" ry="8" fill="#b04060" transform="rotate(-10,14,-16)" opacity="0.7"/>
          {/* Snout */}
          <ellipse cx="34" cy="5" rx="8" ry="6" fill="#8a6050"/>
          <circle cx="37" cy="4" r="2" fill="#2a1808"/>
          <circle cx="33" cy="4" r="2" fill="#2a1808"/>
          {/* Whiskers */}
          <line x1="34" y1="6" x2="56" y2="2" stroke="#c8a880" strokeWidth="0.8" opacity="0.7"/>
          <line x1="34" y1="7" x2="56" y2="10" stroke="#c8a880" strokeWidth="0.8" opacity="0.7"/>
          <line x1="34" y1="6" x2="56" y2="-2" stroke="#c8a880" strokeWidth="0.8" opacity="0.7"/>
          {/* Red eyes — glowing */}
          <circle cx="26" cy="-2" r="4" fill="#8b1a1a"/>
          <circle cx="26" cy="-2" r="2.5" fill="#e04040"/>
          <circle cx="27" cy="-3" r="1" fill="#ffaaaa"/>
          {/* Crude weapon — bone club */}
          <rect x="36" y="-8" width="4" height="22" rx="2" fill="#c8b870" transform="rotate(20,36,-8)"/>
          <ellipse cx="46" cy="-13" rx="7" ry="5" fill="#c8b870" transform="rotate(20,46,-13)"/>
          {/* Legs */}
          <rect x={-14+legOffset} y="18" width="7" height="10" rx="2" fill="#4a3020"/>
          <rect x={-4-legOffset} y="18" width="7" height="10" rx="2" fill="#4a3020"/>
          {/* Crude armor plate */}
          <rect x="-12" y="0" width="18" height="12" rx="2" fill="#3a2810" opacity="0.7"/>
          <line x1="-8" y1="0" x2="-8" y2="12" stroke="#5a3820" strokeWidth="1"/>
          <line x1="0" y1="0" x2="0" y2="12" stroke="#5a3820" strokeWidth="1"/>
          {/* Tail */}
          <path d="M-20,12 Q-38,22 -42,8 Q-46,-5 -34,-8" fill="none" stroke="#4a3020" strokeWidth="4" strokeLinecap="round"/>
        </g>

        {/* RODENT 2 — slightly behind, smaller */}
        <g transform={`translate(${850 - enemyAdvance + (tick%2===0?-2:0)}, 360) scale(-1, 1)`}>
          <ellipse cx="0" cy="17" rx="12" ry="3" fill="#0a0805" opacity="0.5"/>
          <ellipse cx="0" cy="6" rx="18" ry="12" fill="#4a3428"/>
          <ellipse cx="16" cy="1" rx="14" ry="11" fill="#5a4030"/>
          {/* Large ears */}
          <ellipse cx="25" cy="-13" rx="7" ry="13" fill="#6a4840" transform="rotate(20,25,-13)"/>
          <ellipse cx="25" cy="-13" rx="4" ry="9" fill="#a03050" transform="rotate(20,25,-13)" opacity="0.7"/>
          <ellipse cx="11" cy="-14" rx="6" ry="11" fill="#6a4840" transform="rotate(-8,11,-14)"/>
          <ellipse cx="11" cy="-14" rx="3.5" ry="7" fill="#a03050" transform="rotate(-8,11,-14)" opacity="0.7"/>
          <ellipse cx="28" cy="4" rx="7" ry="5" fill="#7a5040"/>
          <circle cx="31" cy="3" r="1.8" fill="#1e1208"/>
          <circle cx="27" cy="3" r="1.8" fill="#1e1208"/>
          <line x1="28" y1="5" x2="48" y2="1" stroke="#c8a880" strokeWidth="0.7" opacity="0.6"/>
          <line x1="28" y1="6" x2="48" y2="9" stroke="#c8a880" strokeWidth="0.7" opacity="0.6"/>
          <circle cx="22" cy="-2" r="3.5" fill="#8b1a1a"/>
          <circle cx="22" cy="-2" r="2" fill="#e04040"/>
          {/* Spear */}
          <rect x="30" y="-18" width="3" height="26" rx="1" fill="#7a6030" transform="rotate(10,30,-18)"/>
          <polygon points="37,-22 40,-10 34,-10" fill="#909090" transform="rotate(10,37,-10)"/>
          <rect x={-12+legOffset} y="15" width="6" height="9" rx="2" fill="#3a2418"/>
          <rect x={-4-legOffset} y="15" width="6" height="9" rx="2" fill="#3a2418"/>
          <path d="M-18,10 Q-33,18 -36,6 Q-38,-4 -28,-6" fill="none" stroke="#3a2418" strokeWidth="3.5" strokeLinecap="round"/>
        </g>

        {/* RODENT 3 — leader, on crest of hill, bigger */}
        <g transform={`translate(${888 - enemyAdvance + (tick%2===0?0:-1)}, 305) scale(-1, 1)`}>
          <ellipse cx="0" cy="22" rx="16" ry="4" fill="#0a0805" opacity="0.4"/>
          <ellipse cx="0" cy="9" rx="26" ry="17" fill="#6a4838"/>
          <ellipse cx="22" cy="1" rx="19" ry="14" fill="#7a5848"/>
          {/* MASSIVE ears — leader */}
          <ellipse cx="34" cy="-18" rx="10" ry="18" fill="#8a6858" transform="rotate(18,34,-18)"/>
          <ellipse cx="34" cy="-18" rx="7" ry="13" fill="#c04878" transform="rotate(18,34,-18)" opacity="0.7"/>
          <ellipse cx="12" cy="-20" rx="9" ry="16" fill="#8a6858" transform="rotate(-12,12,-20)"/>
          <ellipse cx="12" cy="-20" rx="6" ry="11" fill="#c04878" transform="rotate(-12,12,-20)" opacity="0.7"/>
          {/* Crown / war helm */}
          <rect x="6" y="-12" width="22" height="12" rx="3" fill="#5a3010"/>
          {[10,17,24].map((x,i) => (
            <polygon key={i} points={`${x},-11 ${x+3},-19 ${x+6},-11`} fill="#7a4a18"/>
          ))}
          {/* Face */}
          <ellipse cx="38" cy="5" rx="10" ry="7" fill="#9a6858"/>
          <circle cx="43" cy="3" r="2.5" fill="#1a0a08"/>
          <circle cx="37" cy="3" r="2.5" fill="#1a0a08"/>
          <line x1="38" y1="7" x2="62" y2="2" stroke="#c8a880" strokeWidth="1" opacity="0.8"/>
          <line x1="38" y1="8" x2="62" y2="13" stroke="#c8a880" strokeWidth="1" opacity="0.8"/>
          <line x1="38" y1="7" x2="62" y2="-3" stroke="#c8a880" strokeWidth="1" opacity="0.7"/>
          {/* Glowing eyes — leader */}
          <circle cx="30" cy="-2" r="5" fill="#8b0a0a"/>
          <circle cx="30" cy="-2" r="3" fill="#e03030"/>
          <circle cx="31" cy="-3" r="1.2" fill="#ffcccc"/>
          {/* War scythe */}
          <rect x="42" y="-28" width="5" height="38" rx="2" fill="#5a4020" transform="rotate(5,42,-28)"/>
          <path d="M46,-32 Q68,-28 66,-14 Q64,-5 52,-8" fill="none" stroke="#909090" strokeWidth="3" strokeLinecap="round"/>
          {/* Legs */}
          <rect x={-16+legOffset} y="20" width="8" height="12" rx="2" fill="#4a2c18"/>
          <rect x={-4-legOffset} y="20" width="8" height="12" rx="2" fill="#4a2c18"/>
          {/* Cape */}
          <path d="M-22,0 Q-36,14 -38,28 L-18,24 Q-16,10 -6,2Z" fill="#5a0a0a" opacity="0.8"/>
          <path d="M-20,0 Q-34,14 -36,28 L-16,24 Q-14,10 -4,2Z" fill="#7a1010" opacity="0.5"/>
          {/* Body armor */}
          <rect x="-16" y="-2" width="22" height="14" rx="2" fill="#3a2208" opacity="0.8"/>
          {[[-12,0],[-4,0],[4,0]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y+7} r="2" fill="#7a5020"/>
          ))}
          {/* Tail */}
          <path d="M-24,14 Q-48,26 -54,10 Q-58,-5 -44,-10 Q-36,-13 -32,-6" fill="none" stroke="#4a2c18" strokeWidth="5" strokeLinecap="round"/>
        </g>

        {/* Attack path arrows — advance with enemies */}
        <line x1={784 - enemyAdvance} y1="360" x2={700 - enemyAdvance} y2="355" stroke="#e04040" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7"/>
        <polygon points={`${700 - enemyAdvance},352 ${692 - enemyAdvance},356 ${700 - enemyAdvance},360`} fill="#e04040" opacity="0.7"/>

        {/* ── MAGOG HORDE — LEFT (BREACH) ─── */}
        {/* Small rodents swarming through breach */}
        <g transform={`translate(${424 + (tick%2===0?1:-1)}, 200) scale(-1, 1)`}>
          <ellipse cx="0" cy="13" rx="8" ry="2.5" fill="#0a0805" opacity="0.5"/>
          <ellipse cx="0" cy="5" rx="13" ry="10" fill="#503828"/>
          <ellipse cx="11" cy="0" rx="11" ry="9" fill="#604030"/>
          <ellipse cx="20" cy="-11" rx="6" ry="10" fill="#604030" transform="rotate(15,20,-11)"/>
          <ellipse cx="20" cy="-11" rx="3.5" ry="7" fill="#a03060" transform="rotate(15,20,-11)" opacity="0.8"/>
          <ellipse cx="8" cy="-12" rx="5" ry="9" fill="#604030" transform="rotate(-10,8,-12)"/>
          <ellipse cx="8" cy="-12" rx="3" ry="6" fill="#a03060" transform="rotate(-10,8,-12)" opacity="0.8"/>
          <circle cx="17" cy="-2" r="3" fill="#8b1a1a"/>
          <circle cx="17" cy="-2" r="1.8" fill="#e04040"/>
          <ellipse cx="21" cy="3" rx="6" ry="4.5" fill="#7a5040"/>
          <line x1="21" y1="4" x2="36" y2="0" stroke="#c8a880" strokeWidth="0.7" opacity="0.6"/>
          <line x1="21" y1="5" x2="36" y2="8" stroke="#c8a880" strokeWidth="0.7" opacity="0.6"/>
          <rect x={-8+legOffset} y="11" width="5" height="8" rx="1.5" fill="#382010"/>
          <rect x={-2-legOffset} y="11" width="5" height="8" rx="1.5" fill="#382010"/>
          <path d="M-12,8 Q-22,14 -24,5 Q-26,-3 -18,-5" fill="none" stroke="#382010" strokeWidth="3" strokeLinecap="round"/>
        </g>

        {/* Second breach rodent */}
        <g transform={`translate(${455 + (tick%2===0?-1:1)}, 212) scale(-1, 1)`}>
          <ellipse cx="0" cy="11" rx="7" ry="2" fill="#0a0805" opacity="0.4"/>
          <ellipse cx="0" cy="4" rx="11" ry="8" fill="#453020"/>
          <ellipse cx="9" cy="0" rx="9" ry="7" fill="#554030"/>
          <ellipse cx="17" cy="-10" rx="5" ry="9" fill="#554030" transform="rotate(20,17,-10)"/>
          <ellipse cx="17" cy="-10" rx="3" ry="6" fill="#983060" transform="rotate(20,17,-10)" opacity="0.8"/>
          <ellipse cx="7" cy="-11" rx="4.5" ry="8" fill="#554030" transform="rotate(-8,7,-11)"/>
          <ellipse cx="7" cy="-11" rx="2.8" ry="5.5" fill="#983060" transform="rotate(-8,7,-11)" opacity="0.8"/>
          <circle cx="14" cy="-2" r="2.5" fill="#8b1a1a"/>
          <circle cx="14" cy="-2" r="1.5" fill="#e04040"/>
          <ellipse cx="17" cy="2" rx="5" ry="3.5" fill="#6a4030"/>
          <line x1="17" y1="3" x2="30" y2="0" stroke="#c8a880" strokeWidth="0.6" opacity="0.5"/>
          <line x1="17" y1="4" x2="30" y2="6" stroke="#c8a880" strokeWidth="0.6" opacity="0.5"/>
          <rect x={-7+legOffset} y="9" width="4" height="7" rx="1.5" fill="#301808"/>
          <rect x={-2-legOffset} y="9" width="4" height="7" rx="1.5" fill="#301808"/>
          <path d="M-10,6 Q-18,12 -20,4" fill="none" stroke="#301808" strokeWidth="2.5" strokeLinecap="round"/>
        </g>

        {/* Breach path arrow */}
        <line x1="468" y1="230" x2="468" y2="262" stroke="#e04040" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6"/>
        <polygon points="465,262 468,270 471,262" fill="#e04040" opacity="0.6"/>

        {/* ── FIRE / EXPLOSIONS ─────────────── */}
        {/* Fire near breach — right wall base */}
        <ellipse cx="668" cy="398" rx="16" ry="8" fill="#e07020" opacity={0.3 + 0.2 * Math.sin(tick)}/>
        <ellipse cx="668" cy="392" rx="10" ry="12" fill="#e05010" opacity={0.5 + 0.3 * Math.sin(tick * 1.3)}/>
        <ellipse cx="668" cy="385" rx="6" ry="10" fill="#f0a020" opacity={0.4 + 0.3 * Math.cos(tick * 1.1)}/>
        <ellipse cx="662" cy="400" rx="8" ry="5" fill="#e07020" opacity={0.4 + 0.2 * Math.cos(tick)}/>

        {/* Smoke particles rising */}
        <circle cx="668" cy={370 - (tick % 20) * 2} r="4" fill="#3a2810" opacity={0.5 - (tick % 20) * 0.02}/>
        <circle cx="672" cy={360 - (tick % 15) * 2} r="3" fill="#3a2810" opacity={0.4 - (tick % 15) * 0.025}/>

        {/* ── HUD OVERLAY ──────────────────── */}
        {/* Top bar */}
        <rect x="0" y="0" width="960" height="48" fill="#0a0805" opacity="0.85"/>
        <line x1="0" y1="48" x2="960" y2="48" stroke="#5a3c18" strokeWidth="0.5"/>

        {/* Logo */}
        <text x="20" y="17" fill="#e07020" fontSize="11" fontFamily="'Share Tech Mono'">GOG</text>
        <text x="20" y="33" fill="#c85800" fontSize="11" fontFamily="'Share Tech Mono'" fontWeight="bold">&amp; MAGOG</text>

        {/* Chain info */}
        <text x="480" y="17" textAnchor="middle" fill="#a09070" fontSize="9" fontFamily="'Share Tech Mono'">BLOCK 21,049,203</text>
        <text x="480" y="32" textAnchor="middle" fill="#7a5a28" fontSize="9" fontFamily="'Share Tech Mono'">CELO NETWORK  ·  CHAIN 42220</text>

        {/* Wallet */}
        <rect x="820" y="8" width="130" height="32" rx="3" fill="#1c1710" stroke="#5a3c18" strokeWidth="0.5"/>
        <text x="830" y="20" fill="#a09070" fontSize="8" fontFamily="'Share Tech Mono'">OWNER</text>
        <text x="830" y="33" fill="#e8dfc8" fontSize="9" fontFamily="'Share Tech Mono'">vitalik.eth</text>

        {/* ── RESOURCE BARS — bottom left ── */}
        <rect x="0" y="450" width="210" height="90" fill="#0a0805" opacity="0.9"/>
        <line x1="0" y1="450" x2="210" y2="450" stroke="#5a3c18" strokeWidth="0.5"/>

        {["WALLS","WATER","FOOD"].map((label, i) => {
          const vals = [wallHealth, waterLevel, foodLevel];
          const colors = ["#e04040","#EF9F27","#7ec850"];
          const v = vals[i];
          return (
            <g key={i} transform={`translate(14, ${460 + i * 26})`}>
              <text fill="#a09070" fontSize="8" fontFamily="'Share Tech Mono'" y="10">{label}</text>
              <rect x="44" y="2" width="110" height="6" rx="2" fill="#2a1808"/>
              <rect x="44" y="2" width={110 * v / 100} height="6" rx="2" fill={colors[i]}/>
              <text x="162" y="10" fill={colors[i]} fontSize="8" fontFamily="'Share Tech Mono'">{v}%</text>
            </g>
          );
        })}

        {/* ── DECAY TIMER — bottom right ── */}
        <rect x="750" y="450" width="210" height="90" fill="#0a0805" opacity="0.9"/>
        <line x1="750" y1="450" x2="960" y2="450" stroke="#5a3c18" strokeWidth="0.5"/>
        <text x="762" y="468" fill="#a09070" fontSize="8" fontFamily="'Share Tech Mono'">DECAY IN</text>
        <text x="762" y="493" fill="#e08020" fontSize="24" fontFamily="'Share Tech Mono'" fontWeight="bold">04:32</text>
        <text x="762" y="512" fill="#e04040" fontSize="8" fontFamily="'Share Tech Mono'">BREACH DETECTED · WALLS CRITICAL</text>

        {/* ── ACTION PROMPT — bottom center ── */}
        <rect x="350" y="510" width="260" height="24" rx="3" fill="#1c1708" stroke="#5a3c18" strokeWidth="0.5"/>
        <text x="480" y="526" textAnchor="middle" fill="#c87820" fontSize="9" fontFamily="'Share Tech Mono'" fontWeight="bold">[ E ] SIGN TX: TEND BASE</text>

        {/* ── CRITICAL RED VIGNETTE (walls < 30) ── */}
        {wallHealth < 30 && (
          <rect
            width="960" height="540"
            fill="none"
            stroke="#FF2020"
            strokeWidth="40"
            opacity={0.12 + (30 - wallHealth) * 0.004}
            style={{ filter: "blur(20px)" }}
          />
        )}

        {/* ── GREEN REPAIR FLASH (after tending) ── */}
        {isTending && (
          <rect
            width="960" height="540"
            fill="#00CC66"
            opacity="0.06"
          />
        )}

        </g>
      </svg>
    </div>
  );
}
