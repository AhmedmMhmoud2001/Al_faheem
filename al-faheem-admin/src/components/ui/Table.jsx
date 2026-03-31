export function TableWrap({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-[var(--app-border)] ${className}`}>
      {children}
    </div>
  );
}

export function Table({ children, className = '' }) {
  return (
    <table className={`w-full border-collapse text-start text-sm ${className}`}>{children}</table>
  );
}

export function THead({ children, className = '' }) {
  return (
    <thead
      className={`border-b border-[var(--app-border)] bg-[var(--app-row-hover)] font-black text-[var(--app-muted)] dark:bg-slate-800/80 ${className}`}
    >
      {children}
    </thead>
  );
}

export function TBody({ children, className = '' }) {
  return <tbody className={className}>{children}</tbody>;
}

export function Tr({ children, className = '' }) {
  return (
    <tr
      className={`border-b border-[var(--app-border)] transition-colors hover:bg-[var(--app-row-hover)] ${className}`}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className = '' }) {
  return <th className={`p-3 text-start align-middle font-black ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }) {
  return <td className={`p-3 text-start align-middle ${className}`}>{children}</td>;
}
