import { useEffect, useMemo, useState } from "react";

type DataStreamProps = {
  lines: string[];
  speed?: number;
};

export default function DataStream({ lines, speed = 35 }: DataStreamProps) {
  const [visible, setVisible] = useState("");
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const currentLine = lines[lineIndex] ?? "";
    if (!currentLine) return;

    let charIndex = 0;
    const writer = window.setInterval(() => {
      const next = currentLine.slice(0, charIndex + 1);
      setVisible(next);
      charIndex += 1;
      if (charIndex >= currentLine.length) {
        window.clearInterval(writer);
        window.setTimeout(() => {
          setLineIndex((previous) => (previous + 1) % lines.length);
          setVisible("");
        }, 400);
      }
    }, speed);

    return () => window.clearInterval(writer);
  }, [lineIndex, lines, speed]);

  const activeLine = useMemo(() => lines[lineIndex] ?? "", [lineIndex, lines]);

  return (
    <div className="data-stream" aria-live="polite">
      <div className="data-stream-line">{visible || activeLine.slice(0, 0)}<span className="caret">▌</span></div>
    </div>
  );
}
