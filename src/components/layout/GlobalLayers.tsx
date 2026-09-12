"use client";

import { useEffect, useRef } from "react";

export default function GlobalLayers() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!glowRef.current) return;
      const x = event.clientX;
      const y = event.clientY;
      glowRef.current.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <div className="global-grid-layer" aria-hidden="true" />
      <div className="global-scanlines" aria-hidden="true" />
      <div className="global-vignette" aria-hidden="true" />
      <div className="global-particles" aria-hidden="true" />
      <div ref={glowRef} className="global-cursor-glow" aria-hidden="true" />
    </>
  );
}
