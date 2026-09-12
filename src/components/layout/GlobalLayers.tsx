"use client";

import { useEffect, useRef } from "react";

export default function GlobalLayers() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!glowRef.current) return;
        glowRef.current.style.transform = `translate(${event.clientX - 200}px, ${event.clientY - 200}px)`;
      });
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
