import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const textareaClass =
  'w-full min-h-[80px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const emptyItem = {
  nameAr: '',
  nameEn: '',
  roleAr: '',
  roleEn: '',
  textAr: '',
  textEn: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
};

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

export default function TestimonialsManage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [settingsDraft, setSettingsDraft] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyItem);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyItem);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/testimonials');
    setSettings(data.settings);
    setItems(data.items);
    setSettingsDraft({
      titleAr: data.settings.titleAr ?? '',
      titleEn: data.settings.titleEn ?? '',
      subtitleAr: data.settings.subtitleAr ?? '',
      subtitleEn: data.settings.subtitleEn ?? '',
    });
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  async function saveSettings() {
    setSavingSettings(true);
    try {
      await api.put('/admin/testimonials/settings', settingsDraft);
      await load();
    } finally {
      setSavingSettings(false);
    }
  }

  async function createItem() {
    await api.post('/admin/testimonials/items', createForm);
    setCreateOpen(false);
    setCreateForm(emptyItem);
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    await api.patch(`/admin/testimonials/items/${editing.id}`, editForm);
    setEditOpen(false);
    setEditing(null);
    load();
  }

  async function removeItem(id) {
    if (!window.confirm(t('testimonialsAdmin.confirmDelete'))) return;
    try {
      await api.delete(`/admin/testimonials/items/${id}`);
      load();
    } catch {
      window.alert(t('testimonialsAdmin.deleteFailed'));
    }
  }

  function openEdit(row) {
    setEditing(row);
    setEditForm({
      nameAr: row.nameAr,
      nameEn: row.nameEn ?? '',
      roleAr: row.roleAr,
      roleEn: row.roleEn ?? '',
      textAr: row.textAr,
      textEn: row.textEn ?? '',
      imageUrl: row.imageUrl ?? '',
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
    setEditOpen(true);
  }

  const canSaveItem = (f) => f.nameAr.trim() && f.roleAr.trim() && f.textAr.trim();

  if (!settings) {
    return <p className="font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.loading')}</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[var(--app-fg)]">{t('testimonialsAdmin.title')}</h1>

      <Card className="mb-6">
        <CardBody>
          <h2 className="mb-3 text-lg font-black text-[var(--app-fg)]">
            {t('testimonialsAdmin.settingsSection')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">
                {t('testimonialsAdmin.titleAr')}
              </label>
              <textarea
                className={textareaClass}
                dir="rtl"
                value={settingsDraft.titleAr}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, titleAr: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">
                {t('testimonialsAdmin.titleEn')}
              </label>
              <textarea
                className={textareaClass}
                dir="ltr"
                value={settingsDraft.titleEn}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, titleEn: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">
                {t('testimonialsAdmin.subtitleAr')}
              </label>
              <textarea
                className={textareaClass}
                dir="rtl"
                rows={3}
                value={settingsDraft.subtitleAr}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, subtitleAr: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">
                {t('testimonialsAdmin.subtitleEn')}
              </label>
              <textarea
                className={textareaClass}
                dir="ltr"
                rows={3}
                value={settingsDraft.subtitleEn}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, subtitleEn: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="button" disabled={savingSettings} onClick={() => saveSettings().catch(() => {})}>
              {savingSettings ? t('testimonialsAdmin.saving') : t('testimonialsAdmin.saveSettings')}
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-[var(--app-fg)]">{t('testimonialsAdmin.itemsSection')}</h2>
        <Button type="button" variant="secondary" onClick={() => setCreateOpen(true)}>
          {t('testimonialsAdmin.addItem')}
        </Button>
      </div>

      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th>{t('testimonialsAdmin.colImage')}</Th>
              <Th>{t('testimonialsAdmin.colOrder')}</Th>
              <Th>{t('testimonialsAdmin.colName')}</Th>
              <Th>{t('testimonialsAdmin.colActive')}</Th>
              <Th className="w-24">{t('subjects.actions')}</Th>
            </Tr>
          </THead>
          <TBody>
            {items.map((row) => (
              <Tr key={row.id}>
                <Td className="max-w-[120px] truncate font-mono text-xs">{row.imageUrl || '—'}</Td>
                <Td>{row.sortOrder}</Td>
                <Td className="max-w-[200px] truncate font-bold">{row.nameAr}</Td>
                <Td>{row.isActive ? t('subjects.active') : t('subjects.inactive')}</Td>
                <Td>
                  <div className="flex gap-1">
                    <button type="button" className={iconBtn} title={t('subjects.edit')} onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={iconBtnDanger}
                      title={t('subjects.delete')}
                      onClick={() => removeItem(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>

      <Modal open={createOpen} title={t('testimonialsAdmin.addItem')} onClose={() => setCreateOpen(false)} className="max-w-2xl">
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pe-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.nameAr')}</label>
              <Input dir="rtl" value={createForm.nameAr} onChange={(e) => setCreateForm((f) => ({ ...f, nameAr: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.nameEn')}</label>
              <Input dir="ltr" value={createForm.nameEn} onChange={(e) => setCreateForm((f) => ({ ...f, nameEn: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.roleAr')}</label>
              <Input dir="rtl" value={createForm.roleAr} onChange={(e) => setCreateForm((f) => ({ ...f, roleAr: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.roleEn')}</label>
              <Input dir="ltr" value={createForm.roleEn} onChange={(e) => setCreateForm((f) => ({ ...f, roleEn: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.textAr')}</label>
            <textarea className={textareaClass} dir="rtl" rows={4} value={createForm.textAr} onChange={(e) => setCreateForm((f) => ({ ...f, textAr: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.textEn')}</label>
            <textarea className={textareaClass} dir="ltr" rows={4} value={createForm.textEn} onChange={(e) => setCreateForm((f) => ({ ...f, textEn: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.imageUrl')}</label>
            <Input dir="ltr" placeholder="https://…" value={createForm.imageUrl} onChange={(e) => setCreateForm((f) => ({ ...f, imageUrl: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('subjects.sortOrder')}</label>
              <Input
                type="number"
                value={createForm.sortOrder}
                onChange={(e) => setCreateForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                {t('subjects.active')}
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              {t('subjects.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => createItem().catch(() => window.alert(t('testimonialsAdmin.saveFailed')))}
              disabled={!canSaveItem(createForm)}
            >
              {t('subjects.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        title={t('testimonialsAdmin.editItem')}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        className="max-w-2xl"
      >
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pe-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.nameAr')}</label>
              <Input dir="rtl" value={editForm.nameAr} onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.nameEn')}</label>
              <Input dir="ltr" value={editForm.nameEn} onChange={(e) => setEditForm((f) => ({ ...f, nameEn: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.roleAr')}</label>
              <Input dir="rtl" value={editForm.roleAr} onChange={(e) => setEditForm((f) => ({ ...f, roleAr: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.roleEn')}</label>
              <Input dir="ltr" value={editForm.roleEn} onChange={(e) => setEditForm((f) => ({ ...f, roleEn: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.textAr')}</label>
            <textarea className={textareaClass} dir="rtl" rows={4} value={editForm.textAr} onChange={(e) => setEditForm((f) => ({ ...f, textAr: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.textEn')}</label>
            <textarea className={textareaClass} dir="ltr" rows={4} value={editForm.textEn} onChange={(e) => setEditForm((f) => ({ ...f, textEn: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('testimonialsAdmin.imageUrl')}</label>
            <Input dir="ltr" value={editForm.imageUrl} onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('subjects.sortOrder')}</label>
              <Input
                type="number"
                value={editForm.sortOrder}
                onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                {t('subjects.active')}
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              {t('subjects.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => saveEdit().catch(() => window.alert(t('testimonialsAdmin.saveFailed')))}
              disabled={!canSaveItem(editForm)}
            >
              {t('subjects.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
