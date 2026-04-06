import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

function centsToMajor(cents) {
  if (cents == null) return '';
  return String(cents / 100);
}

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function SubscriptionPlans() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');

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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Package className="h-8 w-8 shrink-0 text-[var(--app-accent)]" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">{t('subscriptionPlans.title')}</h1>
            <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">{t('subscriptionPlans.subtitle')}</p>
          </div>
        </div>
        <Button type="button" onClick={() => navigate('/subscription-plans/create')}>
          {t('subscriptionPlans.create')}
        </Button>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

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
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => navigate(`/subscription-plans/${row.id}/edit`)}
                    aria-label={t('subscriptionPlans.edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>
    </div>
  );
}
