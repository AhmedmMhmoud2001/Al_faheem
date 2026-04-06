import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

function toSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function imageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${publicBase}${url.startsWith('/') ? url : `/${url}`}`;
}

const EMPTY = { formSubjectId: '', slug: '', nameAr: '', nameEn: '', description: '', descriptionEn: '', imageUrl: '', sortOrder: 0, isActive: true };

export default function SubcategoryCreate() {
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [slugAutoMode, setSlugAutoMode] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const imageFileRef = useRef(null);

  useEffect(() => {
    api.get('/admin/subjects').then(({ data }) => {
      const list = Array.isArray(data?.data) ? data.data : [];
      setSubjects(list);
      if (list.length) setForm((p) => ({ ...p, formSubjectId: String(list[0].id) }));
    });
  }, []);

  const handleNameArChange = (value) => {
    setForm((prev) => ({ ...prev, nameAr: value, slug: slugAutoMode ? toSlug(value) : prev.slug }));
  };

  const handleSlugChange = (value) => {
    setSlugAutoMode(false);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const resetSlugAuto = () => {
    setSlugAutoMode(true);
    setForm((prev) => ({ ...prev, slug: toSlug(prev.nameAr) }));
  };

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setForm((p) => ({ ...p, imageUrl: url }));
    } catch {
      window.alert(rtl ? 'فشل رفع الصورة' : 'Image upload failed');
    } finally {
      setImageBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.formSubjectId) { setError(rtl ? 'اختر المادة أولاً' : 'Please select a subject'); return; }
    if (!form.slug.trim()) { setError(rtl ? 'الـ slug مطلوب' : 'Slug is required'); return; }
    setBusy(true);
    try {
      await api.post('/admin/subcategories', {
        subjectId: Number(form.formSubjectId),
        slug: form.slug.trim(),
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim() || null,
        description: form.description.trim() || null,
        descriptionEn: form.descriptionEn.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: !!form.isActive,
      });
      navigate('/subcategories');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.map((e) => e.message).join(' • ') : null) ||
        (rtl ? 'تعذر الحفظ — تحقق من البيانات' : 'Save failed');
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const textareaClass = 'w-full resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

  return (
    <FormPage title={rtl ? 'تصنيف فرعي جديد' : 'New Subcategory'} backTo="/subcategories">
      <form onSubmit={submit} className="space-y-4">
        {/* المادة */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[var(--app-muted)]">{rtl ? 'المادة *' : 'Subject *'}</label>
          <select
            required
            value={form.formSubjectId}
            onChange={(e) => setForm((p) => ({ ...p, formSubjectId: e.target.value }))}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          >
            <option value="">{rtl ? '— اختر المادة —' : '— Select subject —'}</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}{s.nameEn ? ` / ${s.nameEn}` : ''} ({s.slug})</option>)}
          </select>
        </div>

        {/* الاسم العربي */}
        <Input label={rtl ? 'الاسم (عربي) *' : 'Name (AR) *'} value={form.nameAr} onChange={(e) => handleNameArChange(e.target.value)} required />

        {/* الـ Slug */}
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Slug *" value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} required dir="ltr" />
            </div>
            {!slugAutoMode && (
              <button type="button" onClick={resetSlugAuto} title={rtl ? 'إعادة التولد' : 'Re-generate'} className="mb-0.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-2 text-sm text-[var(--app-muted)] hover:text-[var(--app-accent)] transition-colors">↺</button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-[var(--app-muted)]">
            {slugAutoMode ? (rtl ? '✦ يتولد تلقائياً من الاسم العربي' : '✦ Auto-generated from Arabic name') : (rtl ? 'تم التعديل يدوياً — اضغط ↺ للإعادة' : 'Manually edited — click ↺ to reset')}
          </p>
        </div>

        {/* الاسم الإنجليزي */}
        <Input label={rtl ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} />

        {/* الوصف */}
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{rtl ? 'الوصف (عربي)' : 'Description (AR)'}</label>
          <textarea className={textareaClass} rows={3} dir="rtl" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{rtl ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label>
          <textarea className={textareaClass} rows={3} dir="ltr" value={form.descriptionEn} onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))} />
        </div>

        {/* رفع الصورة */}
        <div className="border-t border-[var(--app-border)] pt-4">
          <p className="mb-3 text-sm font-bold text-[var(--app-muted)]">{rtl ? 'الصورة' : 'Image'}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
              {imageSrc(form.imageUrl) ? (
                <img src={imageSrc(form.imageUrl)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">—</div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <input ref={imageFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageFile} />
              <Button type="button" variant="secondary" disabled={imageBusy} onClick={() => imageFileRef.current?.click()}>
                {imageBusy ? '…' : (rtl ? 'رفع صورة' : 'Upload image')}
              </Button>
              {form.imageUrl && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={imageBusy}
                  onClick={() => { setForm((p) => ({ ...p, imageUrl: '' })); if (imageFileRef.current) imageFileRef.current.value = ''; }}
                >
                  {rtl ? 'إزالة الصورة' : 'Remove image'}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-[var(--app-muted)]">JPG / PNG / WEBP</p>
        </div>

        <Input label={rtl ? 'الترتيب' : 'Sort order'} type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          {rtl ? 'نشط' : 'Active'}
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/subcategories')} disabled={busy}>{rtl ? 'إلغاء' : 'Cancel'}</Button>
          <Button type="submit" disabled={busy}>{busy ? '…' : (rtl ? 'حفظ' : 'Save')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
