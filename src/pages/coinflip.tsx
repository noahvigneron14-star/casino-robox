import { useState } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

type Side = 'heads' | 'tails';

export default function CoinFlipGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  
  const [wager, setWager] = useState(10);
  const [choice, setChoice] = useState<Side>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<Side | null>(null);
  const [rotation, setRotation] = useState(0);

  const multiplier = 1.90; // 5% house edge

  const flipCoin = () => {
    if (wager > balance || wager <= 0 || isFlipping) return;
    if (!deductBalance(wager)) return;

    setIsFlipping(true);
    setResult(null);

    // Determine result
    const newResult: Side = Math.random() > 0.5 ? 'heads' : 'tails';
    
    // Calculate rotation to land on correct side visually
    // Heads = 0deg, Tails = 180deg. Add extra spins (360 * 5)
    const extraSpins = 360 * 5; 
    const finalRot = rotation + extraSpins + (newResult === 'tails' ? 180 : 0) - (rotation % 360);
    
    setRotation(finalRot);

    setTimeout(() => {
      setResult(newResult);
      setIsFlipping(false);
      const won = choice === newResult;
      recordGameResult('Coin Flip', wager, won ? multiplier : 0);
    }, 2000); // match CSS transition duration
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Coins className="w-8 h-8 text-amber-500" /> Coin Flip
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Game Area */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] shadow-inner relative overflow-hidden">
          
          {/* Animated Coin */}
          <div 
            className="w-48 h-48 relative mb-12"
            style={{ perspective: '1000px' }}
          >
            <div 
              className="w-full h-full relative transition-transform duration-[2000ms] ease-in-out"
              style={{ transformStyle: 'preserve-3d', transform: `rotateY(${rotation}deg)` }}
            >
              {/* Heads Side */}
              <div className="absolute inset-0 backface-hidden rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-300 border-4 border-yellow-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center"
                   style={{ backfaceVisibility: 'hidden' }}>
                <div className="w-3/4 h-3/4 rounded-full border-2 border-yellow-600/50 flex flex-col items-center justify-center">
                  <div className="text-yellow-800 font-display font-black text-4xl tracking-tighter">H</div>
                  <div className="text-yellow-700/80 font-bold text-xs uppercase mt-1">Heads</div>
                </div>
              </div>
              
              {/* Tails Side */}
              <div className="absolute inset-0 backface-hidden rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border-4 border-slate-500 shadow-[0_0_30px_rgba(148,163,184,0.4)] flex items-center justify-center"
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="w-3/4 h-3/4 rounded-full border-2 border-slate-500/50 flex flex-col items-center justify-center">
                  <div className="text-slate-700 font-display font-black text-4xl tracking-tighter">T</div>
                  <div className="text-slate-600/80 font-bold text-xs uppercase mt-1">Tails</div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Banner */}
          {!isFlipping && result && (
            <div className={`absolute bottom-8 px-8 py-3 rounded-full font-bold text-xl uppercase tracking-wider animate-in slide-in-from-bottom-4 ${choice === result ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-destructive/20 text-destructive border border-destructive/50'}`}>
              {choice === result ? 'You Won!' : 'You Lost'}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Side</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setChoice('heads')}
                disabled={isFlipping}
                className={`py-4 rounded-xl font-bold border-2 transition-all ${choice === 'heads' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-muted border-transparent text-muted-foreground hover:bg-muted-foreground/10'}`}
              >
                Heads
              </button>
              <button 
                onClick={() => setChoice('tails')}
                disabled={isFlipping}
                className={`py-4 rounded-xl font-bold border-2 transition-all ${choice === 'tails' ? 'bg-slate-400/20 border-slate-400 text-slate-300' : 'bg-muted border-transparent text-muted-foreground hover:bg-muted-foreground/10'}`}
              >
                Tails
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bet Amount</label>
            <div className="flex bg-input border border-border rounded-xl p-1 relative focus-within:border-primary">
              <input 
                type="number" 
                value={wager}
                onChange={e => setWager(Number(e.target.value))}
                className="w-full bg-transparent pl-3 pr-20 py-3 font-mono font-bold focus:outline-none text-xl"
                disabled={isFlipping}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setWager(Math.max(1, wager/2))} className="bg-muted hover:bg-muted-foreground/20 text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50" disabled={isFlipping}>/2</button>
                <button onClick={() => setWager(wager*2)} className="bg-muted hover:bg-muted-foreground/20 text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50" disabled={isFlipping}>x2</button>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl flex justify-between items-center border border-border/50">
            <span className="text-muted-foreground font-bold">Potential Payout:</span>
            <span className="font-mono font-bold text-accent text-xl">{(wager * multiplier).toFixed(2)} FC</span>
          </div>

          <Button 
            size="lg" 
            className="w-full h-16 text-xl mt-4" 
            onClick={flipCoin} 
            disabled={wager > balance || wager <= 0 || isFlipping}
          >
            {isFlipping ? 'Flipping...' : 'Flip Coin'}
          </Button>
        </div>
      </div>
    </div>
  );
}
