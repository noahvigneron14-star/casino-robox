import { useState, useRef } from "react";
import { useCasinoStore } from "@/store/use-casino-store";
import { PackageOpen, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

type Rarity = "common" | "uncommon" | "rare" | "legendary";

type Item = {
  name: string;
  emoji: string;
  rarity: Rarity;
  value: number; // multiplier of case price
};

type CaseType = {
  name: string;
  emoji: string;
  price: number;
  color: string;
  glow: string;
  items: Item[];
};

const RARITY_COLORS: Record<Rarity, string> = {
  common: "border-slate-500 bg-slate-500/10 text-slate-400",
  uncommon: "border-blue-500 bg-blue-500/10 text-blue-400",
  rare: "border-purple-500 bg-purple-500/10 text-purple-400",
  legendary: "border-amber-500 bg-amber-500/10 text-amber-400",
};

const RARITY_GLOW: Record<Rarity, string> = {
  common: "",
  uncommon: "shadow-blue-500/40",
  rare: "shadow-purple-500/50",
  legendary: "shadow-amber-500/60",
};

const CASES: CaseType[] = [
  {
    name: "Bronze",
    emoji: "📦",
    price: 50,
    color: "border-orange-700 bg-orange-900/20",
    glow: "shadow-orange-700/30",
    items: [
      { name: "Basic Sword", emoji: "⚔️", rarity: "common", value: 0.5 },
      { name: "Wood Shield", emoji: "🛡️", rarity: "common", value: 0.7 },
      { name: "Iron Helmet", emoji: "⛑️", rarity: "common", value: 1.0 },
      { name: "Magic Wand", emoji: "🪄", rarity: "uncommon", value: 2.0 },
      { name: "Ruby Gem", emoji: "💎", rarity: "rare", value: 5.0 },
      { name: "Golden Trophy", emoji: "🏆", rarity: "legendary", value: 15.0 },
    ],
  },
  {
    name: "Silver",
    emoji: "🥈",
    price: 200,
    color: "border-slate-400 bg-slate-400/10",
    glow: "shadow-slate-400/30",
    items: [
      { name: "Steel Blade", emoji: "🗡️", rarity: "common", value: 0.6 },
      { name: "Potion", emoji: "🧪", rarity: "common", value: 0.8 },
      { name: "Enchanted Ring", emoji: "💍", rarity: "uncommon", value: 1.8 },
      { name: "Crystal Ball", emoji: "🔮", rarity: "uncommon", value: 2.5 },
      { name: "Phoenix Feather", emoji: "🪶", rarity: "rare", value: 6.0 },
      { name: "Dragon Egg", emoji: "🥚", rarity: "legendary", value: 20.0 },
    ],
  },
  {
    name: "Gold",
    emoji: "🥇",
    price: 500,
    color: "border-amber-400 bg-amber-400/10",
    glow: "shadow-amber-400/30",
    items: [
      { name: "Thunder Hammer", emoji: "🔨", rarity: "uncommon", value: 1.2 },
      { name: "Sapphire Amulet", emoji: "🔵", rarity: "uncommon", value: 2.0 },
      { name: "Spirit Orb", emoji: "🌟", rarity: "rare", value: 4.0 },
      { name: "Cosmic Armor", emoji: "🛡️", rarity: "rare", value: 7.0 },
      { name: "Void Blade", emoji: "⚡", rarity: "legendary", value: 15.0 },
      { name: "Ancient Crown", emoji: "👑", rarity: "legendary", value: 30.0 },
    ],
  },
  {
    name: "Diamond",
    emoji: "💎",
    price: 1000,
    color: "border-cyan-400 bg-cyan-400/10",
    glow: "shadow-cyan-400/30",
    items: [
      { name: "Celestial Bow", emoji: "🏹", rarity: "uncommon", value: 1.5 },
      { name: "Mystic Staff", emoji: "🪄", rarity: "rare", value: 3.0 },
      { name: "Shadow Cloak", emoji: "🌑", rarity: "rare", value: 6.0 },
      { name: "Time Crystal", emoji: "🔷", rarity: "legendary", value: 12.0 },
      { name: "Galaxy Sword", emoji: "🌌", rarity: "legendary", value: 25.0 },
      { name: "God Hammer", emoji: "⚡", rarity: "legendary", value: 50.0 },
    ],
  },
];

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 12,
  legendary: 3,
};

function pickItem(items: Item[]): Item {
  const weighted = items.flatMap((item) =>
    Array.from({ length: RARITY_WEIGHTS[item.rarity] }, () => item)
  );
  return weighted[Math.floor(Math.random() * weighted.length)];
}

const REEL_LENGTH = 30;

export default function CasesGame() {
  const { balance, deductBalance, recordGameResult } = useCasinoStore();
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [opening, setOpening] = useState(false);
  const [reelItems, setReelItems] = useState<Item[]>([]);
  const [reelPosition, setReelPosition] = useState(0);
  const [revealedItem, setRevealedItem] = useState<Item | null>(null);
  const [phase, setPhase] = useState<"select" | "opening" | "revealed">("select");

  const openCase = (caseType: CaseType) => {
    if (opening || caseType.price > balance) return;
    if (!deductBalance(caseType.price)) return;

    setSelectedCase(caseType);
    setRevealedItem(null);
    setPhase("opening");
    setOpening(true);

    // Generate reel
    const winner = pickItem(caseType.items);
    const reel: Item[] = Array.from({ length: REEL_LENGTH }, (_, i) =>
      i === REEL_LENGTH - 5 ? winner : pickItem(caseType.items)
    );
    setReelItems(reel);
    setReelPosition(0);

    // Animate reel
    let pos = 0;
    const totalFrames = 60;
    const animate = () => {
      pos++;
      const eased = Math.min(pos / totalFrames, 1);
      const ease = 1 - Math.pow(1 - eased, 4);
      setReelPosition(ease * (REEL_LENGTH - 6) * 120);

      if (pos < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setRevealedItem(winner);
        setOpening(false);
        setPhase("revealed");
        recordGameResult("Cases", caseType.price, winner.value);
        if (winner.rarity === "legendary") {
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.4 }, colors: ["#f59e0b", "#fbbf24", "#fcd34d"] });
        } else if (winner.rarity === "rare") {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 }, colors: ["#8b5cf6", "#a78bfa"] });
        }
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-display font-black flex items-center gap-3">
        <PackageOpen className="w-8 h-8 text-orange-500" /> Case Opening
      </h1>

      {phase === "select" && (
        <>
          <p className="text-muted-foreground">Choose a case to open. Each case contains items of varying rarity and value.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CASES.map((c) => (
              <motion.button
                key={c.name}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openCase(c)}
                disabled={c.price > balance}
                className={`
                  relative p-6 rounded-2xl border-2 ${c.color} text-center cursor-pointer
                  shadow-lg ${c.glow} transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
              >
                {c.price > balance && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="text-5xl mb-3">{c.emoji}</div>
                <p className="font-display font-black text-xl">{c.name}</p>
                <p className="text-sm font-bold text-accent mt-1">{formatCurrency(c.price)} FC</p>
              </motion.button>
            ))}
          </div>

          {/* All Items Preview */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">Possible Items</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CASES.flatMap((c) => c.items).filter((item, i, arr) => arr.findIndex((x) => x.name === item.name) === i).map((item) => (
                <div key={item.name} className={`p-3 rounded-xl border-2 text-center text-xs ${RARITY_COLORS[item.rarity]}`}>
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <p className="font-bold truncate">{item.name}</p>
                  <p className="text-muted-foreground capitalize">{item.rarity}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {phase === "opening" && selectedCase && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">Opening {selectedCase.name} Case...</p>
          </div>

          {/* Reel */}
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden" style={{ height: "160px" }}>
            {/* Center indicator */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary z-10" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-28 border-l-2 border-r-2 border-primary/60 z-10" />

            <div
              className="flex items-center h-full gap-2 px-4 absolute"
              style={{ transform: `translateX(-${reelPosition}px)`, transition: opening ? "none" : "transform 0.3s ease" }}
            >
              {reelItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 w-28 h-32 rounded-xl border-2 flex flex-col items-center justify-center text-center ${RARITY_COLORS[item.rarity]} shadow-lg ${RARITY_GLOW[item.rarity]}`}
                >
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <p className="text-xs font-bold px-1 truncate w-full text-center">{item.name}</p>
                  <p className="text-xs opacity-70 capitalize">{item.rarity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      )}

      {phase === "revealed" && revealedItem && selectedCase && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You opened: {selectedCase.name} Case</p>
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`inline-flex flex-col items-center p-8 rounded-2xl border-4 shadow-2xl ${RARITY_COLORS[revealedItem.rarity]} ${RARITY_GLOW[revealedItem.rarity]}`}
            >
              <div className="text-7xl mb-4">{revealedItem.emoji}</div>
              <p className="text-2xl font-display font-black">{revealedItem.name}</p>
              <p className="capitalize text-sm mt-1 font-bold opacity-80">{revealedItem.rarity}</p>
              <p className="text-accent font-bold text-lg mt-2">
                {formatCurrency(selectedCase.price * revealedItem.value)} FC
              </p>
            </motion.div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => openCase(selectedCase)}
              disabled={selectedCase.price > balance}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-xl disabled:opacity-40"
            >
              Open Again
            </Button>
            <Button
              onClick={() => setPhase("select")}
              variant="outline"
              className="font-bold py-3 px-8 rounded-xl"
            >
              Choose Different Case
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Balance: {formatCurrency(balance)} FC
          </div>
        </div>
      )}
    </div>
  );
}
