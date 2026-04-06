import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

function majorToCents(value) {
  const s = String(value ?? '').trim().replace(',', '.');
  if (!s) return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

const selectClass = 'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function SubscriptionPlanCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ slug: '', name: '', priceMajor: '', currency: 'USD', interval: 'month', sortOrder: '0', isActive: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const intervalOptions = [
    { value: 'month', label: t('subscriptionPlans.intervalMonth') },
    { value: 'year', label: t('subscriptionPlans.intervalYear') },
    { value: 'week', label: t('subscriptionPlans.intervalWeek') },
    { value: 'day', label: t('subscriptionPlans.intervalDay') },
  ];

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/admin/subscription-plans', {
        slug: form.slug.trim().toLowerCase(),
        name: form.name.trim(),
        priceCents: majorToCents(form.priceMajor),
        currency: form.currency.trim() || 'USD',
        interval: form.interval,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
      });
      navigate('/subscription-plans');
    } catch { setError(t('subscriptionPlans.saveError')); }
    finally { setBusy(false); }
  }

  return (
    <FormPage title={t('subscriptionPlans.add')} backTo="/subscription-plans" maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('subscriptionPlans.slug')} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="monthly" required />
          <Input label={t('subscriptionPlans.name')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input label={t('subscriptionPlans.price')} value={form.priceMajor} onChange={(e) => setForm((f) => ({ ...f, priceMajor: e.target.value }))} placeholder="700" />
          <Input label={t('subscriptionPlans.currency')} value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))} />
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subscriptionPlans.interval')}</label>
            <select className={selectClass} value={form.interval} onChange={(e) => setForm((f) => ({ ...f, interval: e.target.value }))}>
              {intervalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Input label={t('subscriptionPlans.sortOrder')} value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
        </div>

        <label className="flex cursor-pointer items-center gap-2 font-bold text-[var(--app-fg)]">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded" />
          {t('subscriptionPlans.isActive')}
        </label>
        <p className="text-xs font-bold text-[var(--app-muted)]">{t('subscriptionPlans.slugHint')}</p>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/subscription-plans')} disabled={busy}>{t('subscriptionPlans.cancel')}</Button>
          <Button type="submit" disabled={busy || !form.slug.trim() || !form.name.trim()}>{busy ? '…' : t('subscriptionPlans.create')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
