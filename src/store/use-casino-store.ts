import { create } from 'zustand';
import {
  getAccount, updateAccount, getCurrentSession, getAccounts,
  type Account
} from '@/lib/accounts';

export type { Account };

interface CasinoState {
  username: string | null;
  balance: number;
  profile: Account['profile'];
  stats: Account['stats'];
  history: Account['history'];
  lastBonusClaim: number | null;

  // Session management
  loadSession: () => void;
  refreshFromStorage: () => void;

  // Balance ops
  deductBalance: (amount: number) => boolean;
  addBalance: (amount: number) => void;
  recordGameResult: (game: string, wager: number, multiplier: number) => void;

  // Profile
  updateProfile: (updates: Partial<Account['profile'] & { username?: string }>) => void;

  // Bonus
  claimDailyBonus: () => { success: boolean; message: string };
  applyPromoCode: (code: string) => { success: boolean; message: string };
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

function readCurrentAccount() {
  const username = getCurrentSession();
  if (!username) return null;
  return getAccount(username);
}

export const useCasinoStore = create<CasinoState>()((set, get) => ({
  username: null,
  balance: 0,
  profile: { avatarId: 1, xp: 0, level: 1 },
  stats: { totalWagered: 0, totalWon: 0, bestWin: 0, gamesPlayed: 0 },
  history: [],
  lastBonusClaim: null,

  loadSession: () => {
    const account = readCurrentAccount();
    if (account) {
      set({
        username: account.username,
        balance: account.balance,
        profile: account.profile,
        stats: account.stats,
        history: account.history,
        lastBonusClaim: account.lastBonusClaim,
      });
    } else {
      set({ username: null });
    }
  },

  refreshFromStorage: () => {
    const account = readCurrentAccount();
    if (account) {
      set({
        balance: account.balance,
        profile: account.profile,
        stats: account.stats,
        history: account.history,
        lastBonusClaim: account.lastBonusClaim,
      });
    }
  },

  deductBalance: (amount) => {
    const { balance, username } = get();
    if (!username || balance < amount || amount <= 0) return false;
    const newBalance = balance - amount;
    set({ balance: newBalance });
    updateAccount(username, { balance: newBalance });
    return true;
  },

  addBalance: (amount) => {
    const { balance, username } = get();
    if (!username) return;
    const newBalance = balance + amount;
    set({ balance: newBalance });
    updateAccount(username, { balance: newBalance });
  },

  recordGameResult: (game, wager, multiplier) => {
    const { balance, username, profile, stats, history } = get();
    if (!username) return;

    const payout = wager * multiplier;
    const profit = payout - wager;
    const newXp = profile.xp + Math.floor(wager * 10);
    const newBalance = balance + payout;

    const historyItem: Account['history'][0] = {
      id: Math.random().toString(36).slice(2),
      game,
      wager,
      multiplier,
      payout,
      timestamp: Date.now(),
    };

    const newProfile = { ...profile, xp: newXp, level: calculateLevel(newXp) };
    const newStats = {
      totalWagered: stats.totalWagered + wager,
      totalWon: stats.totalWon + (profit > 0 ? profit : 0),
      bestWin: Math.max(stats.bestWin, payout),
      gamesPlayed: stats.gamesPlayed + 1,
    };
    const newHistory = [historyItem, ...history].slice(0, 100);

    set({ balance: newBalance, profile: newProfile, stats: newStats, history: newHistory });
    updateAccount(username, {
      balance: newBalance,
      profile: newProfile,
      stats: newStats,
      history: newHistory,
    });
  },

  updateProfile: (updates) => {
    const { profile, username } = get();
    if (!username) return;
    const newProfile = { ...profile, ...updates };
    set({ profile: newProfile });
    updateAccount(username, { profile: newProfile });
  },

  claimDailyBonus: () => {
    const { lastBonusClaim, username } = get();
    if (!username) return { success: false, message: 'Non connecté' };
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastBonusClaim || now - lastBonusClaim > oneDay) {
      get().addBalance(500);
      const newTime = now;
      set({ lastBonusClaim: newTime });
      updateAccount(username, { lastBonusClaim: newTime });
      return { success: true, message: '500 FC récupérés !' };
    }
    const hoursLeft = Math.ceil((oneDay - (now - lastBonusClaim)) / (1000 * 60 * 60));
    return { success: false, message: `Reviens dans ${hoursLeft}h` };
  },

  applyPromoCode: (code) => {
    const upper = code.toUpperCase().trim();
    if (upper === 'FLIP500') { get().addBalance(500); return { success: true, message: '+500 FC !' }; }
    if (upper === 'LUCKY1000') { get().addBalance(1000); return { success: true, message: '+1000 FC !' }; }
    if (upper === 'RAIN2024') { get().addBalance(2000); return { success: true, message: '+2000 FC !' }; }
    return { success: false, message: 'Code invalide' };
  },
}));

// Auto-refresh balance from storage every 3 seconds (other tabs / rain effects)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useCasinoStore.getState();
    if (state.username) {
      const account = getAccount(state.username);
      if (account && account.balance !== state.balance) {
        state.refreshFromStorage();
      }
    }
  }, 3000);
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function getAllPlayers() {
  const accounts = getAccounts();
  return Object.values(accounts).sort((a, b) => (b.stats.totalWon - a.stats.totalWon));
}
