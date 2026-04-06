import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

const textareaClass =
  'w-full min-h-[100px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

function imageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${publicBase}${url.startsWith('/') ? url : `/${url}`}`;
}

export default function SubjectEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ slug: '', nameAr: '', nameEn: '', description: '', descriptionEn: '', imageUrl: '', sortOrder: 0, isActive: true });
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/subjects')
      .then(({ data }) => {
        const s = data.data?.find((x) => String(x.id) === String(id));
        if (s) {
          setForm({ slug: s.slug, nameAr: s.nameAr, nameEn: s.nameEn ?? '', description: s.description ?? '', descriptionEn: s.descriptionEn ?? '', imageUrl: s.imageUrl ?? '', sortOrder: s.sortOrder ?? 0, isActive: s.isActive !== false });
        } else {
          setError(t('subjects.notFound'));
        }
      })
      .catch(() => setError(t('subjects.loadFailed')))
      .finally(() => setLoading(false));
  }, [id, t]);

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch { window.alert(t('users.avatarUploadFailed')); }
    finally { setImageBusy(false); }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.patch(`/admin/subjects/${id}`, {
        slug: form.slug.trim(),
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim() || null,
        description: form.description.trim() || null,
        imageUrl: form.imageUrl || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      navigate('/subjects');
    } catch (err) {
      setError(err.response?.data?.message || t('subjects.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="p-6 font-bold text-[var(--app-muted)]">…</p>;

  const src = imageSrc(form.imageUrl);

  return (
    <FormPage title={t('subjects.editTitle')} backTo="/subjects">
      <form onSubmit={submit} className="space-y-4">
        {/* صورة الماده */}
        <div className="border-b border-[var(--app-border)] pb-4">
          <p className="mb-3 text-sm font-bold text-[var(--app-muted)]">{t('subjects.image')}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
              {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">—</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFile} />
              <Button type="button" variant="secondary" disabled={imageBusy} onClick={() => fileRef.current?.click()}>{t('subjects.chooseImage')}</Button>
              {form.imageUrl && <Button type="button" variant="secondary" disabled={imageBusy} onClick={() => { setForm((p) => ({ ...p, imageUrl: '' })); if (fileRef.current) fileRef.current.value = ''; }}>{t('subjects.removeImage')}</Button>}
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--app-muted)]">{t('subjects.imageHint')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input required label={t('subjects.slug')} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input type="number" label={t('subjects.sortOrder')} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          <Input className="sm:col-span-2" required label={t('subjects.nameAr')} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <Input className="sm:col-span-2" label={t('subjects.nameEn')} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subjects.description')}</label>
            <textarea className={textareaClass} rows={4} dir="rtl" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subjects.descriptionEn')}</label>
            <textarea className={textareaClass} rows={4} dir="ltr" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)] sm:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            {t('subjects.active')}
          </label>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/subjects')} disabled={busy}>{t('subjects.cancel')}</Button>
          <Button type="submit" disabled={busy}>{busy ? '…' : t('subjects.save')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
