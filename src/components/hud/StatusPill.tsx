type StatusPillProps = {
  status: "online" | "warning" | "critical";
  label?: string;
};

export default function StatusPill({ status, label }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill--${status}`}>
      <span className="status-pill__dot" aria-hidden="true" />
      {label ?? status.toUpperCase()}
    </span>
  );
}
