"use client";

import { useState } from "react";
import { User, Lock, Check, AlertCircle } from "lucide-react";
import { getUser } from "../../lib/auth";
import { api } from "../../lib/api";

const FIELD = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white";
const FE = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#2563EB"),
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#E2E8F0"),
};

export default function SettingsPage() {
  const user = getUser();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await api.put("/auth/me", { full_name: fullName });
      const stored = localStorage.getItem("dealyze_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.full_name = fullName;
        localStorage.setItem("dealyze_user", JSON.stringify(parsed));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setSaveError(msg || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6) { setPwError("Le nouveau mot de passe doit faire au moins 6 caractères."); return; }
    setChangingPw(true);
    setPwError("");
    try {
      await api.put("/auth/change-password", {
        ancien_mot_de_passe: oldPw,
        nouveau_mot_de_passe: newPw,
      });
      setPwSaved(true);
      setOldPw("");
      setNewPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPwError(msg || "Mot de passe actuel incorrect.");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            <User size={18} />
          </div>
          <h3 className="font-semibold" style={{ color: "#0F2552" }}>Profil</h3>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom complet</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Email</label>
            <input type="email" value={user?.email ?? ""} disabled className={FIELD + " opacity-50 cursor-not-allowed"} style={{ borderColor: "#E2E8F0" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Profil utilisateur</label>
            <div className="px-4 py-3 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#FAFAFA" }}>
              {user?.profile === "pme" ? "PME / Commercial" : "Investisseur / VC"}
            </div>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              <AlertCircle size={16} />{saveError}
            </div>
          )}

          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#2563EB" }}>
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : saved
              ? <><Check size={16} /> Sauvegardé</>
              : "Enregistrer"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            <Lock size={18} />
          </div>
          <h3 className="font-semibold" style={{ color: "#0F2552" }}>Changer le mot de passe</h3>
        </div>

        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Mot de passe actuel</label>
            <input type="password" required value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="••••••••" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Nouveau mot de passe</label>
            <input type="password" required value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
          </div>

          {pwError && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              <AlertCircle size={16} />{pwError}
            </div>
          )}

          <button type="submit" disabled={changingPw} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#0F2552" }}>
            {changingPw
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : pwSaved
              ? <><Check size={16} /> Modifié avec succès</>
              : "Changer le mot de passe"}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold mb-4" style={{ color: "#0F2552" }}>Informations du compte</h3>
        <div className="space-y-3">
          {[
            { label: "ID utilisateur", value: user?.id ? user.id.slice(0, 16) + "…" : "—" },
            { label: "Plan actif", value: user?.plan ?? "—" },
            { label: "Profil", value: user?.profile === "pme" ? "PME / Commercial" : "Investisseur / VC" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-400">{row.label}</span>
              <span className="text-sm font-mono font-medium capitalize" style={{ color: "#0F2552" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
