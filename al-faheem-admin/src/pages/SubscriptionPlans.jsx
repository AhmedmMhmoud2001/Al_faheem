import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Pencil } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

function majorToCents(value) {
  const s = String(value ?? '')
    .trim()
    .replace(',', '.');
  if (!s) return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function centsToMajor(cents) {
  if (cents == null) return '';
  return String(cents / 100);
}

const emptyCreate = {
  slug: '',
  name: '',
  priceMajor: '',
  currency: 'USD',
  interval: 'month',
  sortOrder: '0',
  isActive: true,
};

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function SubscriptionPlans() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const { data } = await api.get('/admin/subscription-plans');
      setRows(data.data || []);
    } catch {
      setLoadError(t('subscriptionPlans.loadError'));
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(row) {
    setEditRow(row);
    setEditForm({
      slug: row.slug,
      name: row.name,
      priceMajor: centsToMajor(row.priceCents),
      currency: row.currency || 'USD',
      interval: row.interval || 'month',
      sortOrder: String(row.sortOrder ?? 0),
      isActive: row.isActive,
    });
    setEditError('');
  }

  function closeEdit() {
    setEditRow(null);
    setEditForm(null);
    setEditError('');
  }

  async function submitCreate(e) {
    e.preventDefault();
    setCreateError('');
    setSaving(true);
    try {
      await api.post('/admin/subscription-plans', {
        slug: createForm.slug.trim().toLowerCase(),
        name: createForm.name.trim(),
        priceCents: majorToCents(createForm.priceMajor),
        currency: createForm.currency.trim() || 'USD',
        interval: createForm.interval,
        sortOrder: parseInt(createForm.sortOrder, 10) || 0,
        isActive: createForm.isActive,
      });
      setCreateForm(emptyCreate);
      await load();
    } catch {
      setCreateError(t('subscriptionPlans.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editRow || !editForm) return;
    setEditError('');
    setSaving(true);
    try {
      await api.patch(`/admin/subscription-plans/${editRow.id}`, {
        slug: editForm.slug.trim().toLowerCase(),
        name: editForm.name.trim(),
        priceCents: majorToCents(editForm.priceMajor),
        currency: editForm.currency.trim() || 'USD',
        interval: editForm.interval,
        sortOrder: parseInt(editForm.sortOrder, 10) || 0,
        isActive: editForm.isActive,
      });
      closeEdit();
      await load();
    } catch {
      setEditError(t('subscriptionPlans.saveError'));
    } finally {
      setSaving(false);
    }
  }

  const intervalOptions = [
    { value: 'month', label: t('subscriptionPlans.intervalMonth') },
    { value: 'year', label: t('subscriptionPlans.intervalYear') },
    { value: 'week', label: t('subscriptionPlans.intervalWeek') },
    { value: 'day', label: t('subscriptionPlans.intervalDay') },
  ];

  function IntervalSelect({ value, onChange, id }) {
    return (
      <div className="w-full">
        <label htmlFor={id} className="mb-1 block text-sm font-bold text-[var(--app-muted)]">
          {t('subscriptionPlans.interval')}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
        >
          {intervalOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start gap-3">
        <Package className="h-8 w-8 shrink-0 text-[var(--app-accent)]" strokeWidth={2} />
        <div>
          <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">{t('subscriptionPlans.title')}</h1>
          <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">{t('subscriptionPlans.subtitle')}</p>
        </div>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      <Card className="mb-8">
        <CardBody className="p-5 md:p-6">
          <h2 className="mb-4 text-lg font-black text-[var(--app-fg)]">{t('subscriptionPlans.add')}</h2>
          <form onSubmit={submitCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label={t('subscriptionPlans.slug')}
              value={createForm.slug}
              onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="monthly"
            />
            <Input
              label={t('subscriptionPlans.name')}
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label={t('subscriptionPlans.price')}
              value={createForm.priceMajor}
              onChange={(e) => setCreateForm((f) => ({ ...f, priceMajor: e.target.value }))}
              placeholder="700"
            />
            <Input
              label={t('subscriptionPlans.currency')}
              value={createForm.currency}
              onChange={(e) => setCreateForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
            />
            <IntervalSelect
              id="create-interval"
              value={createForm.interval}
              onChange={(v) => setCreateForm((f) => ({ ...f, interval: v }))}
            />
            <Input
              label={t('subscriptionPlans.sortOrder')}
              value={createForm.sortOrder}
              onChange={(e) => setCreateForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
            <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
              <label className="flex cursor-pointer items-center gap-2 font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--app-border)]"
                />
                {t('subscriptionPlans.isActive')}
              </label>
            </div>
            <p className="text-xs font-bold text-[var(--app-muted)] sm:col-span-2 lg:col-span-3">{t('subscriptionPlans.slugHint')}</p>
            {createError && (
              <p className="text-sm font-bold text-red-600 dark:text-red-400 sm:col-span-2 lg:col-span-3">{createError}</p>
            )}
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saving || !createForm.slug.trim() || !createForm.name.trim()}>
                {saving ? '…' : t('subscriptionPlans.create')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th>{t('subscriptionPlans.slug')}</Th>
              <Th>{t('subscriptionPlans.name')}</Th>
              <Th>{t('subscriptionPlans.price')}</Th>
              <Th>{t('subscriptionPlans.currency')}</Th>
              <Th>{t('subscriptionPlans.interval')}</Th>
              <Th>{t('subscriptionPlans.sortOrder')}</Th>
              <Th>{t('subscriptionPlans.isActive')}</Th>
              <Th>{t('subscriptionPlans.subscriptionsCount')}</Th>
              <Th />
            </Tr>
          </THead>
          <TBody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td className="font-mono text-sm">{row.slug}</Td>
                <Td className="font-bold">{row.name}</Td>
                <Td>{centsToMajor(row.priceCents)}</Td>
                <Td>{row.currency}</Td>
                <Td>{row.interval}</Td>
                <Td>{row.sortOrder}</Td>
                <Td>{row.isActive ? '✓' : '—'}</Td>
                <Td>{row.subscriptionCount ?? 0}</Td>
                <Td>
                  <button type="button" className={iconBtn} onClick={() => openEdit(row)} aria-label={t('subscriptionPlans.edit')}>
                    <Pencil className="h-4 w-4" />
                  </button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>

      <Modal open={Boolean(editRow)} onClose={closeEdit} title={t('subscriptionPlans.edit')}>
        {editForm && (
          <form onSubmit={submitEdit} className="space-y-4">
            <Input
              label={t('subscriptionPlans.slug')}
              value={editForm.slug}
              onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <Input
              label={t('subscriptionPlans.name')}
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label={t('subscriptionPlans.price')}
              value={editForm.priceMajor}
              onChange={(e) => setEditForm((f) => ({ ...f, priceMajor: e.target.value }))}
            />
            <Input
              label={t('subscriptionPlans.currency')}
              value={editForm.currency}
              onChange={(e) => setEditForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
            />
            <IntervalSelect
              id="edit-interval"
              value={editForm.interval}
              onChange={(v) => setEditForm((f) => ({ ...f, interval: v }))}
            />
            <Input
              label={t('subscriptionPlans.sortOrder')}
              value={editForm.sortOrder}
              onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: e.target.value }))}
            />
            <label className="flex cursor-pointer items-center gap-2 font-bold text-[var(--app-fg)]">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-[var(--app-border)]"
              />
              {t('subscriptionPlans.isActive')}
            </label>
            {editError && <p className="text-sm font-bold text-red-600 dark:text-red-400">{editError}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {t('subscriptionPlans.save')}
              </Button>
              <Button type="button" variant="secondary" onClick={closeEdit}>
                {t('subscriptionPlans.cancel')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
