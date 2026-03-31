import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const textareaClass =
  'w-full min-h-[88px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const emptyItem = {
  scope: 'GENERAL',
  questionAr: '',
  questionEn: '',
  answerAr: '',
  answerEn: '',
  sortOrder: 0,
  isActive: true,
};

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

/** نفس بنية نموذج إضافة/تعديل السؤال في صفحة الأسئلة: شبكة، أقسام AR/EN، وتذييل. */
function FaqItemModalForm({
  mode,
  form,
  setForm,
  textareaClass,
  t,
  onSubmit,
  onCancel,
  canSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid max-h-[min(70vh,640px)] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {mode === 'create' ? (
          <p className="border-b border-[var(--app-border)] pb-3 text-xs font-bold leading-relaxed text-[var(--app-muted)] sm:col-span-2">
            {t('faq.createModalHint')}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.scopeLabel')}</label>
          <select
            value={form.scope || 'GENERAL'}
            onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          >
            <option value="GENERAL">{t('faq.scopeGeneral')}</option>
            <option value="PAYMENT">{t('faq.scopePayment')}</option>
          </select>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{t('faq.scopeHint')}</p>
        </div>

        <p className="text-sm font-black text-[var(--app-accent)] sm:col-span-2">{t('questions.sectionAr')}</p>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.questionAr')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            dir="rtl"
            value={form.questionAr}
            onChange={(e) => setForm((f) => ({ ...f, questionAr: e.target.value }))}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.answerAr')}</label>
          <textarea
            className={textareaClass}
            rows={4}
            dir="rtl"
            value={form.answerAr}
            onChange={(e) => setForm((f) => ({ ...f, answerAr: e.target.value }))}
            required
          />
        </div>

        <p className="text-sm font-black text-[var(--app-accent)] sm:col-span-2">{t('questions.sectionEn')}</p>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.questionEn')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            dir="ltr"
            value={form.questionEn}
            onChange={(e) => setForm((f) => ({ ...f, questionEn: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('faq.answerEn')}</label>
          <textarea
            className={textareaClass}
            rows={4}
            dir="ltr"
            value={form.answerEn}
            onChange={(e) => setForm((f) => ({ ...f, answerEn: e.target.value }))}
          />
        </div>

        <div className="grid gap-3 border-t border-[var(--app-border)] pt-4 sm:col-span-2 sm:grid-cols-2">
          <Input
            label={t('subjects.sortOrder')}
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              {t('subjects.active')}
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('subjects.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {mode === 'create' ? t('faq.addItem') : t('subjects.save')}
        </Button>
      </div>
    </form>
  );
}

export default function Faq() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [settingsDraft, setSettingsDraft] = useState({});
  /** null | { mode: 'create' } | { mode: 'edit', id: number } */
  const [itemDialog, setItemDialog] = useState(null);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/faq');
    setSettings(data.settings);
    setItems(data.items);
    setSettingsDraft({
      introAr: data.settings.introAr ?? '',
      introEn: data.settings.introEn ?? '',
      titleHighlightAr: data.settings.titleHighlightAr ?? '',
      titleRestAr: data.settings.titleRestAr ?? '',
      titleHighlightEn: data.settings.titleHighlightEn ?? '',
      titleRestEn: data.settings.titleRestEn ?? '',
    });
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  async function saveSettings() {
    setSavingSettings(true);
    try {
      await api.put('/admin/faq/settings', settingsDraft);
      await load();
    } finally {
      setSavingSettings(false);
    }
  }

  function closeItemDialog() {
    setItemDialog(null);
    setItemForm(emptyItem);
  }

  async function submitItem(e) {
    e.preventDefault();
    if (!itemDialog) return;
    if (!itemForm.questionAr.trim() || !itemForm.answerAr.trim()) return;
    try {
      if (itemDialog.mode === 'create') {
        await api.post('/admin/faq/items', itemForm);
      } else {
        await api.patch(`/admin/faq/items/${itemDialog.id}`, itemForm);
      }
      closeItemDialog();
      load();
    } catch {
      window.alert(t('faq.saveFailed'));
    }
  }

  async function removeItem(id) {
    if (!window.confirm(t('faq.confirmDelete'))) return;
    try {
      await api.delete(`/admin/faq/items/${id}`);
      load();
    } catch {
      window.alert(t('faq.deleteFailed'));
    }
  }

  function openCreateModal() {
    setItemForm({
      ...emptyItem,
      sortOrder: items.length ? Math.max(0, ...items.map((i) => i.sortOrder)) + 1 : 0,
    });
    setItemDialog({ mode: 'create' });
  }

  function openEdit(row) {
    setItemForm({
      scope: row.scope === 'PAYMENT' ? 'PAYMENT' : 'GENERAL',
      questionAr: row.questionAr,
      questionEn: row.questionEn ?? '',
      answerAr: row.answerAr,
      answerEn: row.answerEn ?? '',
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
    setItemDialog({ mode: 'edit', id: row.id });
  }

  if (!settings) {
    return <p className="font-bold text-[var(--app-muted)]">{t('faq.loading')}</p>;
  }

  const itemDialogOpen = itemDialog != null;
  const itemDialogTitle =
    itemDialog?.mode === 'create' ? t('faq.createModalTitle') : t('faq.editItem');
  const itemFormValid = Boolean(itemForm.questionAr.trim() && itemForm.answerAr.trim());

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('faq.title')}</h1>
        <Button type="button" size="lg" className="w-full shrink-0 gap-2 sm:w-auto" onClick={openCreateModal}>
          <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
          {t('faq.createQuestionOpen')}
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <h2 className="mb-3 text-lg font-black text-[var(--app-fg)]">{t('faq.settingsSection')}</h2>
          <p className="mb-4 text-sm font-bold text-[var(--app-muted)]">{t('faq.settingsHint')}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('faq.introAr')}</label>
              <textarea
                className={textareaClass}
                dir="rtl"
                value={settingsDraft.introAr}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, introAr: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('faq.introEn')}</label>
              <textarea
                className={textareaClass}
                dir="ltr"
                value={settingsDraft.introEn}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, introEn: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('faq.titleHighlightAr')}</label>
              <Input
                dir="rtl"
                value={settingsDraft.titleHighlightAr}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, titleHighlightAr: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('faq.titleRestAr')}</label>
              <Input
                dir="rtl"
                value={settingsDraft.titleRestAr}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, titleRestAr: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('faq.titleHighlightEn')}</label>
              <Input
                dir="ltr"
                value={settingsDraft.titleHighlightEn}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, titleHighlightEn: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--app-muted)]">{t('faq.titleRestEn')}</label>
              <Input
                dir="ltr"
                value={settingsDraft.titleRestEn}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, titleRestEn: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="button" disabled={savingSettings} onClick={() => saveSettings().catch(() => {})}>
              {savingSettings ? t('faq.saving') : t('faq.saveSettings')}
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-[var(--app-fg)]">{t('faq.itemsSection')}</h2>
        <Button type="button" variant="secondary" className="gap-2" onClick={openCreateModal}>
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          {t('faq.addItem')}
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="max-w-md text-sm font-bold text-[var(--app-muted)]">{t('faq.emptyItems')}</p>
            <p className="max-w-md text-xs font-bold text-[var(--app-muted)]">{t('faq.emptyItemsCta')}</p>
            <Button type="button" size="lg" onClick={openCreateModal}>
              <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
              {t('faq.createQuestionOpen')}
            </Button>
          </CardBody>
        </Card>
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <Tr>
                <Th>{t('faq.colOrder')}</Th>
                <Th>{t('faq.colScope')}</Th>
                <Th>{t('faq.colQuestion')}</Th>
                <Th>{t('faq.colActive')}</Th>
                <Th className="w-24">{t('subjects.actions')}</Th>
              </Tr>
            </THead>
            <TBody>
              {items.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.sortOrder}</Td>
                  <Td className="whitespace-nowrap text-sm font-bold">
                    {row.scope === 'PAYMENT' ? t('faq.scopePayment') : t('faq.scopeGeneral')}
                  </Td>
                  <Td className="max-w-md truncate font-bold">{row.questionAr}</Td>
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
      )}

      <Modal open={itemDialogOpen} title={itemDialogTitle} onClose={closeItemDialog} className="max-w-3xl">
        {itemDialog ? (
          <FaqItemModalForm
            mode={itemDialog.mode}
            form={itemForm}
            setForm={setItemForm}
            textareaClass={textareaClass}
            t={t}
            onSubmit={submitItem}
            onCancel={closeItemDialog}
            canSubmit={itemFormValid}
          />
        ) : null}
      </Modal>
    </div>
  );
}
