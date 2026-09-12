import { useId, useMemo, useRef } from "react";

type HudTabProps = {
  tabs: string[];
  active: string;
  onChange: (value: string) => void;
};

export default function HudTab({ tabs, active, onChange }: HudTabProps) {
  const id = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = useMemo(() => tabs.indexOf(active), [active, tabs]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    const nextIndex = event.key === "ArrowRight"
      ? (index + 1) % tabs.length
      : (index - 1 + tabs.length) % tabs.length;

    onChange(tabs[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="hud-tab-shell" role="tablist" aria-label="HUD tabs" aria-orientation="horizontal">
      {tabs.map((tab, index) => {
        const isActive = tab === active;
        return (
          <button
            key={`${id}-${tab}`}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`hud-tab ${isActive ? "hud-tab--active" : ""}`.trim()}
            onClick={() => onChange(tab)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab}
          </button>
        );
      })}
      <span className="hud-tab-indicator" style={{ transform: `translateX(${activeIndex * 100}%)` }} aria-hidden="true" />
    </div>
  );
}
