import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Rocket, Bomb, Castle, CircleDashed, Dices, 
  Gamepad2, PackageOpen, Coins, Menu, X,
  Trophy, User, Gift, MessagesSquare, ChevronRight
} from "lucide-react";
import { useCasinoStore } from "@/store/use-casino-store";
import { formatCurrency } from "@/lib/utils";
import { DepositModal } from "./deposit-modal";

const GAMES = [
  { path: "/crash", name: "Crash", icon: Rocket, color: "text-red-500" },
  { path: "/mines", name: "Mines", icon: Bomb, color: "text-slate-400" },
  { path: "/towers", name: "Towers", icon: Castle, color: "text-emerald-500" },
  { path: "/plinko", name: "Plinko", icon: CircleDashed, color: "text-blue-500" },
  { path: "/dice", name: "Dice", icon: Dices, color: "text-purple-500" },
  { path: "/slots", name: "Slots", icon: Gamepad2, color: "text-yellow-500" },
  { path: "/cases", name: "Cases", icon: PackageOpen, color: "text-orange-500" },
  { path: "/coinflip", name: "Coin Flip", icon: Coins, color: "text-amber-400" },
];

const CHAT_USERS = ['Shadow_99', 'xX_Slayer_Xx', 'LuckyDrop', 'FlipMaster', 'NoobSaibot', 'Whale_Watcher', 'CryptoKing'];
const CHAT_MESSAGES = ['LFG!!!', 'RIGGED', 'Just hit 10x on Crash!', 'wow', 'plinko is printing today', 'ez money', 'rip my balance', 'anyone got promo code?'];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  
  const { balance, profile } = useCasinoStore();

  // Simulated Chat Feed
  const [chatFeed, setChatFeed] = useState<{id: number, user: string, msg: string, time: string}[]>([]);
  
  useEffect(() => {
    // Initial fake messages
    const initial = Array.from({length: 10}).map((_, i) => ({
      id: i,
      user: CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)],
      msg: CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)],
      time: new Date(Date.now() - (10-i)*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setChatFeed(initial);

    // Add new message every few seconds
    const interval = setInterval(() => {
      setChatFeed(prev => {
        const newMsg = {
          id: Date.now(),
          user: CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)],
          msg: Math.random() > 0.8 
            ? `Won ${Math.floor(Math.random() * 5000) + 100} FC on ${GAMES[Math.floor(Math.random() * GAMES.length)].name}!` 
            : CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)],
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        return [...prev.slice(-49), newMsg]; // Keep last 50
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-16 flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-lg flex items-center justify-between px-4 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-2 font-display font-black text-xl hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              F
            </div>
            <span className="hidden sm:inline">Flip<span className="text-primary">Casino</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-input/50 border border-border rounded-xl p-1 pr-2">
            <div className="bg-muted p-1.5 rounded-lg mr-2">
              <Coins className="w-4 h-4 text-accent" />
            </div>
            <span className="font-mono font-bold text-sm sm:text-base mr-3 tracking-tight">
              {formatCurrency(balance)}
            </span>
            <button 
              onClick={() => setDepositOpen(true)}
              className="bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              Deposit
            </button>
          </div>

          <Link href="/profile" className="flex items-center gap-2 hover:bg-muted p-1.5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold bg-gradient-to-tr from-slate-700 to-slate-600 text-white shadow-inner">
              {profile.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold">{profile.username}</span>
              <span className="text-[10px] text-primary font-bold">Lvl {profile.level}</span>
            </div>
          </Link>
          
          <button onClick={() => setChatOpen(!chatOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground relative">
            <MessagesSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
          absolute lg:static top-16 left-0 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border z-30
          w-64 lg:w-20 xl:w-64 transition-transform duration-300 ease-[cubic-bezier(0.3,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            <div className="text-xs font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3 xl:block lg:hidden hidden">Casino</div>
            
            {GAMES.map(game => (
              <Link key={game.path} href={game.path}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative
                  ${location === game.path ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}
                `}>
                  <game.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${location === game.path ? game.color : 'text-sidebar-foreground/70'}`} />
                  <span className="font-semibold xl:block lg:hidden block">{game.name}</span>
                  {location === game.path && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
                </div>
              </Link>
            ))}

            <div className="mt-8 mb-2 border-t border-sidebar-border/50 pt-6" />
            
            <Link href="/leaderboard">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${location === '/leaderboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}>
                <Trophy className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                <span className="font-semibold xl:block lg:hidden block">Leaderboard</span>
              </div>
            </Link>
            <Link href="/promotions">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${location === '/promotions' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}>
                <Gift className="w-5 h-5 flex-shrink-0 text-primary" />
                <span className="font-semibold xl:block lg:hidden block">Promotions</span>
              </div>
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background/50 relative">
          
          {/* Simulated Ticker */}
          <div className="w-full bg-primary/10 border-b border-primary/20 h-8 flex items-center overflow-hidden">
            <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] items-center gap-8 text-xs font-medium text-primary-foreground/80">
              {Array.from({length: 10}).map((_, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {CHAT_USERS[i%CHAT_USERS.length]} won <span className="text-accent font-bold">{Math.floor(Math.random()*1000)+100} FC</span> on {GAMES[i%GAMES.length].name}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
          
          {/* Footer Disclaimer */}
          <footer className="py-6 text-center text-xs text-muted-foreground/60 border-t border-border/50 mt-12">
            <p>18+ Play Responsibly. This is a simulated environment.</p>
            <p className="mt-1">Virtual currency (FC) has no real-world value and cannot be withdrawn for fiat money.</p>
          </footer>
        </main>

        {/* Right Chat Sidebar */}
        <aside className={`
          absolute lg:static top-16 right-0 h-[calc(100vh-4rem)] bg-card border-l border-border z-30
          w-72 transition-transform duration-300 ease-[cubic-bezier(0.3,1,0.3,1)] flex flex-col
          ${chatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 hidden lg:flex'}
        `}>
          <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Chat
            </h3>
            <button onClick={() => setChatOpen(false)} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse scrollbar-hide">
            {[...chatFeed].reverse().map((chat) => (
              <div key={chat.id} className="text-sm group animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="font-bold text-primary/90 text-[13px]">{chat.user}</span>
                  <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-foreground/90 bg-muted/30 p-2 rounded-lg rounded-tl-none border border-border/50 group-hover:border-border transition-colors leading-snug">
                  {chat.msg.includes('Won') ? (
                    <span className="text-emerald-400 font-medium">{chat.msg}</span>
                  ) : (
                    chat.msg
                  )}
                </p>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-border/50 bg-muted/10 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Say something..." 
                disabled
                className="w-full bg-input border border-border rounded-xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground bg-muted rounded-lg disabled:opacity-50">
                <Rocket className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-center mt-2 text-muted-foreground">Chat is read-only in simulation.</p>
          </div>
        </aside>
        
      </div>
      
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  );
}
