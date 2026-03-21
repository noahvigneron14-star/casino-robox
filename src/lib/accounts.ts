export type Account = {
  username: string;
  passwordHash: string;
  balance: number;
  stats: {
    totalWagered: number;
    totalWon: number;
    bestWin: number;
    gamesPlayed: number;
  };
  profile: {
    avatarId: number;
    xp: number;
    level: number;
  };
  history: Array<{
    id: string;
    game: string;
    wager: number;
    multiplier: number;
    payout: number;
    timestamp: number;
  }>;
  lastBonusClaim: number | null;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system' | 'rain' | 'give';
};

const ACCOUNTS_KEY = 'fc-accounts-v3';
const SESSION_KEY = 'fc-session-v3';
const CHAT_KEY = 'fc-chat-v3';

function hashPassword(password: string): string {
  return btoa(password + 'flipcasino-salt-2024');
}

export function getAccounts(): Record<string, Account> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAccounts(accounts: Record<string, Account>): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getCurrentSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setCurrentSession(username: string | null): void {
  if (username) localStorage.setItem(SESSION_KEY, username);
  else localStorage.removeItem(SESSION_KEY);
}

export function register(username: string, password: string): { success: boolean; message: string } {
  if (!username || username.length < 3) return { success: false, message: 'Pseudo trop court (min 3 caractères)' };
  if (!password || password.length < 4) return { success: false, message: 'Mot de passe trop court (min 4 caractères)' };
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return { success: false, message: 'Pseudo invalide (lettres, chiffres, _ uniquement)' };

  const accounts = getAccounts();
  const lower = username.toLowerCase();

  if (Object.keys(accounts).some(k => k.toLowerCase() === lower)) {
    return { success: false, message: 'Ce pseudo est déjà pris' };
  }

  const newAccount: Account = {
    username,
    passwordHash: hashPassword(password),
    balance: 1000,
    stats: { totalWagered: 0, totalWon: 0, bestWin: 0, gamesPlayed: 0 },
    profile: { avatarId: Math.floor(Math.random() * 10) + 1, xp: 0, level: 1 },
    history: [],
    lastBonusClaim: null,
    createdAt: Date.now(),
  };

  accounts[username] = newAccount;
  saveAccounts(accounts);
  setCurrentSession(username);

  addChatMessage({ username: '🎰 Système', message: `Bienvenue ${username} ! Tu as reçu 1 000 FC de bienvenue 🎉`, type: 'system' });
  return { success: true, message: 'Compte créé !' };
}

export function login(username: string, password: string): { success: boolean; message: string } {
  const accounts = getAccounts();
  const account = accounts[username];

  if (!account) return { success: false, message: 'Pseudo introuvable' };
  if (account.passwordHash !== hashPassword(password)) return { success: false, message: 'Mot de passe incorrect' };

  setCurrentSession(username);
  addChatMessage({ username: '🎰 Système', message: `${username} vient de se connecter 👋`, type: 'system' });
  return { success: true, message: 'Connexion réussie !' };
}

export function logout(): void {
  setCurrentSession(null);
}

export function getAccount(username: string): Account | null {
  const accounts = getAccounts();
  return accounts[username] || null;
}

export function updateAccount(username: string, updates: Partial<Account>): void {
  const accounts = getAccounts();
  if (!accounts[username]) return;
  accounts[username] = { ...accounts[username], ...updates };
  saveAccounts(accounts);
}

export function giveCoins(
  fromUsername: string,
  fromPassword: string,
  toUsername: string,
  amount: number
): { success: boolean; message: string } {
  const accounts = getAccounts();
  const from = accounts[fromUsername];
  const to = accounts[toUsername];

  if (!from) return { success: false, message: 'Compte source introuvable' };
  if (from.passwordHash !== hashPassword(fromPassword)) return { success: false, message: 'Mot de passe incorrect' };
  if (!to) return { success: false, message: `Joueur "${toUsername}" introuvable` };
  if (amount <= 0) return { success: false, message: 'Montant invalide' };
  if (from.balance < amount) return { success: false, message: 'Solde insuffisant' };

  accounts[fromUsername].balance -= amount;
  accounts[toUsername].balance += amount;
  saveAccounts(accounts);

  addChatMessage({
    username: '🎰 Système',
    message: `${fromUsername} a offert ${amount.toFixed(0)} FC à ${toUsername} 💸`,
    type: 'give',
  });

  return { success: true, message: `${amount} FC envoyés à ${toUsername} !` };
}

export function rainCoins(
  fromUsername: string,
  amount: number
): { success: boolean; message: string; recipients: string[] } {
  const accounts = getAccounts();
  const from = accounts[fromUsername];

  if (!from) return { success: false, message: 'Compte introuvable', recipients: [] };
  if (from.balance < amount) return { success: false, message: 'Solde insuffisant', recipients: [] };

  const others = Object.keys(accounts).filter(u => u !== fromUsername);
  const recipients = others.length > 0 ? others : [];

  if (recipients.length === 0) {
    // Give back to self if no other players
    accounts[fromUsername].balance -= amount;
    const pot = amount * 0.95;
    accounts[fromUsername].balance += pot;
    saveAccounts(accounts);
    addChatMessage({
      username: '🌧️ RAIN',
      message: `${fromUsername} lance une pluie de ${amount.toFixed(0)} FC ! 🌧️💰 Personne d'autre en ligne... coins ajoutés au pot.`,
      type: 'rain',
    });
    return { success: true, message: 'Rain lancée !', recipients: [] };
  }

  accounts[fromUsername].balance -= amount;
  const perPerson = Math.floor(amount / recipients.length);
  recipients.forEach(u => {
    accounts[u].balance += perPerson;
  });
  saveAccounts(accounts);

  addChatMessage({
    username: '🌧️ RAIN',
    message: `${fromUsername} fait pleuvoir ${amount.toFixed(0)} FC ! 🌧️💰 Chaque joueur reçoit ${perPerson} FC ! (${recipients.join(', ')})`,
    type: 'rain',
  });

  return { success: true, message: `${amount} FC distribués à ${recipients.length} joueurs !`, recipients };
}

export function getChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): void {
  const chat = getChat();
  const newMsg: ChatMessage = {
    ...msg,
    id: Math.random().toString(36).slice(2),
    timestamp: Date.now(),
  };
  const updated = [...chat.slice(-99), newMsg];
  localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
}
