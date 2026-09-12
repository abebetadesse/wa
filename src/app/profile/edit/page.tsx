"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { isVisible, ProfileFieldType } from "@/lib/profileFields";

interface ProfileField {
  id: string;
  section: string;
  label: string;
  fieldType: ProfileFieldType;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  options: string[];
  defaultValue: unknown;
  conditional: Record<string, unknown> | null;
}

type ProfileValue = string | number | boolean;
type ProfileValues = Record<string, unknown>;

function getFieldValue(value: unknown): string | number {
  return typeof value === "string" || typeof value === "number" ? value : "";
}

function FieldHelp({ text }: { text: string | null }) {
  return text ? <small className="text-slate-500">{text}</small> : null;
}

interface ProfileFieldControlProps {
  field: ProfileField;
  value: unknown;
  onChange: (fieldId: string, value: ProfileValue) => void;
}

function ProfileFieldControl({ field, value, onChange }: ProfileFieldControlProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const nextValue = target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked
      : target instanceof HTMLInputElement && target.type === "number"
        ? target.value === "" ? "" : Number(target.value)
        : target.value;
    onChange(field.id, nextValue);
  };

  if (field.fieldType === "section_header") {
    return <h2 className="border-b pb-2 text-xl font-semibold">{field.label}</h2>;
  }

  if (field.fieldType === "radio") {
    return (
      <fieldset className="space-y-2">
        <legend className="font-medium">{field.label}</legend>
        {field.options.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input type="radio" name={field.id} value={option} checked={value === option} required={field.required && !value} onChange={handleChange} />
            <span>{option}</span>
          </label>
        ))}
        <FieldHelp text={field.helpText} />
      </fieldset>
    );
  }

  const control = field.fieldType === "textarea" ? (
    <textarea required={field.required} placeholder={field.placeholder || ""} value={getFieldValue(value)} onChange={handleChange} className="input-warm min-h-24 w-full" />
  ) : field.fieldType === "select" ? (
    <select required={field.required} value={getFieldValue(value)} onChange={handleChange} className="input-warm w-full">
      <option value="">Select...</option>
      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  ) : field.fieldType === "checkbox" ? (
    <input type="checkbox" checked={value === true} onChange={handleChange} />
  ) : (
    <input required={field.required} placeholder={field.placeholder || ""} value={getFieldValue(value)} onChange={handleChange} type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : field.fieldType === "email" ? "email" : field.fieldType === "phone" ? "tel" : "text"} className="input-warm w-full" />
  );

  return (
    <label className={field.fieldType === "checkbox" ? "flex items-center gap-2" : "space-y-1"}>
      {field.fieldType === "checkbox" ? <span>{field.label}</span> : <span className="font-medium">{field.label}</span>}
      {control}
      <FieldHelp text={field.helpText} />
    </label>
  );
}

export default function ProfileEditPage() {
  const [fields, setFields] = useState<ProfileField[]>([]);
  const [values, setValues] = useState<ProfileValues>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const profileResponse = await fetch("/api/profile", { credentials: "include", cache: "no-store" });
        if (!profileResponse.ok) throw new Error("Authentication required.");
        const profile = await profileResponse.json();
        if (!profile.success) throw new Error(profile.error || "Unable to load profile.");
        if (active) {
          const nextFields = (profile.fields || []) as ProfileField[];
          const nextValues = { ...(profile.data || {}) } as ProfileValues;
          for (const field of nextFields) {
            if (nextValues[field.id] === undefined && field.defaultValue !== null && field.defaultValue !== undefined) {
              nextValues[field.id] = field.defaultValue;
            }
          }
          setFields(nextFields);
          setValues(nextValues);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Unable to load profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, []);

  function updateValue(fieldId: string, value: ProfileValue) {
    setValues((current) => ({ ...current, [fieldId]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Saving...");
    try {
      const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save profile.");
      setValues(result.data || values);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const visibleFields = fields.filter((field) => isVisible(field, values));
  const sections = [...new Set(visibleFields.map((field) => field.section))];
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">My health profile</h1>
      <p className="text-slate-600">Your profile is used to personalize workflows. You control what you provide.</p>
      {loading ? <p role="status">Loading your profile...</p> : (
        <form onSubmit={save} className="card-warm space-y-8 p-6">
          {sections.map((section) => (
            <section key={section} className="space-y-4">
              <h2 className="text-2xl font-semibold">{section}</h2>
              {visibleFields.filter((field) => field.section === section).map((field) => (
                <ProfileFieldControl key={field.id} field={field} value={values[field.id]} onChange={updateValue} />
              ))}
            </section>
          ))}
          <button className="btn-pill-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
          {message && <p role="status" className="text-sm">{message}</p>}
        </form>
      )}
    </main>
  );
}
