import { useState } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Bomb, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

type CellState = 'hidden' | 'safe' | 'mine';

export default function MinesGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  
  const [mineCount, setMineCount] = useState(3);
  const [wager, setWager] = useState(10);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [grid, setGrid] = useState<CellState[]>(Array(25).fill('hidden'));
  const [actualMines, setActualMines] = useState<number[]>([]);
  const [safeRevealed, setSafeRevealed] = useState(0);
  
  // Calculate multiplier based on combinatorics
  const currentMultiplier = gameState === 'playing' && safeRevealed > 0 
    ? calculateMinesMultiplier(25, mineCount, safeRevealed) 
    : 1.00;
    
  const nextMultiplier = calculateMinesMultiplier(25, mineCount, safeRevealed + 1);

  function calculateMinesMultiplier(total: number, mines: number, hits: number) {
    let prob = 1;
    for (let i = 0; i < hits; i++) {
      prob *= (total - mines - i) / (total - i);
    }
    return (1 / prob) * 0.95; // 5% house edge
  }

  const startGame = () => {
    if (wager > balance || wager <= 0) return;
    if (!deductBalance(wager)) return;

    // Place mines randomly
    const newMines: number[] = [];
    while (newMines.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!newMines.includes(pos)) newMines.push(pos);
    }
    
    setActualMines(newMines);
    setGrid(Array(25).fill('hidden'));
    setSafeRevealed(0);
    setGameState('playing');
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing' || grid[index] !== 'hidden') return;

    const isMine = actualMines.includes(index);
    const newGrid = [...grid];

    if (isMine) {
      // Boom
      newGrid[index] = 'mine';
      setGrid(newGrid);
      revealAll();
      setGameState('finished');
      recordGameResult('Mines', wager, 0); // Loss
    } else {
      // Safe
      newGrid[index] = 'safe';
      setGrid(newGrid);
      setSafeRevealed(prev => prev + 1);
      
      // Auto cashout if all safe cells found
      if (safeRevealed + 1 === 25 - mineCount) {
        handleCashout(safeRevealed + 1);
      }
    }
  };

  const revealAll = () => {
    setGrid(prev => prev.map((cell, i) => {
      if (cell !== 'hidden') return cell;
      return actualMines.includes(i) ? 'mine' : 'hidden'; // show unclicked mines dimly
    }));
  };

  const handleCashout = (hits = safeRevealed) => {
    if (gameState !== 'playing' || hits === 0) return;
    const mult = calculateMinesMultiplier(25, mineCount, hits);
    revealAll();
    setGameState('finished');
    recordGameResult('Mines', wager, mult);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Bomb className="w-8 h-8 text-slate-400" /> Mines
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Sidebar */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 flex flex-col space-y-6 order-2 lg:order-1">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bet Amount</label>
            <div className="flex bg-input border border-border rounded-xl p-1 relative focus-within:border-primary">
              <input 
                type="number" 
                value={wager}
                onChange={e => setWager(Number(e.target.value))}
                className="w-full bg-transparent pl-3 pr-20 py-2 font-mono font-bold focus:outline-none"
                disabled={gameState === 'playing'}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setWager(Math.max(1, wager/2))} className="bg-muted hover:bg-muted-foreground/20 text-xs font-bold px-2 py-1.5 rounded-lg disabled:opacity-50" disabled={gameState === 'playing'}>/2</button>
                <button onClick={() => setWager(wager*2)} className="bg-muted hover:bg-muted-foreground/20 text-xs font-bold px-2 py-1.5 rounded-lg disabled:opacity-50" disabled={gameState === 'playing'}>x2</button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mines ({mineCount})</label>
            <input 
              type="range" 
              min="1" max="24" 
              value={mineCount}
              onChange={e => setMineCount(Number(e.target.value))}
              className="w-full accent-primary"
              disabled={gameState === 'playing'}
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {[1, 3, 5, 10, 24].map(n => (
                <button 
                  key={n} 
                  onClick={() => setMineCount(n)}
                  disabled={gameState === 'playing'}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${mineCount === n ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 space-y-4">
            {gameState === 'playing' && safeRevealed > 0 ? (
               <Button variant="gold" size="lg" className="w-full h-14" onClick={() => handleCashout()}>
                 Cashout {(wager * currentMultiplier).toFixed(2)} FC
               </Button>
            ) : (
               <Button size="lg" className="w-full h-14" onClick={startGame} disabled={wager > balance || wager <= 0 || gameState === 'playing'}>
                 Bet
               </Button>
            )}
          </div>
        </div>

        {/* Game Grid */}
        <div className="lg:col-span-2 bg-card border-2 border-border rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center order-1 lg:order-2 shadow-inner">
          <div className="flex justify-between w-full max-w-md mb-6 px-2">
            <div className="bg-muted/50 px-4 py-2 rounded-xl text-center border border-border">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Multiplier</div>
              <div className="font-mono text-xl font-bold text-primary">{currentMultiplier.toFixed(2)}x</div>
            </div>
            <div className="bg-muted/50 px-4 py-2 rounded-xl text-center border border-border">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next Tile</div>
              <div className="font-mono text-xl font-bold text-emerald-400">{nextMultiplier.toFixed(2)}x</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md aspect-square">
            {grid.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={gameState !== 'playing' || cell !== 'hidden'}
                className={`
                  relative rounded-xl border-b-4 active:border-b-0 active:translate-y-[4px] transition-all duration-200
                  flex items-center justify-center
                  ${cell === 'hidden' ? 'bg-muted border-muted-foreground/30 hover:bg-muted-foreground/20 cursor-pointer shadow-sm' : ''}
                  ${cell === 'safe' ? 'bg-emerald-500/20 border-emerald-500/50 cursor-default' : ''}
                  ${cell === 'mine' && actualMines.includes(i) ? 'bg-red-500 border-red-700 cursor-default animate-[shake_0.5s_ease-in-out]' : ''}
                  ${cell === 'hidden' && gameState === 'finished' && actualMines.includes(i) ? 'bg-red-500/20 border-red-500/30 cursor-default opacity-50' : ''}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {cell === 'safe' && <Diamond className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-in zoom-in" />}
                  {cell === 'mine' && <Bomb className="w-8 h-8 text-white drop-shadow-md animate-in zoom-in" />}
                  {cell === 'hidden' && gameState === 'finished' && actualMines.includes(i) && <Bomb className="w-6 h-6 text-red-500/50" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
