import { Trophy, Medal, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCasinoStore } from "@/store/use-casino-store";

// Generate fake leaderboard data
const FAKE_PLAYERS = [
  { name: 'Whale_Watcher', profit: 1250400, level: 84 },
  { name: 'CryptoKing', profit: 890200, level: 72 },
  { name: 'xX_Slayer_Xx', profit: 540000, level: 65 },
  { name: 'LuckyDrop', profit: 420100, level: 58 },
  { name: 'Shadow_99', profit: 310500, level: 49 },
  { name: 'FlipMaster', profit: 280000, level: 42 },
  { name: 'GamerGod', profit: 150000, level: 35 },
  { name: 'NoobSaibot', profit: 95000, level: 28 },
  { name: 'HighRoller', profit: 82000, level: 25 },
];

export default function Leaderboard() {
  const { profile, stats } = useCasinoStore();
  const netProfit = stats.totalWon - stats.totalWagered;

  // Insert real player into fake data and sort
  const allPlayers = [
    ...FAKE_PLAYERS,
    { name: profile.username, profit: netProfit, level: profile.level, isCurrentPlayer: true }
  ].sort((a, b) => b.profit - a.profit).slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-4">
          <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        </div>
        <h1 className="text-4xl font-display font-black mb-2">Top Players</h1>
        <p className="text-muted-foreground">The most profitable players on FlipCasino</p>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4 text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {allPlayers.map((player, index) => (
              <tr 
                key={player.name} 
                className={`transition-colors hover:bg-muted/30 ${player.isCurrentPlayer ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
              >
                <td className="px-6 py-4">
                  {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                  {index === 1 && <Medal className="w-6 h-6 text-slate-400" />}
                  {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                  {index > 2 && <span className="text-muted-foreground font-bold text-lg w-6 inline-block text-center">{index + 1}</span>}
                </td>
                <td className="px-6 py-4 font-bold flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${player.isCurrentPlayer ? 'bg-primary' : 'bg-slate-700'}`}>
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={player.isCurrentPlayer ? 'text-primary' : ''}>{player.name}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs font-bold">
                    <Star className="w-3 h-3 text-primary" /> {player.level}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold">
                  <span className={player.profit >= 0 ? 'text-emerald-400' : 'text-destructive'}>
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
