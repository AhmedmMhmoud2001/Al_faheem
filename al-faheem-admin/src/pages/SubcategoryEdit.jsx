import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function SubcategoryEdit() {
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const navigate = useNavigate();
  const { id } = useParams();

  const [subjectName, setSubjectName] = useState('');
  const [form, setForm] = useState({ slug: '', nameAr: '', nameEn: '', description: '', descriptionEn: '', imageUrl: '', sortOrder: 0, isActive: true });
  const [slugAutoMode, setSlugAutoMode] = useState(false); // في التعديل الـ slug موجود مسبقاً
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageBusy, setImageBusy] = useState(false);
  const imageFileRef = useRef(null);

  function imageSrc(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${publicBase}${url.startsWith('/') ? url : `/${url}`}`;
  }

  useEffect(() => {
    setLoading(true);
    // جلب التصنيف الفرعي — نحتاج قائمة كل التصنيفات
    api.get('/admin/subjects')
      .then(async ({ data }) => {
        const subjects = Array.isArray(data?.data) ? data.data : [];
        // البحث في كل المواد
        for (const s of subjects) {
          try {
            const res = await api.get(`/admin/subjects/${s.id}/subcategories`);
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            const found = list.find((x) => String(x.id) === String(id));
            if (found) {
              setSubjectName(s.nameAr);
              setForm({
                slug: found.slug,
                nameAr: found.nameAr,
                nameEn: found.nameEn || '',
                description: found.description || '',
                descriptionEn: found.descriptionEn || '',
                imageUrl: found.imageUrl || '',
                sortOrder: found.sortOrder ?? 0,
                isActive: found.isActive !== false,
              });
              break;
            }
          } catch { /* skip */ }
        }
      })
      .catch(() => setError(rtl ? 'تعذر تحميل البيانات' : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

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
    setBusy(true);
    try {
      await api.patch(`/admin/subcategories/${id}`, {
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
        (rtl ? 'تعذر الحفظ' : 'Save failed');
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const textareaClass = 'w-full resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

  if (loading) return <p className="p-6 font-bold text-[var(--app-muted)]">…</p>;

  return (
    <FormPage title={rtl ? 'تعديل التصنيف الفرعي' : 'Edit Subcategory'} backTo="/subcategories">
      <form onSubmit={submit} className="space-y-4">
        {/* اسم المادة — للعرض فقط */}
        {subjectName && (
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm">
            <span className="font-bold text-[var(--app-muted)]">{rtl ? 'المادة: ' : 'Subject: '}</span>
            <span className="font-black text-[var(--app-fg)]">{subjectName}</span>
          </div>
        )}

        <Input label={rtl ? 'الاسم (عربي) *' : 'Name (AR) *'} value={form.nameAr} onChange={(e) => handleNameArChange(e.target.value)} required />

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
            {slugAutoMode ? (rtl ? '✦ يتولد تلقائياً' : '✦ Auto') : (rtl ? 'تم التعديل يدوياً — اضغط ↺ للإعادة' : 'Manually edited — click ↺ to reset')}
          </p>
        </div>

        <Input label={rtl ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} />

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
