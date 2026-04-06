import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

const ATTEMPT_TYPES = ['EXAM_TRIAL', 'EXAM_TOPIC', 'PRACTICE'];

function minutesToSec(value) {
  const n = Number(String(value).replace(',', '.'));
  if (value === '' || Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 60);
}

function optionalInt(value) {
  if (value === '' || value == null) return null;
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? null : n;
}

const selectClass = 'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function ExamTemplateCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ code: '', name: '', attemptType: 'EXAM_TRIAL', questionCount: '24', totalMinutes: '', perQuestionSec: '', allowResume: true, isActive: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const typeLabel = useMemo(() => ({ EXAM_TRIAL: t('examTemplates.typeTrial'), EXAM_TOPIC: t('examTemplates.typeTopic'), PRACTICE: t('examTemplates.typePractice') }), [t]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/admin/exam-templates', {
        code: form.code.trim(),
        name: form.name.trim(),
        attemptType: form.attemptType,
        questionCount: parseInt(form.questionCount, 10),
        totalDurationSec: minutesToSec(form.totalMinutes),
        perQuestionSec: optionalInt(form.perQuestionSec),
        allowResume: form.allowResume,
        isActive: form.isActive,
      });
      navigate('/exam-templates');
    } catch { setError(t('examTemplates.saveError')); }
    finally { setBusy(false); }
  }

  return (
    <FormPage title={t('examTemplates.createTitle')} backTo="/exam-templates" maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('examTemplates.code')} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. CUSTOM_01" required />
          <Input label={t('examTemplates.name')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('examTemplates.attemptType')}</label>
          <select className={selectClass} value={form.attemptType} onChange={(e) => setForm((f) => ({ ...f, attemptType: e.target.value }))}>
            {ATTEMPT_TYPES.map((v) => <option key={v} value={v}>{typeLabel[v]}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label={t('examTemplates.questionCount')} type="number" min={1} value={form.questionCount} onChange={(e) => setForm((f) => ({ ...f, questionCount: e.target.value }))} required />
          <div>
            <Input label={t('examTemplates.totalDuration')} type="number" min={0} step="0.5" value={form.totalMinutes} onChange={(e) => setForm((f) => ({ ...f, totalMinutes: e.target.value }))} placeholder="—" />
            <p className="mt-1 text-xs text-[var(--app-muted)]">{t('examTemplates.totalDurationHint')}</p>
          </div>
          <div>
            <Input label={t('examTemplates.perQuestionSec')} type="number" min={0} value={form.perQuestionSec} onChange={(e) => setForm((f) => ({ ...f, perQuestionSec: e.target.value }))} placeholder="—" />
            <p className="mt-1 text-xs text-[var(--app-muted)]">{t('examTemplates.perQuestionHint')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
            <input type="checkbox" checked={form.allowResume} onChange={(e) => setForm((f) => ({ ...f, allowResume: e.target.checked }))} className="h-4 w-4 rounded" />
            {t('examTemplates.allowResume')}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded" />
            {t('examTemplates.isActive')}
          </label>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/exam-templates')} disabled={busy}>{t('examTemplates.cancel')}</Button>
          <Button type="submit" disabled={busy}>{busy ? t('examTemplates.saving') : t('examTemplates.create')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
