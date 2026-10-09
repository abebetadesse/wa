"use client";

import { useState } from "react";
import { EMERGENCY_PROTOCOLS } from "@/lib/offline/knowledgeBase";
import { useLanguage } from "@/lib/i18n/context";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const ETHIOPIAN_HOSPITALS = [
  "Black Lion Hospital (Tikur Anbessa) – Addis Ababa",
  "St. Paul's Hospital Millennium Medical College – Addis Ababa",
  "Yekatit 12 Hospital – Addis Ababa",
  "Addis Ababa Fistula Hospital",
  "Alert Hospital – Addis Ababa",
  "Mekelle Hospital – Tigray",
  "Felege Hiwot Referral Hospital – Amhara",
  "Jimma University Medical Center – Oromia",
  "Hawassa University Referral Hospital – Sidama",
  "Harar Hospital – Harari",
];

export default function EmergencyClient() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: "", phone: "", relationship: "" },
  ]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<{ name: string; dose: string }[]>([]);
  const [bloodType, setBloodType] = useState(t.emergency.unknown);
  const [preferredHospital, setPreferredHospital] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMed, setNewMed] = useState({ name: "", dose: "" });
  const [saved, setSaved] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<keyof typeof EMERGENCY_PROTOCOLS | null>(null);

  const addContact = () =>
    setContacts([...contacts, { name: "", phone: "", relationship: "" }]);

  const updateContact = (i: number, field: keyof EmergencyContact, val: string) => {
    const next = [...contacts];
    next[i][field] = val;
    setContacts(next);
  };

  const removeContact = (i: number) =>
    setContacts(contacts.filter((_, idx) => idx !== i));

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const addMedication = () => {
    if (newMed.name.trim()) {
      setMedications([...medications, { ...newMed }]);
      setNewMed({ name: "", dose: "" });
    }
  };

  const handleSave = () => {
    // In production: POST to /api/emergency/profile
    // For now: save to localStorage as offline fallback
    const profile = {
      contacts: contacts.filter((c) => c.name),
      activeConditions: conditions,
      activeMedications: medications,
      bloodType,
      preferredHospital,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("ethio_emergency_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const protocol = activeProtocol ? EMERGENCY_PROTOCOLS[activeProtocol] : null;

  return (
    <div className="py-10">
      <div className="app-container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {t.emergency.offlineProtocols}
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">{t.emergency.title}</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            {t.emergency.subtitle}
          </p>
        </div>

        {/* SOS Banner */}
        <div
          className="glass-panel p-5 mb-6 border-rose-500/40 bg-rose-950/20 cursor-pointer hover:border-rose-500/70 transition-all"
          onClick={() => setShowSOS(!showSOS)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-2xl">
                🚨
              </div>
              <div>
                <h2 className="text-base font-bold text-rose-300">{t.emergency.offlineProtocols}</h2>
                <p className="text-xs text-slate-500">{t.emergency.protocolsHint}</p>
              </div>
            </div>
            <span className="text-slate-500 text-sm">{showSOS ? "▲" : "▼"}</span>
          </div>

          {showSOS && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(EMERGENCY_PROTOCOLS) as Array<keyof typeof EMERGENCY_PROTOCOLS>).map((key) => (
                  <button
                    key={key}
                    onClick={(e) => { e.stopPropagation(); setActiveProtocol(activeProtocol === key ? null : key); }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${activeProtocol === key
                        ? "bg-rose-600/30 border-rose-500/60 text-rose-200"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                  >
                    {EMERGENCY_PROTOCOLS[key].title}
                  </button>
                ))}
              </div>

              {protocol && (
                <div className="mt-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-3">
                  <h3 className="text-sm font-bold text-rose-300">{protocol.title}</h3>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">{t.emergency.immediateActions}</p>
                    <ul className="space-y-1.5">
                      {protocol.immediate.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-[10px] text-rose-300 flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                      📞 {protocol.call}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-violet-950/40 border border-violet-500/30 text-xs text-violet-300">
                      ⚠️ {protocol.herbs}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Contacts */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">{t.emergency.emergencyContacts}</h2>
              <button
                onClick={addContact}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                + {t.emergency.addContact}
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-mono">{t.emergency.contact} {i + 1}</span>
                    {contacts.length > 1 && (
                      <button
                        onClick={() => removeContact(i)}
                        className="text-[10px] text-rose-600 hover:text-rose-400 transition-colors"
                      >
                        {t.emergency.remove}
                      </button>
                    )}
                  </div>
                  <input
                    placeholder={t.emergency.fullName}
                    value={contact.name}
                    onChange={(e) => updateContact(i, "name", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    placeholder={t.emergency.phonePlaceholder}
                    value={contact.phone}
                    onChange={(e) => updateContact(i, "phone", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    placeholder={t.emergency.relationshipPlaceholder}
                    value={contact.relationship}
                    onChange={(e) => updateContact(i, "relationship", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Medical Info */}
          <div className="glass-panel p-5 space-y-5">
            {/* Blood type */}
            <div>
              <h2 className="text-sm font-bold text-white mb-2">{t.emergency.bloodType}</h2>
              <div className="flex flex-wrap gap-2">
                {BLOOD_TYPES.map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setBloodType(bt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${bloodType === bt
                        ? "bg-rose-600/40 border-rose-500/60 text-rose-200"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                  >
                    {bt === "Unknown" ? t.emergency.unknown : bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Active conditions */}
            <div>
              <h2 className="text-sm font-bold text-white mb-2">{t.emergency.activeConditions}</h2>
              <div className="flex gap-2 mb-2">
                <input
                  placeholder={t.emergency.conditionPlaceholder}
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCondition()}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={addCondition}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700/40 border border-emerald-600/40 text-emerald-300 text-xs font-medium hover:bg-emerald-700/60 transition-all"
                >
                  {t.emergency.add}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conditions.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1"
                  >
                    {c}
                    <button onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))} className="text-amber-600 hover:text-amber-400">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div>
              <h2 className="text-sm font-bold text-white mb-2">{t.emergency.activeMedications}</h2>
              <div className="flex gap-2 mb-2">
                <input
                  placeholder={t.emergency.drugName}
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
                <input
                  placeholder={t.emergency.dose}
                  value={newMed.dose}
                  onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                  className="w-24 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={addMedication}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700/40 border border-emerald-600/40 text-emerald-300 text-xs font-medium hover:bg-emerald-700/60 transition-all"
                >
                  {t.emergency.add}
                </button>
              </div>
              <div className="space-y-1">
                {medications.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-xs text-slate-300">{m.name} <span className="text-slate-500">{m.dose}</span></span>
                    <button onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} className="text-rose-600 hover:text-rose-400 text-xs">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferred Hospital */}
        <div className="glass-panel p-5 mt-6">
          <h2 className="text-sm font-bold text-white mb-3">{t.emergency.preferredHospital}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ETHIOPIAN_HOSPITALS.map((h) => (
              <button
                key={h}
                onClick={() => setPreferredHospital(h === preferredHospital ? "" : h)}
                className={`px-3 py-2 rounded-lg text-xs text-left border transition-all ${preferredHospital === h
                    ? "bg-teal-700/30 border-teal-500/50 text-teal-200"
                    : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:border-white/15"
                  }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            {t.emergency.localStorageNote}
          </p>
          <button
            id="save-emergency-profile-btn"
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all ${saved
                ? "bg-emerald-700/30 border-emerald-500/50 text-emerald-300"
                : "bg-rose-700/30 border-rose-500/40 text-rose-200 hover:bg-rose-700/50"
              }`}
          >
            {saved ? `✓ ${t.emergency.savedOffline}` : t.emergency.saveProfile}
          </button>
        </div>
      </div>
    </div>
  );
}
