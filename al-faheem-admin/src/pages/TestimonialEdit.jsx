import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

const textareaClass = 'w-full min-h-[80px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function TestimonialEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/testimonials')
      .then(({ data }) => {
        const item = (data.items || []).find((x) => String(x.id) === String(id));
        if (item) {
          setForm({ nameAr: item.nameAr, nameEn: item.nameEn ?? '', roleAr: item.roleAr, roleEn: item.roleEn ?? '', textAr: item.textAr, textEn: item.textEn ?? '', imageUrl: item.imageUrl ?? '', sortOrder: item.sortOrder, isActive: item.isActive });
        } else { setError(t('testimonialsAdmin.notFound')); }
      })
      .catch(() => setError(t('testimonialsAdmin.loadFailed')))
      .finally(() => setLoading(false));
  }, [id, t]);

  async function submit(e) {
    e.preventDefault();
    if (!form.nameAr.trim() || !form.roleAr.trim() || !form.textAr.trim()) return;
    setError('');
    setBusy(true);
    try {
      await api.patch(`/admin/testimonials/items/${id}`, form);
      navigate('/testimonials');
    } catch { setError(t('testimonialsAdmin.saveFailed')); }
    finally { setBusy(false); }
  }

  if (loading) return <p className="p-6 font-bold text-[var(--app-muted)]">…</p>;
  if (!form) return <p className="p-6 font-bold text-red-600">{error}</p>;

  return (
    <FormPage title={t('testimonialsAdmin.editItem')} backTo="/testimonials">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.nameAr')}</label>
            <Input dir="rtl" value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.nameEn')}</label>
            <Input dir="ltr" value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.roleAr')}</label>
            <Input dir="rtl" value={form.roleAr} onChange={(e) => setForm((f) => ({ ...f, roleAr: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.roleEn')}</label>
            <Input dir="ltr" value={form.roleEn} onChange={(e) => setForm((f) => ({ ...f, roleEn: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.textAr')}</label>
          <textarea className={textareaClass} dir="rtl" rows={4} value={form.textAr} onChange={(e) => setForm((f) => ({ ...f, textAr: e.target.value }))} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.textEn')}</label>
          <textarea className={textareaClass} dir="ltr" rows={4} value={form.textEn} onChange={(e) => setForm((f) => ({ ...f, textEn: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.imageUrl')}</label>
          <Input dir="ltr" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[var(--app-border)] pt-4">
          <Input label={t('subjects.sortOrder')} type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              {t('subjects.active')}
            </label>
          </div>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/testimonials')} disabled={busy}>{t('subjects.cancel')}</Button>
          <Button type="submit" disabled={busy}>{busy ? '…' : t('subjects.save')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
