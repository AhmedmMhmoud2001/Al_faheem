import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Save } from 'lucide-react';
import { api } from '../api/client.js';

export default function TrialSettings() {
  const { t } = useTranslation();
  const [trialDays, setTrialDays] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/settings')
      .then((r) => {
        setTrialDays(String(r.data.trialDays ?? 7));
        setError('');
      })
      .catch(() => setError(t('trialSettings.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  async function handleSubmit(e) {
    e.preventDefault();
    const days = parseInt(trialDays, 10);
    if (isNaN(days) || days < 0 || days > 365) {
      setError(t('trialSettings.validationError'));
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.patch('/admin/settings', { trialDays: days });
      setTrialDays(String(data.trialDays));
      setSuccess(t('trialSettings.saveSuccess'));
    } catch {
      setError(t('trialSettings.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-accent)]/10 text-[var(--app-accent)]">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[var(--app-fg)]">{t('trialSettings.title')}</h1>
          <p className="text-sm text-[var(--app-muted)]">{t('trialSettings.subtitle')}</p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-[var(--app-muted)]">{t('trialSettings.loading')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="trialDays"
                className="mb-1.5 block text-sm font-bold text-[var(--app-fg)]"
              >
                {t('trialSettings.trialDaysLabel')}
              </label>
              <p className="mb-3 text-xs text-[var(--app-muted)]">
                {t('trialSettings.trialDaysHint')}
              </p>
              <div className="flex items-center gap-3">
                <input
                  id="trialDays"
                  type="number"
                  min="0"
                  max="365"
                  step="1"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="w-32 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-center text-lg font-black text-[var(--app-fg)] outline-none focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent)]/20"
                  required
                />
                <span className="text-sm font-bold text-[var(--app-muted)]">
                  {t('trialSettings.days')}
                </span>
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <strong>{t('trialSettings.infoTitle')}</strong>
              <p className="mt-1">{t('trialSettings.infoBody')}</p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--app-accent)] px-6 py-2.5 text-sm font-black text-[var(--app-accent-fg)] transition-opacity disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? t('trialSettings.saving') : t('trialSettings.save')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
