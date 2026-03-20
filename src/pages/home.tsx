import { Link } from "wouter";
import { Rocket, Bomb, Castle, CircleDashed, Dices, Gamepad2, PackageOpen, Coins, ArrowRight, Play } from "lucide-react";

const GAMES = [
  { path: "/crash", name: "Crash", icon: Rocket, desc: "Ride the multiplier curve!", color: "from-red-600/20 to-red-900/40", border: "hover:border-red-500/50", text: "text-red-500" },
  { path: "/mines", name: "Mines", icon: Bomb, desc: "Dodge bombs to multiply wins", color: "from-slate-600/20 to-slate-900/40", border: "hover:border-slate-400/50", text: "text-slate-400" },
  { path: "/towers", name: "Towers", icon: Castle, desc: "Climb high, don't fall", color: "from-emerald-600/20 to-emerald-900/40", border: "hover:border-emerald-500/50", text: "text-emerald-500" },
  { path: "/plinko", name: "Plinko", icon: CircleDashed, desc: "Drop the ball for huge multis", color: "from-blue-600/20 to-blue-900/40", border: "hover:border-blue-500/50", text: "text-blue-500" },
  { path: "/dice", name: "Dice", icon: Dices, desc: "Set your odds, roll to win", color: "from-purple-600/20 to-purple-900/40", border: "hover:border-purple-500/50", text: "text-purple-500" },
  { path: "/slots", name: "Slots", icon: Gamepad2, desc: "Match symbols for jackpots", color: "from-yellow-600/20 to-yellow-900/40", border: "hover:border-yellow-500/50", text: "text-yellow-500" },
  { path: "/cases", name: "Cases", icon: PackageOpen, desc: "Open for legendary loot", color: "from-orange-600/20 to-orange-900/40", border: "hover:border-orange-500/50", text: "text-orange-500" },
  { path: "/coinflip", name: "Coin Flip", icon: Coins, desc: "50/50 double or nothing", color: "from-amber-600/20 to-amber-900/40", border: "hover:border-amber-500/50", text: "text-amber-500" },
];

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 group">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero background" 
          className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="relative z-20 p-8 md:p-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> New Games Added
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-tight mb-4 text-glow text-white">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Multiply</span> your fortune?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            The ultimate simulated casino experience. Play classic arcade games, climb the leaderboard, and win big!
          </p>
          <div className="flex gap-4">
            <Link href="/crash" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-1 transition-all active:translate-y-0">
              <Play className="w-5 h-5 fill-current" /> Play Crash Now
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Gamepad2 className="text-primary" /> Casino Games
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GAMES.map((game, i) => (
            <Link key={game.path} href={game.path}>
              <div 
                className={`group relative bg-gradient-to-br ${game.color} rounded-2xl p-6 border-2 border-border/50 ${game.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                  <game.icon className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/5 mb-4 shadow-sm group-hover:scale-110 transition-transform ${game.text}`}>
                    <game.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display mb-1">{game.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{game.desc}</p>
                  
                  <div className="mt-auto flex items-center font-bold text-sm text-foreground/50 group-hover:text-foreground transition-colors">
                    Play Now <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
