import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Rocket, Bomb, Castle, CircleDashed, Dices,
  Gamepad2, PackageOpen, Coins, Menu,
  Trophy, User, Gift, MessagesSquare, ChevronRight, Send, LogOut
} from "lucide-react";
import { useCasinoStore, formatCurrency } from "@/store/use-casino-store";
import {
  getChat, addChatMessage, giveCoins, rainCoins,
  logout, type ChatMessage
} from "@/lib/accounts";
import { DepositModal } from "./deposit-modal";
import { motion, AnimatePresence } from "framer-motion";

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

const TICKER_WINS = [
  { user: 'Shadow_99', game: 'Crash', amount: 4200 },
  { user: 'LuckyDrop', game: 'Plinko', amount: 1300 },
  { user: 'FlipMaster', game: 'Mines', amount: 8800 },
  { user: 'NoobSaibot', game: 'Slots', amount: 650 },
  { user: 'Whale_W', game: 'Towers', amount: 3100 },
  { user: 'CryptoKing', game: 'Dice', amount: 2250 },
  { user: 'xX_Slayer', game: 'Cases', amount: 5000 },
  { user: 'GoldRush', game: 'Coin Flip', amount: 980 },
];

function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    setMessages(getChat());
    const interval = setInterval(() => {
      setMessages(getChat());
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  return messages;
}

function ChatCommandHelp() {
  return (
    <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1">
      <p><span className="text-primary font-bold">/rain</span> [montant] — distribuer des FC</p>
      <p><span className="text-secondary font-bold">/give</span> [user] [montant] [mdp] — envoyer des FC</p>
    </div>
  );
}

export function Layout({ children, onLogout }: { children: ReactNode; onLogout?: () => void }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [cmdFeedback, setCmdFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { balance, profile, username, refreshFromStorage } = useCasinoStore();
  const messages = useChatMessages();

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const showFeedback = (msg: string, ok: boolean) => {
    setCmdFeedback({ msg, ok });
    setTimeout(() => setCmdFeedback(null), 3000);
  };

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text || !username) return;
    setChatInput("");

    // Commands
    if (text.startsWith("/rain ")) {
      const amount = parseFloat(text.split(" ")[1]);
      if (isNaN(amount) || amount <= 0) return showFeedback("Usage: /rain [montant]", false);
      const result = rainCoins(username, amount);
      refreshFromStorage();
      showFeedback(result.message, result.success);
      return;
    }

    if (text.startsWith("/give ")) {
      const parts = text.split(" ");
      if (parts.length < 4) return showFeedback("Usage: /give [utilisateur] [montant] [mot de passe]", false);
      const [, toUser, amountStr, ...passwordParts] = parts;
      const amount = parseFloat(amountStr);
      const password = passwordParts.join(" ");
      if (isNaN(amount)) return showFeedback("Montant invalide", false);
      const result = giveCoins(username, password, toUser, amount);
      refreshFromStorage();
      showFeedback(result.message, result.success);
      return;
    }

    // Regular message
    addChatMessage({ username, message: text, type: "user" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  const msgColor = (type: ChatMessage["type"]) => {
    if (type === "system") return "text-blue-400/80";
    if (type === "rain") return "text-amber-400";
    if (type === "give") return "text-emerald-400";
    return "text-foreground/90";
  };

  const msgBg = (type: ChatMessage["type"]) => {
    if (type === "system") return "bg-blue-500/10 border-blue-500/20";
    if (type === "rain") return "bg-amber-500/10 border-amber-500/20";
    if (type === "give") return "bg-emerald-500/10 border-emerald-500/20";
    return "bg-muted/30 border-border/50";
  };

  const userColor = (name: string) => {
    const colors = ["text-violet-400", "text-blue-400", "text-emerald-400", "text-rose-400", "text-amber-400", "text-cyan-400"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 z-40 sticky top-0 shadow-md shadow-black/20">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 font-display font-black text-lg hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              F
            </div>
            <span className="hidden sm:inline">Flip<span className="text-primary">Casino</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Balance */}
          <div className="flex items-center bg-input/60 border border-border rounded-xl p-1 pr-2 shadow-inner">
            <div className="bg-accent/10 p-1.5 rounded-lg mr-2">
              <Coins className="w-4 h-4 text-accent" />
            </div>
            <span className="font-mono font-bold text-sm mr-2 tracking-tight text-accent">
              {formatCurrency(balance)}
            </span>
            <button
              onClick={() => setDepositOpen(true)}
              className="bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              +
            </button>
          </div>

          {/* Profile */}
          <Link href="/profile" className="flex items-center gap-2 hover:bg-muted px-2 py-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-inner"
              style={{ background: `hsl(${((username?.charCodeAt(0) ?? 65) * 137.5) % 360}, 60%, 45%)` }}
            >
              {(username ?? "?").substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
              <span className="text-sm font-semibold">{username}</span>
              <span className="text-[10px] text-primary font-bold">Niv. {profile.level}</span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button onClick={() => setChatOpen(!chatOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground relative">
            <MessagesSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`
          absolute lg:static top-14 left-0 h-[calc(100vh-3.5rem)] bg-sidebar border-r border-sidebar-border z-30
          w-60 lg:w-20 xl:w-60 transition-transform duration-300 ease-[cubic-bezier(0.3,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
            <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider mb-2 px-3 xl:block lg:hidden">Jeux</p>
            {GAMES.map(game => (
              <Link key={game.path} href={game.path}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative
                  ${location === game.path
                    ? 'bg-primary/15 text-foreground shadow-sm border border-primary/20'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground'}
                `} onClick={() => setSidebarOpen(false)}>
                  <game.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${location === game.path ? game.color : ''}`} />
                  <span className="font-semibold text-sm xl:block lg:hidden block">{game.name}</span>
                  {location === game.path && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                </div>
              </Link>
            ))}

            <div className="mt-4 pt-3 border-t border-sidebar-border/50">
              <Link href="/leaderboard">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${location === '/leaderboard' ? 'bg-primary/15 border border-primary/20' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground'}`} onClick={() => setSidebarOpen(false)}>
                  <Trophy className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                  <span className="font-semibold text-sm xl:block lg:hidden block">Classement</span>
                </div>
              </Link>
              <Link href="/promotions">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${location === '/promotions' ? 'bg-primary/15 border border-primary/20' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground'}`} onClick={() => setSidebarOpen(false)}>
                  <Gift className="w-5 h-5 flex-shrink-0 text-primary" />
                  <span className="font-semibold text-sm xl:block lg:hidden block">Promotions</span>
                </div>
              </Link>
              <Link href="/profile">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${location === '/profile' ? 'bg-primary/15 border border-primary/20' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground'}`} onClick={() => setSidebarOpen(false)}>
                  <User className="w-5 h-5 flex-shrink-0 text-violet-400" />
                  <span className="font-semibold text-sm xl:block lg:hidden block">Profil</span>
                </div>
              </Link>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background/60 relative">
          {/* Winners Ticker */}
          <div className="w-full bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border-b border-primary/20 h-7 flex items-center overflow-hidden">
            <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] items-center gap-10 text-xs font-medium">
              {[...TICKER_WINS, ...TICKER_WINS].map((w, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80]" />
                  <span className="text-muted-foreground">{w.user}</span>
                  <span className="text-foreground/70">a gagné</span>
                  <span className="text-accent font-bold">{w.amount.toLocaleString()} FC</span>
                  <span className="text-muted-foreground/60">sur {w.game}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {children}
          </div>

          <footer className="py-4 text-center text-xs text-muted-foreground/40 border-t border-border/30 mt-8">
            <p>18+ — Environnement simulé. Monnaie virtuelle sans valeur réelle.</p>
          </footer>
        </main>

        {/* Right Chat */}
        <aside className={`
          absolute lg:static top-14 right-0 h-[calc(100vh-3.5rem)] bg-card/95 border-l border-border z-30
          w-72 transition-transform duration-300 ease-[cubic-bezier(0.3,1,0.3,1)] flex flex-col backdrop-blur-sm
          ${chatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 hidden lg:flex'}
        `}>
          {/* Chat Header */}
          <div className="h-11 flex items-center justify-between px-4 border-b border-border/50 shrink-0 bg-muted/20">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
              Chat en direct
            </h3>
            <button onClick={() => setChatOpen(false)} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm animate-in slide-in-from-bottom-2 fade-in duration-200">
                {msg.type !== "user" ? (
                  <div className={`text-xs px-3 py-2 rounded-xl border ${msgBg(msg.type)} ${msgColor(msg.type)} font-medium`}>
                    {msg.message}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`font-bold text-xs ${userColor(msg.username)}`}>{msg.username}</span>
                      <span className="text-[9px] text-muted-foreground/60">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-foreground/85 bg-muted/30 px-3 py-1.5 rounded-xl rounded-tl-sm border border-border/40 text-xs leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50 bg-muted/10 shrink-0 space-y-1.5">
            <AnimatePresence>
              {cmdFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-[10px] px-2 py-1 rounded-lg ${cmdFeedback.ok ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}
                >
                  {cmdFeedback.msg}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message ou /rain /give..."
                className="w-full bg-input/80 border border-border rounded-xl pl-3 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/40"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-primary/80 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <ChatCommandHelp />
          </div>
        </aside>
      </div>

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  );
}
