import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, CardBody } from './ui/Card.jsx';

const BAR_COLORS = ['#ffd131', '#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];

function buildLineSeries(attemptsByDay, usersByDay, lang) {
  const loc = String(lang || 'en').startsWith('ar') ? 'ar-SA' : 'en-US';
  return attemptsByDay.map((row, i) => ({
    label: new Date(`${row.date}T12:00:00`).toLocaleDateString(loc, { month: 'short', day: 'numeric' }),
    attempts: row.count,
    newUsers: usersByDay[i]?.count ?? 0,
  }));
}

function buildBarRows(totals, t) {
  return [
    { name: t('dashboard.statsUsers'), value: totals.users },
    { name: t('dashboard.statsQuestions'), value: totals.questions },
    { name: t('dashboard.statsAttempts'), value: totals.attempts },
    { name: t('dashboard.statsSubjects'), value: totals.subjects },
    { name: t('dashboard.statsContact'), value: totals.contact },
    { name: t('dashboard.statsFeedback'), value: totals.feedback },
  ];
}

export function DashboardAnalyticsCharts({ analytics, t, lang }) {
  const { totals, attemptsByDay, usersByDay } = analytics;
  const lineData = buildLineSeries(attemptsByDay, usersByDay, lang);
  const barData = buildBarRows(totals, t);

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardBody className="p-6">
          <h2 className="text-lg font-black text-[var(--app-fg)]">{t('dashboard.chartTrendTitle')}</h2>
          <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">{t('dashboard.chartTrendSubtitle')}</p>
          <div className="mt-4 h-[320px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--app-muted)' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: 'var(--app-muted)' }}
                  width={36}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'var(--app-muted)' }}
                  width={36}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--app-card)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '12px',
                    color: 'var(--app-card-fg)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="attempts"
                  name={t('dashboard.seriesAttempts')}
                  stroke="#ffd131"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#ffd131' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="newUsers"
                  name={t('dashboard.seriesNewUsers')}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#2563eb' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <h2 className="text-lg font-black text-[var(--app-fg)]">{t('dashboard.chartTotalsTitle')}</h2>
          <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">{t('dashboard.chartTotalsSubtitle')}</p>
          <p className="mt-2 text-xs font-bold text-[var(--app-muted)]">{t('dashboard.chartTotalsHint')}</p>
          <div className="mt-4 h-[320px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--app-muted)' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fontSize: 11, fill: 'var(--app-muted)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--app-card)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '12px',
                    color: 'var(--app-card-fg)',
                  }}
                  formatter={(value) => [value, '']}
                />
                <Bar name="count" dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
