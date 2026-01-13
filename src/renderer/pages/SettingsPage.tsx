import { useState, useEffect } from "react";
import { ConnectionManager } from "@/components/settings/ConnectionManager";
import { getSetting, setSetting, getTokenStatus } from "@/lib/api";
import { Check, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function MnemoTokenSection() {
  const [token, setToken] = useState("");
  const [savedToken, setSavedToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<{
    hasToken: boolean;
    username?: string | null;
    error?: string;
  } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const [setting, tokenStatus] = await Promise.all([
        getSetting("mnemoApiToken"),
        getTokenStatus(),
      ]);
      if (setting?.value) {
        setToken(setting.value);
        setSavedToken(setting.value);
      }
      setStatus(tokenStatus);
      setChecking(false);
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    await setSetting("mnemoApiToken", token.trim());
    setSavedToken(token.trim());
    setSaved(true);
    // Re-check status
    const tokenStatus = await getTokenStatus();
    setStatus(tokenStatus);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleClear() {
    setSaving(true);
    await setSetting("mnemoApiToken", "");
    setToken("");
    setSavedToken("");
    setStatus({ hasToken: false });
    setSaving(false);
  }

  const isDirty = token.trim() !== savedToken;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Personal API Token
        </label>
        <p className="mb-3 text-xs text-zinc-500">
          Generate a token from your{" "}
          <a
            href="https://mnemo.studio/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300"
          >
            mnemo.studio settings
            <ExternalLink className="h-3 w-3" />
          </a>{" "}
          to unlock personalized recommendations and sync your favorites.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your personal API token..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-3 pr-10 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-500/50"
            />
            <button
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty || !token.trim()}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              saved
                ? "bg-green-600/20 text-green-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
            )}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : null}
            {saved ? "Saved" : "Save"}
          </button>
          {savedToken && (
            <button
              onClick={handleClear}
              disabled={saving}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {!checking && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            status?.hasToken && status?.username
              ? "border-green-800/50 bg-green-900/20 text-green-300"
              : status?.hasToken && status?.error
                ? "border-amber-800/50 bg-amber-900/20 text-amber-300"
                : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400"
          )}
        >
          {status?.hasToken && status?.username ? (
            <>
              Connected as <span className="font-medium text-green-200">{status.username}</span>
            </>
          ) : status?.hasToken && status?.error ? (
            <>Token saved but could not verify — {status.error}</>
          ) : (
            <>No token configured — using public API with limited access</>
          )}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-zinc-100">
        Settings
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Configure your preferences and manage your account.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          mnemo.studio Account
        </h2>
        <MnemoTokenSection />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Connection Profiles
        </h2>
        <ConnectionManager />
      </section>
    </div>
  );
}
