import { useState, useEffect, useRef } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Rocket, History } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

export default function CrashGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed'>('idle');
  const [wager, setWager] = useState(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashOutMult, setCashOutMult] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  
  const reqRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const startCrash = () => {
    if (wager > balance || wager <= 0) return;
    if (!deductBalance(wager)) return;

    // Generate random crash point (house edge ~5%)
    const e = 100;
    const h = 5;
    const r = Math.random();
    const point = r < (h/100) ? 1.00 : Math.max(1.01, (e / (r * 100)));
    
    setCrashPoint(point);
    setGameState('playing');
    setMultiplier(1.00);
    setHasCashedOut(false);
    startTimeRef.current = performance.now();
    
    animate();
  };

  const animate = (time?: number) => {
    if (!startTimeRef.current) return;
    
    const elapsed = (time || performance.now()) - startTimeRef.current;
    
    // Formula for curve: growth accelerates over time
    const currentMult = Math.pow(Math.E, 0.00006 * elapsed);
    
    if (currentMult >= crashPoint) {
      handleCrash();
    } else {
      setMultiplier(currentMult);
      reqRef.current = requestAnimationFrame(animate);
    }
  };

  const handleCrash = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    setMultiplier(crashPoint);
    setGameState('crashed');
    setHistory(prev => [crashPoint, ...prev].slice(0, 10));
    
    if (!hasCashedOut) {
      recordGameResult('Crash', wager, 0); // Loss
    }
  };

  const cashOut = () => {
    if (gameState !== 'playing' || hasCashedOut) return;
    setHasCashedOut(true);
    setCashOutMult(multiplier);
    recordGameResult('Crash', wager, multiplier);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#f59e0b'] });
  };

  useEffect(() => {
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Rocket className="w-8 h-8 text-red-500" /> Crash
        </h1>
        <div className="flex gap-2">
          {history.map((h, i) => (
            <div key={i} className={`px-2 py-1 rounded font-mono text-xs font-bold ${h >= 2 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
              {h.toFixed(2)}x
            </div>
          ))}
          {history.length === 0 && <div className="text-muted-foreground text-sm flex items-center gap-1"><History className="w-4 h-4"/> No history</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Canvas/Graph Area */}
        <div className="lg:col-span-2 relative bg-card border-2 border-border rounded-2xl h-[400px] flex items-center justify-center overflow-hidden shadow-inner">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 text-center flex flex-col items-center">
            {gameState === 'idle' && (
              <div className="text-muted-foreground text-2xl font-bold animate-pulse">Waiting for bets...</div>
            )}
            
            {gameState === 'playing' && (
              <>
                <div className={`text-7xl font-black font-mono tracking-tighter ${hasCashedOut ? 'text-emerald-500 text-glow' : 'text-primary text-glow'}`}>
                  {multiplier.toFixed(2)}x
                </div>
                {hasCashedOut && (
                  <div className="text-emerald-400 font-bold mt-2 text-xl bg-emerald-500/10 px-4 py-1 rounded-full">
                    Cashed out @ {cashOutMult.toFixed(2)}x
                  </div>
                )}
                
                {/* Simple animated rocket visually */}
                {!hasCashedOut && (
                  <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-20">
                    <Rocket className="w-48 h-48 text-primary animate-[bounce_0.5s_infinite]" />
                  </div>
                )}
              </>
            )}

            {gameState === 'crashed' && (
              <>
                <div className="text-7xl font-black font-mono tracking-tighter text-destructive text-glow">
                  {crashPoint.toFixed(2)}x
                </div>
                <div className="text-destructive font-bold mt-2 text-2xl uppercase tracking-widest bg-destructive/10 px-6 py-2 rounded-full border border-destructive/20">
                  Crashed
                </div>
              </>
            )}
          </div>
          
          {/* Curve visual representation (simplified using CSS transform) */}
          {gameState === 'playing' && (
             <div 
               className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_#7c3aed] origin-bottom-left transition-transform duration-75"
               style={{ transform: `scaleY(${Math.min(multiplier * 20, 400)}) rotate(-${Math.min(multiplier * 2, 45)}deg)` }}
             />
          )}
        </div>

        {/* Controls */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bet Amount</label>
            <div className="flex bg-input border border-border rounded-xl p-1 relative focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all">
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
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Min: 1 FC</span>
              <span>Max: 10,000 FC</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            {gameState === 'playing' && !hasCashedOut ? (
              <Button 
                variant="destructive"
                size="lg"
                className="w-full h-16 text-xl animate-[pulse_1s_infinite]"
                onClick={cashOut}
              >
                Cash Out ({(wager * multiplier).toFixed(2)})
              </Button>
            ) : (
              <Button 
                variant="default"
                size="lg"
                className="w-full h-16 text-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                onClick={startCrash}
                disabled={wager > balance || wager <= 0}
              >
                {gameState === 'crashed' ? 'Play Again' : 'Place Bet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
