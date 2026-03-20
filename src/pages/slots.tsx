import { useState, useRef } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Gamepad2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const SYMBOLS = ["🍒", "🔔", "💎", "🍋", "⭐", "7️⃣"];
const SYMBOL_WEIGHTS = [4, 3, 2, 3, 2, 1]; // Lower weight = rarer
const SYMBOL_NAMES = ["Cherry", "Bell", "Diamond", "Lemon", "Star", "Seven"];

function weightedRandom(): number {
  const total = SYMBOL_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SYMBOL_WEIGHTS.length; i++) {
    r -= SYMBOL_WEIGHTS[i];
    if (r <= 0) return i;
  }
  return 0;
}

function calculateMultiplier(reels: number[]): number {
  const [a, b, c] = reels;
  if (a === b && b === c) {
    // Three of a kind
    const payouts = [2, 3, 5, 2, 8, 20];
    return payouts[a];
  }
  if (a === b || b === c || a === c) {
    // Pair
    return 1.2;
  }
  return 0;
}

const REEL_SIZE = 6;

export default function SlotsGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  const [wager, setWager] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelValues, setReelValues] = useState([0, 1, 2]);
  const [spinOffset, setSpinOffset] = useState([0, 0, 0]);
  const [result, setResult] = useState<{ mult: number; win: number } | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const spin = () => {
    if (isSpinning || wager <= 0 || wager > balance) return;
    if (!deductBalance(wager)) return;

    setIsSpinning(true);
    setResult(null);
    setSpinCount((c) => c + 1);

    const finalReels = [weightedRandom(), weightedRandom(), weightedRandom()];
    const mult = calculateMultiplier(finalReels);
    const winAmount = wager * mult;

    // Animate each reel stopping at different times
    [0, 1, 2].forEach((reelIdx) => {
      const delay = 800 + reelIdx * 400;
      const t = setTimeout(() => {
        setReelValues((prev) => {
          const next = [...prev];
          next[reelIdx] = finalReels[reelIdx];
          return next;
        });
        setSpinOffset((prev) => {
          const next = [...prev];
          next[reelIdx] = Math.floor(Math.random() * REEL_SIZE) * 100;
          return next;
        });

        if (reelIdx === 2) {
          // All done
          setTimeout(() => {
            setIsSpinning(false);
            recordGameResult("Slots", wager, mult);
            setResult({ mult, win: winAmount });
            if (mult >= 5) {
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ["#f59e0b", "#7c3aed", "#3b82f6"] });
            }
          }, 300);
        }
      }, delay);
      timeoutsRef.current.push(t);
    });
  };

  const RESULT_COLORS: Record<number, string> = {
    0: "text-red-400",
    1.2: "text-emerald-400",
    2: "text-emerald-400",
    3: "text-blue-400",
    5: "text-purple-400",
    8: "text-amber-400",
    20: "text-yellow-300",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-yellow-500" /> Slots
        </h1>
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={spinCount}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className={`px-4 py-2 rounded-xl font-bold border ${
                result.mult === 0
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {result.mult === 0 ? "No Win" : `${result.mult}x — +${formatCurrency(result.win)} FC`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slot Machine */}
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 shadow-lg shadow-primary/5">
        {/* Reels */}
        <div className="flex justify-center gap-4 mb-8">
          {reelValues.map((val, i) => (
            <div
              key={i}
              className="relative w-28 h-28 bg-background border-2 border-border rounded-2xl overflow-hidden flex items-center justify-center shadow-inner"
            >
              <AnimatePresence mode="wait">
                {isSpinning && spinOffset[i] === 0 ? (
                  <motion.div
                    key="spinning"
                    className="absolute flex flex-col"
                    animate={{ y: [0, -200, -400, -600, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
                  >
                    {SYMBOLS.map((s, si) => (
                      <div key={si} className="text-5xl w-28 h-28 flex items-center justify-center">{s}</div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={val}
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-6xl"
                  >
                    {SYMBOLS[val]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Payline glow when winning */}
        {result && result.mult > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1] }}
            transition={{ duration: 0.5 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mb-6 mx-8 rounded-full"
          />
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Bet</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(Math.max(1, Number(e.target.value)))}
                disabled={isSpinning}
                className="w-full bg-input/60 border border-border rounded-xl px-4 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <Button
                onClick={() => setWager(Math.floor(wager / 2))}
                disabled={isSpinning || wager <= 1}
                variant="outline"
                className="px-3 font-bold"
              >
                ½
              </Button>
              <Button
                onClick={() => setWager(Math.min(balance, wager * 2))}
                disabled={isSpinning}
                variant="outline"
                className="px-3 font-bold"
              >
                2×
              </Button>
            </div>
          </div>

          <Button
            onClick={spin}
            disabled={isSpinning || wager > balance}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg shadow-primary/30 disabled:opacity-40 transition-all"
          >
            {isSpinning ? "🎰 Spinning..." : "🎰 SPIN"}
          </Button>
        </div>
      </div>

      {/* Paytable */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">Paytable</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <span>7️⃣ 7️⃣ 7️⃣</span>
            <span className="font-bold text-yellow-400">20x</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <span>⭐ ⭐ ⭐</span>
            <span className="font-bold text-amber-400">8x</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <span>💎 💎 💎</span>
            <span className="font-bold text-purple-400">5x</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span>🔔 🔔 🔔</span>
            <span className="font-bold text-blue-400">3x</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span>🍒 🍒 🍒 / 🍋 🍋 🍋</span>
            <span className="font-bold text-emerald-400">2x</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted rounded-lg border border-border">
            <span>Any Pair</span>
            <span className="font-bold text-muted-foreground">1.2x</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Balance: {formatCurrency(balance)} FC
      </div>
    </div>
  );
}
