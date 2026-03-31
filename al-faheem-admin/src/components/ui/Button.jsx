const variants = {
  primary:
    'bg-[var(--app-accent)] text-[var(--app-accent-fg)] hover:opacity-90 shadow-sm dark:shadow-none',
  secondary:
    'bg-[var(--app-card)] text-[var(--app-card-fg)] border border-[var(--app-border)] hover:bg-[var(--app-row-hover)]',
  ghost: 'text-[var(--app-muted)] hover:bg-[var(--app-row-hover)] hover:text-[var(--app-card-fg)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl font-bold',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)] disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
