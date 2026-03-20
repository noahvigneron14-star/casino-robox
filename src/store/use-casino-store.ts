import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BetHistory = {
  id: string;
  game: string;
  wager: number;
  multiplier: number;
  payout: number;
  timestamp: number;
};

export type PlayerProfile = {
  username: string;
  avatarId: number;
  xp: number;
  level: number;
};

export type Stats = {
  totalWagered: number;
  totalWon: number;
  bestWin: number;
  gamesPlayed: number;
};

interface CasinoState {
  balance: number;
  profile: PlayerProfile;
  stats: Stats;
  history: BetHistory[];
  lastBonusClaim: number | null;
  
  // Actions
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  deductBalance: (amount: number) => boolean;
  addBalance: (amount: number) => void;
  recordGameResult: (game: string, wager: number, multiplier: number) => void;
  claimDailyBonus: () => { success: boolean; message: string };
  applyPromoCode: (code: string) => { success: boolean; message: string };
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => ({
      balance: 1000, // Starting balance
      profile: {
        username: 'Player_' + Math.floor(Math.random() * 10000),
        avatarId: Math.floor(Math.random() * 10) + 1,
        xp: 0,
        level: 1,
      },
      stats: {
        totalWagered: 0,
        totalWon: 0,
        bestWin: 0,
        gamesPlayed: 0,
      },
      history: [],
      lastBonusClaim: null,

      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),

      deductBalance: (amount) => {
        const { balance } = get();
        if (balance >= amount && amount > 0) {
          set({ balance: balance - amount });
          return true;
        }
        return false;
      },

      addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),

      recordGameResult: (game, wager, multiplier) => set((state) => {
        const payout = wager * multiplier;
        const profit = payout - wager;
        const newXp = state.profile.xp + (wager * 10);
        
        const historyItem: BetHistory = {
          id: Math.random().toString(36).substring(2, 9),
          game,
          wager,
          multiplier,
          payout,
          timestamp: Date.now(),
        };

        return {
          balance: state.balance + payout,
          profile: {
            ...state.profile,
            xp: newXp,
            level: calculateLevel(newXp),
          },
          stats: {
            totalWagered: state.stats.totalWagered + wager,
            totalWon: state.stats.totalWon + (profit > 0 ? profit : 0),
            bestWin: Math.max(state.stats.bestWin, payout),
            gamesPlayed: state.stats.gamesPlayed + 1,
          },
          history: [historyItem, ...state.history].slice(0, 100), // Keep last 100
        };
      }),

      claimDailyBonus: () => {
        const { lastBonusClaim, balance } = get();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (!lastBonusClaim || now - lastBonusClaim > oneDay) {
          set({ balance: balance + 500, lastBonusClaim: now });
          return { success: true, message: "Claimed 500 FC daily bonus!" };
        }
        
        const hoursLeft = Math.ceil((oneDay - (now - lastBonusClaim)) / (1000 * 60 * 60));
        return { success: false, message: `Come back in ${hoursLeft} hours.` };
      },

      applyPromoCode: (code) => {
        const { balance } = get();
        const upperCode = code.toUpperCase();
        if (upperCode === 'FLIP500') {
          set({ balance: balance + 500 });
          return { success: true, message: "Added 500 FC!" };
        }
        if (upperCode === 'LUCKY1000') {
          set({ balance: balance + 1000 });
          return { success: true, message: "Added 1000 FC!" };
        }
        return { success: false, message: "Invalid code." };
      }
    }),
    {
      name: 'flipcasino-storage',
    }
  )
);
