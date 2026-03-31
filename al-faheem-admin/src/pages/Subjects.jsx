import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const emptyForm = {
  slug: '',
  nameAr: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
};

function subjectImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const p = url.startsWith('/') ? url : `/${url}`;
  return `${publicBase}${p}`;
}

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

const textareaClass =
  'w-full min-h-[100px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function Subjects() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [imageBusy, setImageBusy] = useState(false);

  const createFileRef = useRef(null);
  const editFileRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/subjects');
    setRows(data.data);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  function resetCreate() {
    setCreateForm(emptyForm);
    if (createFileRef.current) createFileRef.current.value = '';
  }

  async function handleImageFile(e, setForm) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      window.alert(t('users.avatarUploadFailed'));
    } finally {
      setImageBusy(false);
    }
  }

  function ImageBlock({ form, setForm, fileRef }) {
    const src = subjectImageSrc(form.imageUrl);
    return (
      <div className="border-b border-[var(--app-border)] pb-4 sm:col-span-2">
        <p className="mb-3 text-sm font-bold text-[var(--app-muted)]">{t('subjects.image')}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
            {src ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">
                —
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageFile(e, setForm)}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={imageBusy}
              onClick={() => fileRef.current?.click()}
            >
              {t('subjects.chooseImage')}
            </Button>
            {form.imageUrl ? (
              <Button
                type="button"
                variant="secondary"
                disabled={imageBusy}
                onClick={() => {
                  setForm((prev) => ({ ...prev, imageUrl: '' }));
                  if (fileRef.current) fileRef.current.value = '';
                }}
              >
                {t('subjects.removeImage')}
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--app-muted)]">{t('subjects.imageHint')}</p>
      </div>
    );
  }

  async function create(e) {
    e.preventDefault();
    await api.post('/admin/subjects', {
      slug: createForm.slug.trim(),
      nameAr: createForm.nameAr.trim(),
      nameEn: createForm.nameEn.trim() ? createForm.nameEn.trim() : null,
      description: createForm.description.trim() ? createForm.description.trim() : null,
      descriptionEn: createForm.descriptionEn.trim() ? createForm.descriptionEn.trim() : null,
      imageUrl: createForm.imageUrl || null,
      sortOrder: Number(createForm.sortOrder) || 0,
      isActive: createForm.isActive,
    });
    resetCreate();
    setCreateOpen(false);
    load();
  }

  function openEdit(s) {
    setEditing(s);
    setEditForm({
      slug: s.slug,
      nameAr: s.nameAr,
      nameEn: s.nameEn ?? '',
      description: s.description ?? '',
      descriptionEn: s.descriptionEn ?? '',
      imageUrl: s.imageUrl ?? '',
      sortOrder: s.sortOrder ?? 0,
      isActive: s.isActive !== false,
    });
    if (editFileRef.current) editFileRef.current.value = '';
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    await api.patch(`/admin/subjects/${editing.id}`, {
      slug: editForm.slug.trim(),
      nameAr: editForm.nameAr.trim(),
      nameEn: editForm.nameEn.trim() ? editForm.nameEn.trim() : null,
      description: editForm.description.trim() ? editForm.description.trim() : null,
      imageUrl: editForm.imageUrl || null,
      sortOrder: Number(editForm.sortOrder) || 0,
      isActive: editForm.isActive,
    });
    setEditOpen(false);
    setEditing(null);
    load();
  }

  async function remove(s) {
    if (!window.confirm(t('subjects.confirmDelete'))) return;
    try {
      await api.delete(`/admin/subjects/${s.id}`);
      load();
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 409
          ? t('subjects.hasQuestions')
          : err.response?.data?.message || t('subjects.deleteFailed');
      window.alert(msg);
    }
  }

  const formFields = (form, setForm, fileRef) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ImageBlock form={form} setForm={setForm} fileRef={fileRef} />
      <Input
        label={t('subjects.slug')}
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        required
      />
      <Input
        label={t('subjects.sortOrder')}
        type="number"
        value={form.sortOrder}
        onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
      />
      <Input
        className="sm:col-span-2"
        label={t('subjects.nameAr')}
        value={form.nameAr}
        onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
        required
      />
      <Input
        className="sm:col-span-2"
        label={t('subjects.nameEn')}
        value={form.nameEn}
        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
      />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subjects.description')}</label>
        <textarea
          className={textareaClass}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          dir="rtl"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subjects.descriptionEn')}</label>
        <textarea
          className={textareaClass}
          value={form.descriptionEn}
          onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          rows={4}
          dir="ltr"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)] sm:col-span-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        {t('subjects.active')}
      </label>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('subjects.title')}</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          {t('subjects.openAdd')}
        </Button>
      </div>

      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th className="w-20">{t('subjects.image')}</Th>
              <Th>{t('subjects.id')}</Th>
              <Th>{t('subjects.slug')}</Th>
              <Th>{t('subjects.nameAr')}</Th>
              <Th>{t('subjects.nameEn')}</Th>
              <Th>{t('subjects.sortOrder')}</Th>
              <Th>{t('users.status')}</Th>
              <Th className="min-w-[5rem] whitespace-nowrap">{t('subjects.actions')}</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map((s) => {
              const thumb = subjectImageSrc(s.imageUrl);
              return (
                <Tr key={s.id}>
                  <Td>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-12 w-16 rounded-lg object-cover ring-1 ring-[var(--app-border)]"
                      />
                    ) : (
                      <span className="text-[var(--app-muted)]">—</span>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-[var(--app-muted)]">{s.id}</Td>
                  <Td className="font-bold">{s.slug}</Td>
                  <Td>{s.nameAr}</Td>
                  <Td className="text-[var(--app-muted)]">{s.nameEn || '—'}</Td>
                  <Td>{s.sortOrder}</Td>
                  <Td>{s.isActive ? t('subjects.active') : t('subjects.inactive')}</Td>
                  <Td className="whitespace-nowrap">
                    <div className="inline-flex flex-nowrap items-center gap-0.5">
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('subjects.edit')}
                        aria-label={t('subjects.edit')}
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={iconBtnDanger}
                        title={t('subjects.delete')}
                        aria-label={t('subjects.delete')}
                        onClick={() => remove(s)}
                      >
                        <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </TableWrap>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetCreate();
        }}
        title={t('subjects.addTitle')}
        className="max-w-2xl"
      >
        <form onSubmit={create} className="space-y-4">
          {formFields(createForm, setCreateForm, createFileRef)}
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                resetCreate();
              }}
            >
              {t('subjects.cancel')}
            </Button>
            <Button type="submit">{t('subjects.add')}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        title={t('subjects.editTitle')}
        className="max-w-2xl"
      >
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            {formFields(editForm, setEditForm, editFileRef)}
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditOpen(false);
                  setEditing(null);
                }}
              >
                {t('subjects.cancel')}
              </Button>
              <Button type="submit">{t('subjects.save')}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
