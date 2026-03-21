import { useState } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DiceGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  
  const [wager, setWager] = useState(10);
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  
  const winChance = target;
  const multiplier = Number((99 / winChance).toFixed(4));
  const payout = wager * multiplier;

  const rollDice = () => {
    if (wager > balance || wager <= 0 || isRolling) return;
    if (!deductBalance(wager)) return;

    setIsRolling(true);
    setLastRoll(null);

    // Fake rolling animation delay
    setTimeout(() => {
      const result = Number((Math.random() * 100).toFixed(2));
      setLastRoll(result);
      setIsRolling(false);
      
      const won = result < target;
      recordGameResult('Dice', wager, won ? multiplier : 0);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-black flex items-center gap-3">
          <Dices className="w-8 h-8 text-purple-500" /> Dice
        </h1>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6 lg:p-12 shadow-inner">
        
        {/* Main Display */}
        <div className="flex flex-col items-center justify-center min-h-[200px] mb-12">
          {isRolling ? (
            <div className="text-7xl font-mono font-black text-muted-foreground animate-pulse blur-[2px]">
              00.00
            </div>
          ) : lastRoll !== null ? (
            <div className={`text-8xl font-mono font-black text-glow ${lastRoll < target ? 'text-emerald-400' : 'text-destructive'}`}>
              {lastRoll.toFixed(2)}
            </div>
          ) : (
            <div className="text-6xl font-mono font-black text-muted/30">
              --.--
            </div>
          )}
          
          <div className="text-muted-foreground mt-4 font-bold tracking-wider uppercase text-sm">
            Roll Under <span className="text-primary">{target.toFixed(2)}</span> to win
          </div>
        </div>

        {/* Slider Area */}
        <div className="relative mb-16 px-4">
          <div className="flex justify-between text-xs font-bold text-muted-foreground mb-4">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          
          {/* Custom Track background */}
          <div className="absolute top-[28px] left-4 right-4 h-4 bg-red-500/20 rounded-full overflow-hidden pointer-events-none">
             <div className="h-full bg-emerald-500/30" style={{ width: `${target}%` }} />
          </div>

          <input 
            type="range" 
            min="2" max="98" step="1"
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full relative z-10 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary cursor-pointer"
            disabled={isRolling}
          />
          
          {/* Slider Marker */}
          <div 
            className="absolute top-[48px] -ml-6 w-12 text-center text-sm font-bold bg-card border border-border py-1 rounded-md shadow-lg pointer-events-none transition-all"
            style={{ left: `calc(${target}% + 1rem)` }}
          >
            {target}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
            <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Multiplier</div>
            <div className="text-xl font-mono font-bold text-primary">{multiplier}x</div>
          </div>
          <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
            <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Win Chance</div>
            <div className="text-xl font-mono font-bold text-secondary">{winChance}%</div>
          </div>
          <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/50">
            <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Payout On Win</div>
            <div className="text-xl font-mono font-bold text-accent">{payout.toFixed(2)} FC</div>
          </div>
        </div>

        {/* Bet Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-input border border-border rounded-xl p-1.5 relative focus-within:border-primary transition-all flex items-center">
            <span className="text-muted-foreground font-bold text-sm px-3 uppercase">Bet</span>
            <input 
              type="number" 
              value={wager}
              onChange={e => setWager(Number(e.target.value))}
              className="w-full bg-transparent pr-20 py-2 font-mono font-bold focus:outline-none text-right text-lg"
              disabled={isRolling}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button onClick={() => setWager(Math.max(1, wager/2))} className="bg-muted hover:bg-muted-foreground/20 text-xs font-bold px-2 py-1.5 rounded-lg">/2</button>
              <button onClick={() => setWager(wager*2)} className="bg-muted hover:bg-muted-foreground/20 text-xs font-bold px-2 py-1.5 rounded-lg">x2</button>
            </div>
          </div>
          <Button 
            size="lg" 
            className="sm:w-48 h-14 text-xl" 
            onClick={rollDice} 
            disabled={wager > balance || wager <= 0 || isRolling}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>
        </div>

      </div>
    </div>
  );
}
