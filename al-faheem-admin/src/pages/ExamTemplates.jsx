import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Clock, Hash, Pencil, Timer } from 'lucide-react';

function formatTotalSec(sec, t) {
  if (sec == null) return t('examTemplates.notSet');
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0 && s > 0) return `${m} ${t('examTemplates.minutesShort')} ${s} ${t('examTemplates.secondsShort')}`;
  if (m > 0) return `${m} ${t('examTemplates.minutesShort')}`;
  return `${s} ${t('examTemplates.secondsShort')}`;
}

export default function ExamTemplates() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');

  async function load() {
    setLoadError('');
    try {
      const { data } = await api.get('/admin/exam-templates');
      setRows(data.data);
    } catch {
      setLoadError(t('examTemplates.loadError'));
    }
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const typeLabel = useMemo(
    () => ({
      EXAM_TRIAL: t('examTemplates.typeTrial'),
      EXAM_TOPIC: t('examTemplates.typeTopic'),
      PRACTICE: t('examTemplates.typePractice'),
    }),
    [t],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">{t('examTemplates.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm font-bold text-[var(--app-muted)]">{t('examTemplates.subtitle')}</p>
        </div>
        <Button type="button" onClick={() => navigate('/exam-templates/create')}>
          {t('examTemplates.create')}
        </Button>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      <div className="space-y-4">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardBody className="p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-[var(--app-row-hover)] px-2 py-0.5 font-mono text-sm font-black text-[var(--app-fg)]">
                      {row.code}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        row.isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-[var(--app-row-hover)] text-[var(--app-muted)]'
                      }`}
                    >
                      {row.isActive ? t('examTemplates.isActive') : t('examTemplates.inactive')}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-[var(--app-fg)]">{row.name}</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">{typeLabel[row.attemptType]}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 gap-2"
                  onClick={() => navigate(`/exam-templates/${row.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                  {t('examTemplates.edit')}
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-row-hover)]/50 p-4 dark:bg-[var(--app-row-hover)]/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent)]/20 text-[var(--app-accent-fg)] dark:text-[var(--app-accent)]">
                    <Hash className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]">
                      {t('examTemplates.statQuestions')}
                    </p>
                    <p className="mt-1 text-2xl font-black text-[var(--app-fg)]">{row.questionCount}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-row-hover)]/50 p-4 dark:bg-[var(--app-row-hover)]/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent)]/20 text-[var(--app-accent-fg)] dark:text-[var(--app-accent)]">
                    <Clock className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]">
                      {t('examTemplates.statTotalTime')}
                    </p>
                    <p className="mt-1 text-2xl font-black text-[var(--app-fg)]">
                      {formatTotalSec(row.totalDurationSec, t)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-row-hover)]/50 p-4 dark:bg-[var(--app-row-hover)]/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent)]/20 text-[var(--app-accent-fg)] dark:text-[var(--app-accent)]">
                    <Timer className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]">
                      {t('examTemplates.statPerQuestion')}
                    </p>
                    <p className="mt-1 text-2xl font-black text-[var(--app-fg)]">
                      {row.perQuestionSec != null
                        ? `${row.perQuestionSec} ${t('examTemplates.secondsShort')}`
                        : t('examTemplates.notSet')}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
