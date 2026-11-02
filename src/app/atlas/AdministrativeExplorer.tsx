"use client";

import { useMemo, useState } from "react";
import type { EthiopianAdministrativeRegion } from "@/lib/location/ethiopianAdministrativePlaces";

export default function AdministrativeExplorer({ region }: { region: EthiopianAdministrativeRegion }) {
  const [zoneName, setZoneName] = useState<string | null>(null);
  const [townName, setTownName] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const selectedZone = region.zones.find((zone) => zone.name === zoneName) ?? null;
  const filteredTowns = useMemo(
    () => selectedZone?.towns.filter((town) => town.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) ?? [],
    [query, selectedZone],
  );

  const openZone = (name: string) => {
    setZoneName(name);
    setTownName(null);
    setQuery("");
  };

  const returnToZones = () => {
    setZoneName(null);
    setTownName(null);
    setQuery("");
  };

  return (
    <section aria-label={`${region.name} administrative hierarchy`} className="space-y-3 rounded-xl border border-info/15 bg-background/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-info-strong">
            {townName ? "Town detail HUD" : selectedZone ? "Zone detail HUD" : "Zone map HUD"}
          </h3>
          <p className="mt-1 text-[9px] text-subtle">
            {region.name}{selectedZone ? ` / ${selectedZone.name}` : ""}{townName ? ` / ${townName}` : ""}
          </p>
        </div>
        {selectedZone && (
          <button
            type="button"
            onClick={returnToZones}
            className="rounded-md border border-border px-2 py-1 text-[10px] text-soft hover:border-info/40 hover:text-foreground"
          >
            ← All zones
          </button>
        )}
      </div>

      {townName ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-info/20 bg-info/[0.05] p-3">
            <div>
              <div className="text-base font-bold text-foreground">{townName}</div>
              <div className="mt-1 text-[10px] text-info-strong">Listed under {selectedZone?.name}, {region.name}</div>
            </div>
            <button
              type="button"
              onClick={() => setTownName(null)}
              className="rounded-md border border-border px-2 py-1 text-[10px] text-soft hover:text-foreground"
            >
              ← Town list
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-foreground/[0.03] p-2">
              <div className="text-[9px] uppercase tracking-wider text-subtle">Administrative level</div>
              <div className="mt-1 text-[11px] text-soft">Town / district</div>
            </div>
            <div className="rounded-lg border border-border bg-foreground/[0.03] p-2">
              <div className="text-[9px] uppercase tracking-wider text-subtle">Parent zone</div>
              <div className="mt-1 text-[11px] text-soft">{selectedZone?.name}</div>
            </div>
          </div>
          <p className="rounded-lg border border-gold/15 bg-gold/[0.04] p-2.5 text-[10px] leading-relaxed text-gold-strong">
            The source lists this place name and its administrative parents only. Town coordinates, population, health,
            nutrition, ecology, food systems, and clinical measurements are not supplied here. Regional reference
            indicators shown elsewhere in this panel are not town-specific.
          </p>
        </div>
      ) : selectedZone ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">{selectedZone.towns.length} listed towns / districts</p>
            <label className="sr-only" htmlFor={`town-search-${region.name}`}>Filter towns</label>
            <input
              id={`town-search-${region.name}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter this zone…"
              className="w-40 rounded-md border border-border bg-sunken/50 px-2 py-1.5 text-[10px] text-foreground placeholder:text-subtle"
            />
          </div>
          <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredTowns.map((town, index) => (
              <button
                key={town}
                type="button"
                onClick={() => setTownName(town)}
                className="flex items-center gap-2 rounded-lg border border-border bg-foreground/[0.025] px-2.5 py-2 text-left hover:border-info/30 hover:bg-info/[0.04]"
              >
                <span className="font-mono text-[9px] text-subtle">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[10px] text-soft">{town}</span>
                <span className="ml-auto text-[10px] text-info">›</span>
              </button>
            ))}
            {filteredTowns.length === 0 && <p className="col-span-full py-4 text-center text-[10px] text-subtle">No towns match that filter.</p>}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">{region.zones.length} zones · {region.townCount} towns / districts</p>
            <span className="rounded-full border border-border px-2 py-1 text-[8px] uppercase tracking-wider text-subtle">
              Schematic index · not to scale
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {region.zones.map((zone, index) => (
              <button
                key={zone.name}
                type="button"
                onClick={() => openZone(zone.name)}
                className="group min-h-16 rounded-lg border border-info/10 bg-gradient-to-br from-info/[0.07] to-info/[0.02] p-2 text-left transition-colors hover:border-info/40 hover:from-info/[0.14]"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[9px] text-info">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[9px] text-subtle">{zone.towns.length} places</span>
                </div>
                <div className="mt-1 text-[10px] font-semibold leading-snug text-soft group-hover:text-foreground">{zone.name}</div>
                <div className="mt-1 text-[9px] text-info">Open zone ›</div>
              </button>
            ))}
          </div>
        </>
      )}
      <p className="border-t border-border pt-2 text-[9px] leading-relaxed text-subtle">
        Administrative names transcribed from the supplied “Region, Zone, Town” list. The tile layout is a navigation
        index, not a boundary or geographic-position map.
      </p>
    </section>
  );
}
