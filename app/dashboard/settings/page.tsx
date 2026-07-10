"use client";

import { useState, useRef, useEffect } from "react";
import { User, Lock, Info, AlertTriangle, Check, AlertCircle, Copy, CheckCircle, Eye, EyeOff, Settings, Camera } from "lucide-react";
import { getUser, clearAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";
import PageHeader from "../../components/PageHeader";

const SECTIONS = [
  { id: "profil",   label: "Profil",        icon: User         },
  { id: "securite", label: "Sécurité",       icon: Lock         },
  { id: "compte",   label: "Infos compte",   icon: Info         },
  { id: "danger",   label: "Danger zone",    icon: AlertTriangle},
] as const;
type Section = typeof SECTIONS[number]["id"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 9,
  border: "1.5px solid #e2e8f0", background: "#f8fafc",
  color: "#0f172a", fontSize: 14, outline: "none",
  transition: "border-color 0.15s, background 0.15s", boxSizing: "border-box",
};
const ACCENT = "#7c3aed";
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; };
const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; };

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>{children}</label>
);
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style }}>{children}</div>
);
const Divider = () => <div style={{ height: 1, background: "#f1f5f9", margin: "24px 0" }} />;
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{children}</h3>
);
const SectionSub = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>{children}</p>
);

function pwStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (pw.length >= 12)             score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^a-zA-Z0-9]/.test(pw))   score++;
  if (score <= 1) return { score, label: "Très faible", color: "#ef4444" };
  if (score === 2) return { score, label: "Faible",     color: "#f97316" };
  if (score === 3) return { score, label: "Moyen",      color: "#f59e0b" };
  if (score === 4) return { score, label: "Fort",       color: "#10b981" };
  return { score, label: "Très fort", color: "#06b6d4" };
}

export default function SettingsPage() {
  // Loaded post-mount, not read directly from localStorage during render — this page is
  // statically exported, so rendering user-derived text synchronously here would make the
  // server-rendered HTML (no user) mismatch the client's first paint (real user), triggering
  // a React hydration error.
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const router = useRouter();
  const [active, setActive] = useState<Section>("profil");

  const [fullName, setFullName] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [saveErr,  setSaveErr]  = useState("");

  const [oldPw,     setOldPw]     = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwSaved,   setPwSaved]   = useState(false);
  const [pwErr,     setPwErr]     = useState("");

  const [idCopied,       setIdCopied]       = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState("");
  const [deleting,       setDeleting]       = useState(false);
  const [avatarUrl,      setAvatarUrl]      = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setFullName(u?.full_name ?? "");
    const saved = localStorage.getItem("vyxen_avatar");
    if (saved) setAvatarUrl(saved);
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveErr("L'image doit faire moins de 2 Mo."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      localStorage.setItem("vyxen_avatar", b64);
      setAvatarUrl(b64);
    };
    reader.readAsDataURL(file);
  }

  const strength = newPw ? pwStrength(newPw) : null;

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaveErr("");
    try {
      await api.put("/auth/me", { full_name: fullName });
      const stored = localStorage.getItem("dealyze_user");
      if (stored) { const p = JSON.parse(stored); p.full_name = fullName; localStorage.setItem("dealyze_user", JSON.stringify(p)); }
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setSaveErr((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur de sauvegarde.");
    } finally { setSaving(false); }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault(); setPwErr("");
    if (newPw.length < 6) { setPwErr("Minimum 6 caractères."); return; }
    if (newPw !== confirmPw) { setPwErr("Les mots de passe ne correspondent pas."); return; }
    setPwSaving(true);
    try {
      await api.put("/auth/change-password", { ancien_mot_de_passe: oldPw, nouveau_mot_de_passe: newPw });
      setPwSaved(true); setOldPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err: unknown) {
      setPwErr((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Mot de passe actuel incorrect.");
    } finally { setPwSaving(false); }
  }

  function copyId() {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id).then(() => { setIdCopied(true); setTimeout(() => setIdCopied(false), 2000); });
  }

  function handleDelete() {
    if (deleteConfirm !== "supprimer") return;
    setDeleting(true);
    setTimeout(() => { clearAuth(); router.push("/login"); }, 1000);
  }

  const planColors: Record<string, string> = {
    free_trial: "#a78bfa", starter: "#3b82f6", growth: "#7c3aed", enterprise: "#10b981",
  };
  const planColor = planColors[user?.plan ?? "free_trial"] ?? "#a78bfa";

  return (
    <div className="w-full">
      <PageHeader
        title="Paramètres"
        subtitle="Gérez votre profil, sécurité et préférences de compte"
        accentColor="#7c3aed"
        icon={<Settings size={22} style={{ color: "#7c3aed" }} strokeWidth={1.75} />}
      />
      <div className="grid lg:grid-cols-[200px_1fr] gap-6">

        {/* Left nav */}
        <div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              const isDanger = id === "danger";
              return (
                <button key={id} onClick={() => setActive(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                    borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                    background: isActive ? (isDanger ? "#fef2f2" : "#ede9fe") : "transparent",
                    color: isActive ? (isDanger ? "#ef4444" : ACCENT) : isDanger ? "#ef444477" : "#64748b",
                    fontSize: 13, fontWeight: isActive ? 600 : 400, transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon size={14} strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div>

          {/* PROFIL */}
          {active === "profil" && (
            <Card>
              <SectionTitle>Profil</SectionTitle>
              <SectionSub>Gérez vos informations personnelles</SectionSub>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" style={{ width: 72, height: 72, borderRadius: 18, objectFit: "cover", border: "2px solid #ede9fe", display: "block" }} />
                  ) : (
                    <div style={{
                      width: 72, height: 72, borderRadius: 18,
                      background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, fontWeight: 700, color: "#fff",
                      boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
                    }}>
                      {user?.full_name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{user?.full_name ?? "—"}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>{user?.email}</div>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: ACCENT, background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>
                    <Camera size={12} /> Changer la photo
                  </button>
                </div>
              </div>
              <Divider />
              <form onSubmit={handleProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <Label>Nom complet</Label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <Label>Email</Label>
                  <div style={{ position: "relative" }}>
                    <input type="email" value={user?.email ?? ""} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed", paddingRight: 90 }} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#10b981", background: "#f0fdf4", padding: "3px 8px", borderRadius: 6 }}>
                      <CheckCircle size={11} /> Vérifié
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Profil utilisateur</Label>
                  <div style={{ ...inputStyle, cursor: "not-allowed", opacity: 0.6, display: "flex", alignItems: "center" }}>
                    {user?.profile === "pme" ? "PME / Commercial" : "Investisseur / VC"}
                  </div>
                </div>
                {saveErr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {saveErr}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={saving}
                    style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : saved ? <><Check size={14} /> Sauvegardé</> : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* SÉCURITÉ */}
          {active === "securite" && (
            <Card>
              <SectionTitle>Sécurité</SectionTitle>
              <SectionSub>Mettez à jour votre mot de passe</SectionSub>
              <form onSubmit={handlePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <Label>Mot de passe actuel</Label>
                  <div style={{ position: "relative" }}>
                    <input type={showOld ? "text" : "password"} required value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowOld(!showOld)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                      {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Nouveau mot de passe</Label>
                  <div style={{ position: "relative" }}>
                    <input type={showNew ? "text" : "password"} required value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} onFocus={onFocus} onBlur={onBlur} />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {strength && newPw && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= strength.score ? strength.color : "#e2e8f0", transition: "background 0.3s" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Confirmer le nouveau mot de passe</Label>
                  <input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, borderColor: confirmPw && confirmPw !== newPw ? "#ef4444" : "#e2e8f0" }}
                    onFocus={onFocus} onBlur={onBlur} />
                  {confirmPw && confirmPw !== newPw && (
                    <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>Les mots de passe ne correspondent pas.</p>
                  )}
                </div>
                {pwErr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {pwErr}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={pwSaving}
                    style={{ padding: "11px 24px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: pwSaving ? "default" : "pointer" }}>
                    {pwSaving ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                      : pwSaved ? <><Check size={14} style={{ color: "#10b981" }} /> Modifié avec succès</> : "Mettre à jour le mot de passe"}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* COMPTE */}
          {active === "compte" && (
            <Card>
              <SectionTitle>Informations du compte</SectionTitle>
              <SectionSub>Vue d&apos;ensemble de votre compte VYXEN</SectionSub>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>ID utilisateur</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.id?.slice(0, 20)}…
                    </span>
                    <button onClick={copyId} style={{ background: "none", border: "none", cursor: "pointer", color: idCopied ? "#10b981" : "#94a3b8", flexShrink: 0 }}>
                      {idCopied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Plan actif</div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: `${planColor}18`, color: planColor }}>
                    {user?.plan?.replace("_", " ") ?? "—"}
                  </span>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Date d&apos;inscription</div>
                  <span style={{ fontSize: 13, color: "#334155" }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </span>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Profil</div>
                  <span style={{ fontSize: 13, color: "#334155" }}>
                    {user?.profile === "pme" ? "PME / Commercial" : "Investisseur / VC"}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* DANGER ZONE */}
          {active === "danger" && (
            <div style={{ borderRadius: 16, border: "1px solid #fca5a5", padding: "28px", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <AlertTriangle size={18} style={{ color: "#ef4444" }} strokeWidth={1.75} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ef4444" }}>Zone dangereuse</h3>
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>Ces actions sont irréversibles. Procédez avec précaution.</p>
              <div style={{ background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca", padding: "20px 24px" }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Supprimer le compte</h4>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18, lineHeight: 1.6 }}>
                  La suppression de votre compte effacera définitivement toutes vos données, quotas, et historique. Cette action est irréversible.
                </p>
                <div style={{ marginBottom: 14 }}>
                  <Label>Tapez <strong style={{ color: "#ef4444" }}>supprimer</strong> pour confirmer</Label>
                  <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="supprimer"
                    style={{ ...inputStyle, background: "#fff", borderColor: deleteConfirm === "supprimer" ? "#ef4444" : "#e2e8f0" }}
                    onFocus={(e) => { e.target.style.borderColor = "#ef4444"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = deleteConfirm === "supprimer" ? "#ef4444" : "#e2e8f0"; }}
                  />
                </div>
                <button onClick={handleDelete} disabled={deleteConfirm !== "supprimer" || deleting}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 600, cursor: deleteConfirm !== "supprimer" ? "not-allowed" : "pointer", opacity: deleteConfirm !== "supprimer" ? 0.4 : 1, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => { if (deleteConfirm === "supprimer") { e.currentTarget.style.background = "#fef2f2"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {deleting ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : "Supprimer définitivement mon compte"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
