import { useState } from "react";
import { X, Coins, Gift, CreditCard } from "lucide-react";
import { useCasinoStore } from "@/store/use-casino-store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [tab, setTab] = useState<'buy' | 'promo'>('buy');
  const [promoCode, setPromoCode] = useState('');
  const [message, setMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);
  
  const addBalance = useCasinoStore(s => s.addBalance);
  const applyPromoCode = useCasinoStore(s => s.applyPromoCode);

  if (!isOpen) return null;

  const handleSimulatedBuy = (amount: number) => {
    addBalance(amount);
    setMessage({ text: `Successfully added ${formatCurrency(amount)} FC!`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePromo = () => {
    const res = applyPromoCode(promoCode);
    setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
    if (res.success) setPromoCode('');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/30">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Coins className="text-accent w-6 h-6" /> Get FlipCoins
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          <button 
            onClick={() => setTab('buy')}
            className={`flex-1 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${tab === 'buy' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <CreditCard className="w-4 h-4" /> Top Up (Free)
          </button>
          <button 
            onClick={() => setTab('promo')}
            className={`flex-1 py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${tab === 'promo' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Gift className="w-4 h-4" /> Promo Code
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div className={`p-3 mb-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
              {message.text}
            </div>
          )}

          {tab === 'buy' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">
                This is a simulation. Click below to add free virtual currency to your account.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[1000, 5000, 10000, 50000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => handleSimulatedBuy(amt)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 hover:border-primary/50 transition-all hover:scale-[1.02]"
                  >
                    <Coins className="text-accent w-8 h-8 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <span className="font-bold">{formatCurrency(amt)}</span>
                    <span className="text-xs text-muted-foreground">Free</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter a promo code for free bonus coins. Try <strong className="text-foreground">FLIP500</strong> or <strong className="text-foreground">LUCKY1000</strong>.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Enter code..."
                  className="flex-1 bg-input border-2 border-border rounded-xl px-4 focus:outline-none focus:border-primary transition-colors font-mono uppercase"
                />
                <Button onClick={handlePromo} disabled={!promoCode}>Redeem</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
