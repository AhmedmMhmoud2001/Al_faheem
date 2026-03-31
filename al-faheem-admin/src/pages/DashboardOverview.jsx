import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { DashboardAnalyticsCharts } from '../components/DashboardAnalyticsCharts.jsx';

const emptyTotals = () => ({
  users: 0,
  questions: 0,
  attempts: 0,
  contact: 0,
  subjects: 0,
  feedback: 0,
});

const emptySeries = () => ({ attemptsByDay: [], usersByDay: [] });

export default function DashboardOverview() {
  const { t, i18n } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const { data } = await api.get('/admin/dashboard-analytics');
        if (!cancel) {
          setAnalytics({
            totals: { ...emptyTotals(), ...data.totals },
            attemptsByDay: Array.isArray(data.attemptsByDay) ? data.attemptsByDay : [],
            usersByDay: Array.isArray(data.usersByDay) ? data.usersByDay : [],
          });
        }
      } catch {
        if (!cancel) {
          setLoadError(true);
          setAnalytics(null);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const totals = analytics?.totals ?? emptyTotals();

  const cards = [
    { labelKey: 'dashboard.statsUsers', value: totals.users },
    { labelKey: 'dashboard.statsQuestions', value: totals.questions },
    { labelKey: 'dashboard.statsAttempts', value: totals.attempts },
    { labelKey: 'dashboard.statsSubjects', value: totals.subjects },
    { labelKey: 'dashboard.statsContact', value: totals.contact },
    { labelKey: 'dashboard.statsFeedback', value: totals.feedback },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black text-[var(--app-fg)]">{t('dashboard.title')}</h1>

      {loadError && (
        <div className="mb-4 rounded-xl border border-[var(--app-danger)]/40 bg-[var(--app-danger)]/10 px-4 py-3 text-sm font-bold text-[var(--app-danger)]">
          {t('dashboard.loadError')}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardBody className="p-6">
                <div className="h-4 w-24 animate-pulse rounded bg-[var(--app-border)]" />
                <div className="mt-3 h-9 w-16 animate-pulse rounded bg-[var(--app-border)]" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Card key={c.labelKey}>
                <CardBody className="p-6">
                  <p className="text-sm font-bold text-[var(--app-muted)]">{t(c.labelKey)}</p>
                  <p className="mt-2 text-3xl font-black text-[var(--app-fg)]">{c.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          {analytics && analytics.attemptsByDay.length > 0 && (
            <DashboardAnalyticsCharts analytics={analytics} t={t} lang={i18n.language} />
          )}
        </>
      )}
    </div>
  );
}
