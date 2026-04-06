import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const textareaClass =
  'w-full min-h-[80px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

export default function TestimonialsManage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [items, setItems] = useState([]);
  const [settingsDraft, setSettingsDraft] = useState({});
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

  async function removeItem(id) {
    if (!window.confirm(t('testimonialsAdmin.confirmDelete'))) return;
    try {
      await api.delete(`/admin/testimonials/items/${id}`);
      load();
    } catch {
      window.alert(t('testimonialsAdmin.deleteFailed'));
    }
  }

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
        <Button type="button" variant="secondary" onClick={() => navigate('/testimonials/create')}>
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
                    <button
                      type="button"
                      className={iconBtn}
                      title={t('subjects.edit')}
                      onClick={() => navigate(`/testimonials/${row.id}/edit`)}
                    >
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
    </div>
  );
}
