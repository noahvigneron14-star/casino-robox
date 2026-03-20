import { useState, useEffect, useRef } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { CircleDashed } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const ROWS = 8;
const MULTIPLIERS = [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];

type Ball = {
  id: number;
  row: number;
  col: number;
  path: number[];
  done: boolean;
  finalSlot: number;
};

export default function PlinkoGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  const [wager, setWager] = useState(10);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [lastResult, setLastResult] = useState<{ mult: number; win: number } | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const ballIdRef = useRef(0);

  const dropBall = () => {
    if (isDropping || wager <= 0 || wager > balance) return;
    if (!deductBalance(wager)) return;

    setIsDropping(true);
    setLastResult(null);

    // Generate ball path (left=0, right=1 at each row)
    const path: number[] = [];
    for (let i = 0; i < ROWS; i++) {
      path.push(Math.random() > 0.5 ? 1 : 0);
    }

    // Calculate final slot (0 = leftmost)
    const finalSlot = path.reduce((acc, v) => acc + v, 0);
    const mult = MULTIPLIERS[finalSlot];

    const newBall: Ball = {
      id: ++ballIdRef.current,
      row: 0,
      col: Math.floor(ROWS / 2), // Start center
      path,
      done: false,
      finalSlot,
    };

    setBalls((prev) => [...prev, newBall]);

    // Animate ball through rows
    let currentRow = 0;
    const interval = setInterval(() => {
      currentRow++;
      if (currentRow > ROWS) {
        clearInterval(interval);
        setBalls((prev) =>
          prev.map((b) => (b.id === newBall.id ? { ...b, done: true, row: ROWS + 1 } : b))
        );
        // Record result
        recordGameResult("Plinko", wager, mult);
        if (mult >= 3) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ["#7c3aed", "#f59e0b"] });
        }
        setLastResult({ mult, win: wager * mult });
        setIsDropping(false);
        // Clean up ball after delay
        setTimeout(() => {
          setBalls((prev) => prev.filter((b) => b.id !== newBall.id));
        }, 2000);
      } else {
        setBalls((prev) =>
          prev.map((b) =>
            b.id === newBall.id ? { ...b, row: currentRow } : b
          )
        );
      }
    }, 200);
  };

  // Calculate ball position in grid
  const getBallPosition = (ball: Ball) => {
    const col = ball.path.slice(0, ball.row).reduce((acc, v) => acc + v, 0);
    return col;
  };

  const SLOT_COLORS = [
    "bg-amber-500", "bg-amber-400/80", "bg-slate-500/60", "bg-slate-500/40",
    "bg-slate-600/40", "bg-slate-500/40", "bg-slate-500/60", "bg-amber-400/80", "bg-amber-500"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <CircleDashed className="w-8 h-8 text-blue-500" /> Plinko
        </h1>
        <AnimatePresence>
          {lastResult && (
            <motion.div
              key={lastResult.mult}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                lastResult.mult >= 3 ? "bg-amber-500/20 border-amber-500/50 text-amber-400" :
                lastResult.mult >= 1 ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                "bg-red-500/20 border-red-500/50 text-red-400"
              }`}
            >
              {lastResult.mult}x — {lastResult.win >= wager ? "+" : ""}{formatCurrency(lastResult.win - wager)} FC
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plinko Board */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="relative" style={{ height: `${(ROWS + 2) * 48}px` }}>
            {/* Pegs */}
            {Array.from({ length: ROWS }, (_, row) => (
              <div key={row} className="absolute w-full flex justify-center" style={{ top: `${(row + 1) * 48}px` }}>
                <div className="flex gap-0" style={{ gap: `${100 / (row + 2)}%` }}>
                  {Array.from({ length: row + 2 }, (_, peg) => (
                    <div
                      key={peg}
                      className="w-3 h-3 rounded-full bg-slate-500/70 border border-slate-400/30"
                      style={{ marginLeft: peg === 0 ? `${(ROWS - row - 1) * 24}px` : "0" }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Animated Balls */}
            {balls.map((ball) => {
              const currentCol = getBallPosition(ball);
              const xOffset = (currentCol - ball.row / 2) * 48 + (ROWS / 2) * 48;
              const yOffset = ball.row * 48 + 24;

              return (
                <motion.div
                  key={ball.id}
                  animate={{ x: xOffset, y: yOffset }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/50 border-2 border-primary-foreground/30"
                  style={{ left: "calc(50% - 10px)", top: 0 }}
                />
              );
            })}

            {/* Multiplier Slots */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {MULTIPLIERS.map((m, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg mx-0.5 ${SLOT_COLORS[i]} ${
                    m >= 3 ? "text-amber-100" : m >= 1 ? "text-slate-200" : "text-slate-400"
                  }`}
                >
                  {m}x
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5 font-medium">Bet Amount</label>
            <input
              type="number"
              value={wager}
              onChange={(e) => setWager(Math.max(1, Number(e.target.value)))}
              disabled={isDropping}
              className="w-full bg-input/60 border border-border rounded-xl px-4 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <div className="flex gap-1 mt-2">
              {[10, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setWager(v)}
                  disabled={isDropping}
                  className="flex-1 text-xs bg-muted hover:bg-primary/20 hover:text-primary rounded-lg py-1.5 font-bold transition-colors disabled:opacity-40"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Max Multiplier</p>
            <p className="text-3xl font-display font-black text-amber-400">13x</p>
          </div>

          <div className="space-y-1 text-xs">
            {MULTIPLIERS.map((m, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>{m}x</span>
                <span>{formatCurrency(wager * m)} FC</span>
              </div>
            ))}
          </div>

          <Button
            onClick={dropBall}
            disabled={isDropping || wager > balance}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-40"
          >
            {isDropping ? "Dropping..." : "Drop Ball"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Balance: {formatCurrency(balance)} FC
          </div>
        </div>
      </div>
    </div>
  );
}
