"use client";

import { useState, useEffect, useRef, useId } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import type { EthiopianAdministrativePlace } from "@/lib/location/ethiopianAdministrativePlaces";
import { withBasePath } from '@/lib/base-path';

/** A suggested place from GET /api/locations?fields=places (the place list stays on the server). */
export type LocationSuggestion = Pick<EthiopianAdministrativePlace, "id" | "town" | "zone" | "region"> & { altitudeMeters?: number | null };

const SEARCH_DELAY_MS = 200;

interface EthiopianLocationInputProps {
  value: string;
  regionValue?: string;
  onChange: (location: string, region: string, place?: LocationSuggestion) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function EthiopianLocationInput({
  value,
  regionValue,
  onChange,
  required = false,
  label = "Where are you currently living in Ethiopia?",
  placeholder = "Search a district, town, zone, or region (e.g. Bole, Hawassa, Oromia)...",
  className = "",
}: EthiopianLocationInputProps) {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();

  useEffect(() => {
    if (value !== searchTerm && !isOpen) {
      setSearchTerm(value);
    }
  }, [value, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2 || !isOpen) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(withBasePath(`/api/locations?fields=places&limit=8&q=${encodeURIComponent(term)}`), { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => setSuggestions(Array.isArray(payload?.data) ? payload.data : []))
        .catch(() => undefined);
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: LocationSuggestion) => {
    const locString = `${place.town}, ${place.zone} (${place.region})`;
    setSearchTerm(locString);
    setIsOpen(false);
    onChange(locString, place.region, place);
  };

  return (
    <div ref={containerRef} className={`relative space-y-2 ${className}`}>
      <label htmlFor={inputId} className="block text-xs font-semibold text-soft uppercase tracking-wide">
        {label} {required && <span className="text-gold">*</span>}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand">
          <MapPin className="w-4 h-4" />
        </div>
        <input
          id={inputId}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            onChange(e.target.value, regionValue || "");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={listId}
          className="w-full rounded-xl bg-sunken/80 border border-border pl-10 pr-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-subtle"
        />
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div id={listId} role="listbox" className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-brand/40 bg-background/95 shadow-raised  p-1.5 space-y-1">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-brand flex items-center justify-between border-b border-border">
            <span>Region / Zone / District or town</span>
            <span>{suggestions.length} matches</span>
          </div>
          {suggestions.map((place) => (
            <button
              key={place.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(place)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-soft transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-foreground text-sm group-hover:text-brand">
                  {place.town}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {place.zone}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/20 text-brand-strong border border-brand/30">
                {place.region}
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="text-[11px] text-subtle">Choose a result to save its official region, zone, and district/town. You can enter a place outside the list as text.</p>
    </div>
  );
}
