import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

const textareaClass = 'w-full min-h-[88px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function FaqItemCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ scope: 'GENERAL', questionAr: '', questionEn: '', answerAr: '', answerEn: '', sortOrder: 0, isActive: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.questionAr.trim() || !form.answerAr.trim()) return;
    setError('');
    setBusy(true);
    try {
      await api.post('/admin/faq/items', form);
      navigate('/faq');
    } catch { setError(t('faq.saveFailed')); }
    finally { setBusy(false); }
  }

  return (
    <FormPage title={t('faq.addItem')} backTo="/faq">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.scopeLabel')}</label>
          <select value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
            <option value="GENERAL">{t('faq.scopeGeneral')}</option>
            <option value="PAYMENT">{t('faq.scopePayment')}</option>
          </select>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{t('faq.scopeHint')}</p>
        </div>

        <p className="text-sm font-black text-[var(--app-accent)]">{t('questions.sectionAr')}</p>
        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.questionAr')}</label>
          <textarea className={textareaClass} rows={3} dir="rtl" value={form.questionAr} onChange={(e) => setForm((f) => ({ ...f, questionAr: e.target.value }))} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.answerAr')}</label>
          <textarea className={textareaClass} rows={4} dir="rtl" value={form.answerAr} onChange={(e) => setForm((f) => ({ ...f, answerAr: e.target.value }))} required />
        </div>

        <p className="text-sm font-black text-[var(--app-accent)]">{t('questions.sectionEn')}</p>
        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.questionEn')}</label>
          <textarea className={textareaClass} rows={3} dir="ltr" value={form.questionEn} onChange={(e) => setForm((f) => ({ ...f, questionEn: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.answerEn')}</label>
          <textarea className={textareaClass} rows={4} dir="ltr" value={form.answerEn} onChange={(e) => setForm((f) => ({ ...f, answerEn: e.target.value }))} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 border-t border-[var(--app-border)] pt-4">
          <Input label={t('subjects.sortOrder')} type="number" min={0} value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              {t('subjects.active')}
            </label>
          </div>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/faq')} disabled={busy}>{t('subjects.cancel')}</Button>
          <Button type="submit" disabled={busy || !form.questionAr.trim() || !form.answerAr.trim()}>{busy ? '…' : t('faq.addItem')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
