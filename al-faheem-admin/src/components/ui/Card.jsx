export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-card-fg)] shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`border-b border-[var(--app-border)] px-4 py-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
