import { useState } from "react";
import { register, login } from "@/lib/accounts";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onSuccess: () => void;
};

export default function LoginPage({ onSuccess }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 300));

    const result = tab === "login"
      ? login(username, password)
      : register(username, password);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-2xl shadow-primary/30 mb-4">
            <span className="text-4xl font-black text-white">F</span>
          </div>
          <h1 className="text-4xl font-display font-black">
            Flip<span className="text-primary">Casino</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Casino virtuel — Monnaie fictive uniquement</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-4 text-sm font-bold transition-all ${
                  tab === t
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "🔑 Connexion" : "✨ Créer un compte"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Pseudo</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="MonPseudo123"
                autoComplete="username"
                className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                required
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Chargement...
                </span>
              ) : tab === "login" ? "Se connecter" : "Créer mon compte"}
            </button>

            {tab === "register" && (
              <p className="text-xs text-center text-muted-foreground">
                Tu reçois <span className="text-accent font-bold">1 000 FC</span> gratuits à l'inscription !
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Site fictif • Monnaie virtuelle sans valeur réelle • 18+
        </p>
      </motion.div>
    </div>
  );
}
