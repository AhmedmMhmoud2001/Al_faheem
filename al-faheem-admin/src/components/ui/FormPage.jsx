import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Shared full-page wrapper for create/edit forms.
 * Replaces Modal usage — renders as a normal routed page.
 *
 * Props:
 *  - title     : string — page heading
 *  - backTo    : string — navigate path on back (default: -1)
 *  - maxWidth  : string — tailwind max-w-* class (default: 'max-w-3xl')
 *  - children
 */
export default function FormPage({ title, backTo, maxWidth = 'max-w-3xl', children }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className={`mx-auto ${maxWidth}`}>
      {/* ── شريط العنوان مع زر الرجوع ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          aria-label="back"
        >
          <BackIcon className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{title}</h1>
      </div>

      {/* ── محتوى الفورم ── */}
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 md:p-7">
        {children}
      </div>
    </div>
  );
}
