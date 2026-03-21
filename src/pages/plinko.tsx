import { useState, useRef, useEffect } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { CircleDashed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const ROWS = 8;
const MULTIPLIERS = [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];

const SVG_W = 560;
const SVG_H = 480;
const H_SPACING = 52;
const V_SPACING = 46;
const CENTER_X = SVG_W / 2;
const START_Y = 40;
const PEG_R = 5;
const BALL_R = 9;

type Waypoint = { x: number; y: number };

function getPegPosition(row: number, col: number): { x: number; y: number } {
  const x = CENTER_X - (row / 2) * H_SPACING + col * H_SPACING;
  const y = START_Y + (row + 1) * V_SPACING;
  return { x, y };
}

function getSlotX(slot: number): number {
  return CENTER_X - (ROWS / 2) * H_SPACING + slot * H_SPACING;
}

function computePath(choices: number[]): Waypoint[] {
  const waypoints: Waypoint[] = [{ x: CENTER_X, y: START_Y - 10 }];
  let col = 0;
  for (let r = 0; r < ROWS; r++) {
    const peg = getPegPosition(r, col);
    waypoints.push({ x: peg.x, y: peg.y - PEG_R - BALL_R });
    waypoints.push({ x: peg.x + (choices[r] === 1 ? 1 : -1) * (H_SPACING / 2), y: peg.y + PEG_R + BALL_R });
    if (choices[r] === 1) col++;
  }
  const finalX = getSlotX(col);
  waypoints.push({ x: finalX, y: SVG_H - 30 });
  return waypoints;
}

const SLOT_COLORS = [
  '#f59e0b', '#f59e0b80', '#64748b80', '#475569', '#334155',
  '#475569', '#64748b80', '#f59e0b80', '#f59e0b'
];

export default function PlinkoGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  const [wager, setWager] = useState(10);
  const [dropping, setDropping] = useState(false);
  const [ballPos, setBallPos] = useState<Waypoint | null>(null);
  const [finalSlot, setFinalSlot] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ mult: number; win: number } | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatFC = (n: number) => n.toFixed(2);

  const dropBall = () => {
    if (dropping || wager <= 0 || wager > balance) return;
    if (!deductBalance(wager)) return;

    setDropping(true);
    setFinalSlot(null);
    setLastResult(null);
    setActiveSlot(null);

    const choices = Array.from({ length: ROWS }, () => (Math.random() > 0.5 ? 1 : 0));
    const slot = choices.reduce((a, v) => a + v, 0);
    const mult = MULTIPLIERS[slot];
    const waypoints = computePath(choices);

    let i = 0;
    const step = () => {
      if (i >= waypoints.length) {
        setDropping(false);
        setFinalSlot(slot);
        setActiveSlot(slot);
        setLastResult({ mult, win: wager * mult });
        recordGameResult('Plinko', wager, mult);
        if (mult >= 3) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ['#f59e0b', '#7c3aed'] });
        }
        setTimeout(() => setActiveSlot(null), 2000);
        return;
      }
      setBallPos(waypoints[i]);
      i++;
      animRef.current = setTimeout(step, 100);
    };
    step();
  };

  useEffect(() => () => { if (animRef.current) clearTimeout(animRef.current); }, []);

  const allPegs: { x: number; y: number; key: string }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= r; c++) {
      const p = getPegPosition(r, c);
      allPegs.push({ ...p, key: `${r}-${c}` });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <CircleDashed className="w-8 h-8 text-blue-400" /> Plinko
        </h1>
        <AnimatePresence>
          {lastResult && (
            <motion.div
              key={lastResult.mult}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                lastResult.mult >= 3 ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                lastResult.mult >= 1 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                'bg-red-500/20 border-red-500/50 text-red-400'
              }`}
            >
              {lastResult.mult}x — {lastResult.win >= wager ? '+' : ''}{formatFC(lastResult.win - wager)} FC
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Board */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-4 flex items-center justify-center overflow-hidden">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full max-h-[480px]"
            style={{ maxWidth: SVG_W }}
          >
            {/* Background grid hint */}
            <defs>
              <radialGradient id="boardGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(124,58,237,0.03)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="url(#boardGrad)" rx="12" />

            {/* Pegs */}
            {allPegs.map(peg => (
              <circle
                key={peg.key}
                cx={peg.x}
                cy={peg.y}
                r={PEG_R}
                fill="rgba(148,163,184,0.7)"
                stroke="rgba(203,213,225,0.4)"
                strokeWidth={1}
              />
            ))}

            {/* Multiplier slots */}
            {MULTIPLIERS.map((m, i) => {
              const x = getSlotX(i);
              const isActive = activeSlot === i;
              const slotW = H_SPACING - 4;
              return (
                <g key={i}>
                  <rect
                    x={x - slotW / 2}
                    y={SVG_H - 44}
                    width={slotW}
                    height={32}
                    rx={6}
                    fill={SLOT_COLORS[i]}
                    opacity={isActive ? 1 : 0.85}
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${SLOT_COLORS[i]})` : undefined,
                      transition: 'all 0.3s'
                    }}
                  />
                  <text
                    x={x}
                    y={SVG_H - 22}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={m >= 10 ? 10 : 11}
                    fontWeight="bold"
                    fill={m >= 3 ? '#1c1917' : '#cbd5e1'}
                  >
                    {m}x
                  </text>
                </g>
              );
            })}

            {/* Ball */}
            {ballPos && (
              <motion.circle
                cx={ballPos.x}
                cy={ballPos.y}
                r={BALL_R}
                fill="#7c3aed"
                stroke="rgba(167,139,250,0.8)"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 6px #7c3aed)' }}
                animate={{ cx: ballPos.x, cy: ballPos.y }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5 font-medium">Mise</label>
            <input
              type="number"
              value={wager}
              min={1}
              onChange={e => setWager(Math.max(1, Number(e.target.value)))}
              disabled={dropping}
              className="w-full bg-input/60 border border-border rounded-xl px-4 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
            />
            <div className="flex gap-1 mt-2">
              {[10, 50, 100].map(v => (
                <button
                  key={v}
                  onClick={() => setWager(v)}
                  disabled={dropping}
                  className="flex-1 text-xs bg-muted hover:bg-primary/20 hover:text-primary rounded-lg py-1.5 font-bold transition-colors disabled:opacity-40"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Multiplier legend */}
          <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wide">Multiplicateurs</p>
            <div className="space-y-1">
              {MULTIPLIERS.map((m, i) => (
                <div key={i} className={`flex justify-between text-xs ${activeSlot === i ? 'text-amber-400 font-bold' : 'text-muted-foreground'}`}>
                  <span>{m}x</span>
                  <span>{(wager * m).toFixed(2)} FC</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={dropBall}
            disabled={dropping || wager > balance}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-40 shadow-lg shadow-blue-600/20"
          >
            {dropping ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                En vol...
              </span>
            ) : '🔵 Lancer la balle'}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Solde : {balance.toFixed(2)} FC
          </div>
        </div>
      </div>
    </div>
  );
}
