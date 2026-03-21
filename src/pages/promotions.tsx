import { Gift, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCasinoStore } from "@/store/use-casino-store";
import { useState, useEffect } from "react";

export default function Promotions() {
  const { claimDailyBonus, lastBonusClaim } = useCasinoStore();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      if (!lastBonusClaim) return setTimeLeft("Available Now");
      const oneDay = 24 * 60 * 60 * 1000;
      const now = Date.now();
      if (now - lastBonusClaim > oneDay) return setTimeLeft("Available Now");
      
      const diff = oneDay - (now - lastBonusClaim);
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${h}h ${m}m`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [lastBonusClaim]);

  const handleClaim = () => {
    const res = claimDailyBonus();
    alert(res.message); // Simple alert for demo, toast would be better in prod
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-display font-black flex items-center gap-3 mb-8">
        <Gift className="w-8 h-8 text-primary" /> Rewards & Promotions
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Bonus Card */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 group-hover:scale-110">
            <Calendar className="w-32 h-32 text-primary" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black font-display mb-2">Daily Bonus</h3>
            <p className="text-muted-foreground mb-6">Claim your free 500 FC every 24 hours just for logging in!</p>
            
            <div className="bg-background/50 border border-border rounded-xl p-4 mb-6 inline-block">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</div>
              <div className={`font-mono font-bold text-lg ${timeLeft === 'Available Now' ? 'text-emerald-400' : 'text-primary'}`}>
                {timeLeft}
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handleClaim} 
              disabled={timeLeft !== 'Available Now'}
              className="w-full"
            >
              {timeLeft === 'Available Now' ? 'Claim 500 FC' : 'Check Back Later'}
            </Button>
          </div>
        </div>

        {/* Affiliate Card */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:-rotate-12 group-hover:scale-110">
            <Share2 className="w-32 h-32 text-secondary" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black font-display mb-2">Refer a Friend</h3>
            <p className="text-muted-foreground mb-6">Earn passive income from your friends' wagers.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Code</div>
                <div className="flex">
                  <input type="text" value="USER123" readOnly className="bg-input border border-border border-r-0 rounded-l-xl px-4 py-2 font-mono font-bold w-full focus:outline-none" />
                  <Button className="rounded-l-none">Copy</Button>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
              <p className="text-sm font-bold text-secondary">Earn 5% of house edge on all referred players!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
