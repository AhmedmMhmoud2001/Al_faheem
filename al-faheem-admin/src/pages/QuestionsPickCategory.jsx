import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';

const selectClass =
  'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function QuestionsPickCategory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/subjects')
      .then((r) => setSubjects(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    setSubCategoryId('');
    setSubcats([]);
    if (!subjectId) return;
    api
      .get('/admin/subcategories', { params: { subjectId } })
      .then((r) => setSubcats(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setSubcats([]));
  }, [subjectId]);

  const subjectLabel = useMemo(() => subjects.find((s) => String(s.id) === String(subjectId))?.nameAr, [subjects, subjectId]);

  const next = async () => {
    setError('');
    if (!subjectId) {
      setError(t('questions.pickSubject'));
      return;
    }
    setBusy(true);
    try {
      const sp = new URLSearchParams();
      sp.set('subjectId', subjectId);
      if (subCategoryId) sp.set('subCategoryId', subCategoryId);
      navigate(`/questions/difficulty?${sp.toString()}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormPage title={t('questions.title')} backTo="/" maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-black text-[var(--app-fg)]">اختار التصنيف أولاً</p>
          <p className="text-sm font-bold text-[var(--app-muted)]">
            {subjectLabel ? `التصنيف المختار: ${subjectLabel}` : 'حدد المادة/التصنيف ثم اختر الصعوبة'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.subject')}</label>
            <select className={selectClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="" disabled>
                —
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subcategories.title') || 'Subcategory'}</label>
            <select
              className={selectClass}
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              disabled={!subjectId || subcats.length === 0}
            >
              <option value="">{t('questions.none') || '—'}</option>
              {subcats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/questions/list')} disabled={busy}>
            فتح البنك بدون فلترة
          </Button>
          <Button type="button" onClick={next} disabled={busy}>
            {busy ? '…' : 'التالي'}
          </Button>
        </div>
      </div>
    </FormPage>
  );
}

