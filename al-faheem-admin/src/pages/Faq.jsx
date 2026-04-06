import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const textareaClass =
  'w-full min-h-[88px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

export default function Faq() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [settingsDraft, setSettingsDraft] = useState({});
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

  async function removeItem(id) {
    if (!window.confirm(t('faq.confirmDelete'))) return;
    try {
      await api.delete(`/admin/faq/items/${id}`);
      load();
    } catch {
      window.alert(t('faq.deleteFailed'));
    }
  }

  if (!settings) {
    return <p className="font-bold text-[var(--app-muted)]">{t('faq.loading')}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('faq.title')}</h1>
        <Button type="button" size="lg" className="w-full shrink-0 gap-2 sm:w-auto" onClick={() => navigate('/faq/create')}>
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
        <Button type="button" variant="secondary" className="gap-2" onClick={() => navigate('/faq/create')}>
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          {t('faq.addItem')}
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="max-w-md text-sm font-bold text-[var(--app-muted)]">{t('faq.emptyItems')}</p>
            <p className="max-w-md text-xs font-bold text-[var(--app-muted)]">{t('faq.emptyItemsCta')}</p>
            <Button type="button" size="lg" onClick={() => navigate('/faq/create')}>
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
                      <button type="button" className={iconBtn} title={t('subjects.edit')} onClick={() => navigate(`/faq/${row.id}/edit`)}>
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
    </div>
  );
}
