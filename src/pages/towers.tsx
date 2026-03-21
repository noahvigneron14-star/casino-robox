import { useState } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Castle, Skull, Star, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

const LEVELS = 8;
const COLS = 3;
const MULTIPLIERS_PER_LEVEL = 1.4;

type TileState = "hidden" | "safe" | "danger";

function generateLevel(): number {
  return Math.floor(Math.random() * COLS);
}

export default function TowersGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [wager, setWager] = useState(10);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [grid, setGrid] = useState<TileState[][]>([]);
  const [dangerCols, setDangerCols] = useState<number[]>([]);
  const [selectedCols, setSelectedCols] = useState<number[]>([]);

  const startGame = () => {
    if (wager <= 0 || wager > balance) return;
    if (!deductBalance(wager)) return;

    const dangers = Array.from({ length: LEVELS }, () => generateLevel());
    const newGrid: TileState[][] = Array.from({ length: LEVELS }, () =>
      Array.from({ length: COLS }, () => "hidden")
    );

    setDangerCols(dangers);
    setGrid(newGrid);
    setSelectedCols([]);
    setCurrentLevel(0);
    setMultiplier(1);
    setGameState("playing");
  };

  const handleTileClick = (levelIdx: number, colIdx: number) => {
    if (gameState !== "playing") return;
    if (levelIdx !== currentLevel) return;

    const isDanger = dangerCols[levelIdx] === colIdx;
    const newGrid = grid.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === levelIdx) {
          if (ci === colIdx) return isDanger ? "danger" : "safe";
          if (isDanger) return dangerCols[ri] === ci ? "danger" : "hidden";
        }
        return cell;
      })
    );

    setGrid(newGrid);
    setSelectedCols((prev) => [...prev, colIdx]);

    if (isDanger) {
      setGameState("lost");
      recordGameResult("Towers", wager, 0);
    } else {
      const newMult = parseFloat((multiplier * MULTIPLIERS_PER_LEVEL).toFixed(2));
      setMultiplier(newMult);
      if (currentLevel + 1 >= LEVELS) {
        setGameState("won");
        recordGameResult("Towers", wager, newMult);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ["#10b981", "#7c3aed", "#f59e0b"] });
      } else {
        setCurrentLevel((prev) => prev + 1);
      }
    }
  };

  const cashOut = () => {
    if (gameState !== "playing" || currentLevel === 0) return;
    setGameState("won");
    recordGameResult("Towers", wager, multiplier);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#10b981", "#7c3aed"] });
  };

  const displayLevels = Array.from({ length: LEVELS }, (_, i) => LEVELS - 1 - i);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Castle className="w-8 h-8 text-emerald-500" /> Towers
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>x{MULTIPLIERS_PER_LEVEL} per level</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tower Grid */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="space-y-2">
            {displayLevels.map((levelIdx) => {
              const isCurrentLevel = levelIdx === currentLevel && gameState === "playing";
              const isPastLevel = levelIdx < currentLevel;
              const levelMult = Math.pow(MULTIPLIERS_PER_LEVEL, levelIdx + 1).toFixed(2);

              return (
                <div key={levelIdx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    x{levelMult}
                  </span>
                  <div className={`flex-1 grid grid-cols-3 gap-2 transition-opacity ${levelIdx > currentLevel && gameState === "playing" ? "opacity-40" : ""}`}>
                    {Array.from({ length: COLS }, (_, colIdx) => {
                      const tileState = grid.length > 0 ? grid[levelIdx][colIdx] : "hidden";
                      const isDangerTile = tileState === "danger";
                      const isSafeTile = tileState === "safe";

                      return (
                        <motion.button
                          key={colIdx}
                          whileHover={isCurrentLevel ? { scale: 1.05, y: -2 } : {}}
                          whileTap={isCurrentLevel ? { scale: 0.95 } : {}}
                          onClick={() => handleTileClick(levelIdx, colIdx)}
                          disabled={!isCurrentLevel}
                          className={`
                            h-12 rounded-xl border-2 font-bold text-lg transition-all
                            ${isCurrentLevel ? "border-primary/60 bg-primary/10 hover:bg-primary/20 hover:border-primary cursor-pointer" : ""}
                            ${isPastLevel && isSafeTile ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : ""}
                            ${isPastLevel && !isSafeTile ? "bg-muted/30 border-border" : ""}
                            ${isDangerTile ? "bg-red-500/20 border-red-500 animate-pulse" : ""}
                            ${!isCurrentLevel && !isPastLevel ? "bg-muted/20 border-border/50" : ""}
                          `}
                        >
                          <AnimatePresence mode="wait">
                            {isDangerTile && (
                              <motion.span key="skull" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-400">
                                💀
                              </motion.span>
                            )}
                            {isSafeTile && levelIdx < currentLevel && (
                              <motion.span key="star" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>
                                <Star className="w-5 h-5 text-emerald-400 mx-auto" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result Messages */}
          <AnimatePresence>
            {gameState === "lost" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 font-bold text-lg">💥 BOOM! You hit a mine!</p>
                <p className="text-muted-foreground text-sm">Lost {formatCurrency(wager)}</p>
              </motion.div>
            )}
            {gameState === "won" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p className="text-emerald-400 font-bold text-lg">🏆 Tower Conquered!</p>
                <p className="text-muted-foreground text-sm">Won {formatCurrency(wager * multiplier)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5 font-medium">Bet Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={wager}
                onChange={(e) => setWager(Math.max(1, Number(e.target.value)))}
                disabled={gameState === "playing"}
                className="w-full bg-input/60 border border-border rounded-xl px-4 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div className="flex gap-1 mt-2">
              {[10, 50, 100, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setWager(v)}
                  disabled={gameState === "playing"}
                  className="flex-1 text-xs bg-muted hover:bg-primary/20 hover:text-primary rounded-lg py-1.5 font-bold transition-colors disabled:opacity-40"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Current Multiplier */}
          <div className="bg-muted/50 rounded-xl p-4 text-center border border-border">
            <p className="text-xs text-muted-foreground mb-1">Current Multiplier</p>
            <p className="text-4xl font-display font-black text-emerald-400">x{multiplier.toFixed(2)}</p>
            {gameState === "playing" && (
              <p className="text-xs text-muted-foreground mt-1">Level {currentLevel + 1}/{LEVELS}</p>
            )}
          </div>

          {/* Potential Win */}
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Potential Win</p>
            <p className="text-lg font-bold text-accent">{formatCurrency(wager * multiplier)} FC</p>
          </div>

          {gameState === "idle" || gameState === "won" || gameState === "lost" ? (
            <Button onClick={startGame} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">
              {gameState === "idle" ? "Start Game" : "Play Again"}
            </Button>
          ) : (
            <Button
              onClick={cashOut}
              disabled={currentLevel === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl disabled:opacity-40"
            >
              Cash Out ({formatCurrency(wager * multiplier)})
            </Button>
          )}

          <div className="text-center text-xs text-muted-foreground">
            <p>Balance: {formatCurrency(balance)} FC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
