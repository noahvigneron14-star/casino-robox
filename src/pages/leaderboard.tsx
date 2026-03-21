import { Trophy, Medal, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCasinoStore } from "@/store/use-casino-store";
import { getAccounts } from "@/lib/accounts";

export default function Leaderboard() {
  const { username, profile } = useCasinoStore();

  // Load real accounts from localStorage
  const accounts = getAccounts();
  const realPlayers = Object.values(accounts).map(a => ({
    name: a.username,
    profit: a.stats.totalWon - a.stats.totalWagered,
    level: a.profile.level,
    isCurrentPlayer: a.username === username,
    isReal: true,
  }));

  // Simulated players to pad the board
  const FAKE_PLAYERS = [
    { name: 'Whale_Watcher', profit: 1250400, level: 84, isCurrentPlayer: false, isReal: false },
    { name: 'CryptoKing', profit: 890200, level: 72, isCurrentPlayer: false, isReal: false },
    { name: 'xX_Slayer_Xx', profit: 540000, level: 65, isCurrentPlayer: false, isReal: false },
    { name: 'LuckyDrop', profit: 420100, level: 58, isCurrentPlayer: false, isReal: false },
    { name: 'Shadow_99', profit: 310500, level: 49, isCurrentPlayer: false, isReal: false },
    { name: 'FlipMaster', profit: 280000, level: 42, isCurrentPlayer: false, isReal: false },
    { name: 'GoldRush', profit: 150000, level: 35, isCurrentPlayer: false, isReal: false },
    { name: 'NoobSaibot', profit: 95000, level: 28, isCurrentPlayer: false, isReal: false },
  ];

  // Merge (prefer real player data over fake ones with same name)
  const realNames = new Set(realPlayers.map(p => p.name));
  const fakeFiltered = FAKE_PLAYERS.filter(p => !realNames.has(p.name));
  const allPlayers = [...realPlayers, ...fakeFiltered]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 12);

  const rankIcon = (i: number) => {
    if (i === 0) return <Medal className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
    if (i === 1) return <Medal className="w-6 h-6 text-slate-300" />;
    if (i === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-muted-foreground font-bold text-sm w-6 inline-block text-center">#{i + 1}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-2xl mb-4 border border-yellow-500/20">
          <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        </div>
        <h1 className="text-4xl font-display font-black mb-2">Classement</h1>
        <p className="text-muted-foreground text-sm">Les joueurs les plus profitables sur FlipCasino</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {allPlayers.slice(0, 3).map((p, i) => (
          <div
            key={p.name}
            className={`bg-card border rounded-2xl p-4 text-center flex flex-col items-center gap-2 transition-all ${
              i === 0 ? 'border-yellow-500/30 bg-yellow-500/5 shadow-lg shadow-yellow-500/10' :
              i === 1 ? 'border-slate-400/20' :
              'border-amber-700/20'
            } ${p.isCurrentPlayer ? 'ring-2 ring-primary/60' : ''}`}
            style={{ order: i === 0 ? 2 : i === 1 ? 1 : 3 }}
          >
            <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-primary/80 to-secondary/80">
              {p.name.substring(0, 2).toUpperCase()}
            </div>
            <p className={`text-xs font-bold truncate w-full ${p.isCurrentPlayer ? 'text-primary' : ''}`}>{p.name}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-primary" />Niv. {p.level}</p>
            <p className={`text-xs font-bold font-mono ${p.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {p.profit >= 0 ? '+' : ''}{formatCurrency(p.profit)} FC
            </p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              <th className="px-4 py-3">Rang</th>
              <th className="px-4 py-3">Joueur</th>
              <th className="px-4 py-3 hidden sm:table-cell">Niveau</th>
              <th className="px-4 py-3 text-right">Profit net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {allPlayers.map((player, index) => (
              <tr
                key={player.name}
                className={`transition-colors hover:bg-muted/20 ${player.isCurrentPlayer ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
              >
                <td className="px-4 py-3">{rankIcon(index)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white font-bold ${player.isReal ? '' : 'opacity-60'}`}
                      style={{ background: player.isReal ? `hsl(${(player.name.charCodeAt(0) * 137.5) % 360}, 60%, 40%)` : '#334155' }}
                    >
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`font-semibold text-sm ${player.isCurrentPlayer ? 'text-primary' : ''}`}>
                      {player.name}
                      {player.isCurrentPlayer && <span className="ml-1.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">Toi</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-xs font-bold">
                    <Star className="w-3 h-3 text-primary" /> {player.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                  <span className={player.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {player.profit >= 0 ? '+' : ''}{formatCurrency(player.profit)} FC
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
