import { useCasinoStore } from "@/store/use-casino-store";
import { User, Trophy, Flame, Target, Edit2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function Profile() {
  const { profile, stats, updateProfile } = useCasinoStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.username);

  const saveName = () => {
    if (editName.trim().length > 2) {
      updateProfile({ username: editName.trim() });
    }
    setIsEditing(false);
  };

  const winRate = stats.gamesPlayed > 0 ? ((stats.totalWon > 0 ? 1 : 0) * 45 /* simulated */).toFixed(1) : "0.0"; // Placeholder winrate logic

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-display font-black flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-primary" /> Player Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar & Basic Info */}
        <div className="md:col-span-1 bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent z-0" />
          
          <div className="relative z-10 w-32 h-32 rounded-full bg-muted border-4 border-card shadow-xl flex items-center justify-center text-4xl font-bold bg-gradient-to-tr from-slate-700 to-slate-600 text-white mb-6">
            {profile.username.substring(0, 2).toUpperCase()}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-black px-3 py-1 rounded-full border-2 border-card shadow-lg">
              Lv. {profile.level}
            </div>
          </div>
          
          <div className="relative z-10 w-full">
            {isEditing ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-center font-bold focus:border-primary focus:outline-none"
                  autoFocus
                  onBlur={saveName}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 group">
                <h2 className="text-2xl font-black font-display">{profile.username}</h2>
                <button onClick={() => setIsEditing(true)} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>XP Progress</span>
                <span>{profile.xp} / {profile.level * profile.level * 100}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${(profile.xp / (profile.level * profile.level * 100)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={<Flame className="text-orange-500 w-6 h-6" />} title="Total Wagered" value={`${formatCurrency(stats.totalWagered)} FC`} />
          <StatCard icon={<Trophy className="text-yellow-500 w-6 h-6" />} title="Total Won" value={`${formatCurrency(stats.totalWon)} FC`} />
          <StatCard icon={<Target className="text-emerald-500 w-6 h-6" />} title="Best Win" value={`${formatCurrency(stats.bestWin)} FC`} />
          <StatCard icon={<Gamepad2 className="text-blue-500 w-6 h-6" />} title="Games Played" value={stats.gamesPlayed.toString()} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 transition-colors group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-muted rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</div>
      </div>
      <div className="text-2xl font-black font-mono truncate" title={value}>{value}</div>
    </div>
  );
}
