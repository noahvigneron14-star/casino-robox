import { useCasinoStore } from "@/store/use-casino-store";
import { User, Trophy, Flame, Target, Gamepad2, Clock, History } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Profile() {
  const { profile, stats, history, username, balance } = useCasinoStore();

  const userColor = `hsl(${((username?.charCodeAt(0) ?? 65) * 137.5) % 360}, 60%, 45%)`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-display font-black flex items-center gap-3">
        <User className="w-8 h-8 text-primary" /> Profil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-primary/20 to-transparent" />
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative z-10 w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-2xl"
            style={{ background: userColor }}
          >
            {(username ?? "?").substring(0, 2).toUpperCase()}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-card shadow-lg">
              Niv. {profile.level}
            </div>
          </motion.div>

          <div className="relative z-10 w-full mt-2">
            <h2 className="text-2xl font-black font-display">{username}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-accent font-bold">{formatCurrency(balance)} FC</span> disponibles
            </p>

            {/* XP Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Niveau {profile.level}</span>
                <span>{profile.xp} XP</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((profile.xp % (profile.level * profile.level * 100)) / (profile.level * profile.level * 100) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={<Flame className="text-orange-500 w-5 h-5" />} title="Total misé" value={`${formatCurrency(stats.totalWagered)} FC`} />
          <StatCard icon={<Trophy className="text-yellow-500 w-5 h-5" />} title="Total gagné" value={`${formatCurrency(stats.totalWon)} FC`} />
          <StatCard icon={<Target className="text-emerald-500 w-5 h-5" />} title="Meilleur gain" value={`${formatCurrency(stats.bestWin)} FC`} />
          <StatCard icon={<Gamepad2 className="text-blue-500 w-5 h-5" />} title="Parties jouées" value={stats.gamesPlayed.toString()} />
        </div>
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/20">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Historique des parties</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Aucune partie jouée</div>
        ) : (
          <div className="divide-y divide-border/50">
            {history.slice(0, 20).map(h => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/10 transition-colors text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-xs font-bold text-primary">
                    {h.game.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{h.game}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(h.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-mono ${h.payout > h.wager ? 'text-emerald-400' : 'text-red-400'}`}>
                    {h.payout > h.wager ? '+' : ''}{formatCurrency(h.payout - h.wager)} FC
                  </p>
                  <p className="text-xs text-muted-foreground">{h.multiplier}x sur {formatCurrency(h.wager)} FC</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-primary/50 transition-all group hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2.5 bg-muted rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</div>
      </div>
      <div className="text-xl font-black font-mono truncate" title={value}>{value}</div>
    </div>
  );
}
