import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Clock, Hash, Pencil, Timer } from 'lucide-react';

const ATTEMPT_TYPES = ['EXAM_TRIAL', 'EXAM_TOPIC', 'PRACTICE'];

function minutesFieldFromSec(sec) {
  if (sec == null || sec === '') return '';
  return String(Math.round((Number(sec) / 60) * 100) / 100);
}

function minutesToSec(value) {
  const n = Number(String(value).replace(',', '.'));
  if (value === '' || Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 60);
}

function optionalInt(value) {
  if (value === '' || value == null) return null;
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? null : n;
}

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
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    attemptType: 'EXAM_TRIAL',
    questionCount: '24',
    totalMinutes: '',
    perQuestionSec: '',
    allowResume: true,
    isActive: true,
  });

  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(null);

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
  }, []);

  const typeLabel = useMemo(
    () => ({
      EXAM_TRIAL: t('examTemplates.typeTrial'),
      EXAM_TOPIC: t('examTemplates.typeTopic'),
      PRACTICE: t('examTemplates.typePractice'),
    }),
    [t],
  );

  function openEdit(row) {
    setEditRow(row);
    setEditForm({
      name: row.name,
      attemptType: row.attemptType,
      questionCount: String(row.questionCount),
      totalMinutes: minutesFieldFromSec(row.totalDurationSec),
      perQuestionSec: row.perQuestionSec != null ? String(row.perQuestionSec) : '',
      allowResume: row.allowResume,
      isActive: row.isActive,
    });
    setSaveError('');
  }

  function closeEdit() {
    setEditRow(null);
    setEditForm(null);
    setSaveError('');
  }

  async function submitCreate(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const totalDurationSec = minutesToSec(createForm.totalMinutes);
      const perQuestionSec = optionalInt(createForm.perQuestionSec);
      await api.post('/admin/exam-templates', {
        code: createForm.code.trim(),
        name: createForm.name.trim(),
        attemptType: createForm.attemptType,
        questionCount: parseInt(createForm.questionCount, 10),
        totalDurationSec,
        perQuestionSec,
        allowResume: createForm.allowResume,
        isActive: createForm.isActive,
      });
      setCreateForm({
        code: '',
        name: '',
        attemptType: 'EXAM_TRIAL',
        questionCount: '24',
        totalMinutes: '',
        perQuestionSec: '',
        allowResume: true,
        isActive: true,
      });
      await load();
    } catch {
      setSaveError(t('examTemplates.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editRow || !editForm) return;
    setSaveError('');
    setSaving(true);
    try {
      const totalDurationSec = minutesToSec(editForm.totalMinutes);
      const perQuestionSec = optionalInt(editForm.perQuestionSec);
      await api.patch(`/admin/exam-templates/${editRow.id}`, {
        name: editForm.name.trim(),
        attemptType: editForm.attemptType,
        questionCount: parseInt(editForm.questionCount, 10),
        totalDurationSec,
        perQuestionSec,
        allowResume: editForm.allowResume,
        isActive: editForm.isActive,
      });
      closeEdit();
      await load();
    } catch {
      setSaveError(t('examTemplates.saveError'));
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">{t('examTemplates.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm font-bold text-[var(--app-muted)]">{t('examTemplates.subtitle')}</p>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      <Card className="mb-8 border-[var(--app-accent)]/30">
        <CardBody className="p-5 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[var(--app-fg)]">
            <Timer className="h-5 w-5 text-[var(--app-accent)]" strokeWidth={2} />
            {t('examTemplates.createTitle')}
          </h2>
          <form onSubmit={submitCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('examTemplates.code')}
                value={createForm.code}
                onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. CUSTOM_01"
                required
              />
              <Input
                label={t('examTemplates.name')}
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">
                {t('examTemplates.attemptType')}
              </label>
              <select
                className={selectClass}
                value={createForm.attemptType}
                onChange={(e) => setCreateForm((f) => ({ ...f, attemptType: e.target.value }))}
              >
                {ATTEMPT_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {typeLabel[v]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label={t('examTemplates.questionCount')}
                type="number"
                min={1}
                value={createForm.questionCount}
                onChange={(e) => setCreateForm((f) => ({ ...f, questionCount: e.target.value }))}
                required
              />
              <div>
                <Input
                  label={t('examTemplates.totalDuration')}
                  type="number"
                  min={0}
                  step="0.5"
                  value={createForm.totalMinutes}
                  onChange={(e) => setCreateForm((f) => ({ ...f, totalMinutes: e.target.value }))}
                  placeholder="—"
                />
                <p className="mt-1 text-xs text-[var(--app-muted)]">{t('examTemplates.totalDurationHint')}</p>
              </div>
              <div>
                <Input
                  label={t('examTemplates.perQuestionSec')}
                  type="number"
                  min={0}
                  value={createForm.perQuestionSec}
                  onChange={(e) => setCreateForm((f) => ({ ...f, perQuestionSec: e.target.value }))}
                  placeholder="—"
                />
                <p className="mt-1 text-xs text-[var(--app-muted)]">{t('examTemplates.perQuestionHint')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={createForm.allowResume}
                  onChange={(e) => setCreateForm((f) => ({ ...f, allowResume: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)]"
                />
                {t('examTemplates.allowResume')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)]"
                />
                {t('examTemplates.isActive')}
              </label>
            </div>
            {saveError && !editRow && (
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{saveError}</p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? t('examTemplates.saving') : t('examTemplates.create')}
            </Button>
          </form>
        </CardBody>
      </Card>

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
                <Button type="button" variant="secondary" className="shrink-0 gap-2" onClick={() => openEdit(row)}>
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

      <Modal open={!!editRow} onClose={closeEdit} title={t('examTemplates.editTitle')} className="max-w-lg">
        {editForm && (
          <form onSubmit={submitEdit} className="space-y-4">
            <p className="text-sm font-bold text-[var(--app-muted)]">
              <span className="font-mono text-[var(--app-fg)]">{editRow.code}</span>
            </p>
            <Input
              label={t('examTemplates.name')}
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">
                {t('examTemplates.attemptType')}
              </label>
              <select
                className={selectClass}
                value={editForm.attemptType}
                onChange={(e) => setEditForm((f) => ({ ...f, attemptType: e.target.value }))}
              >
                {ATTEMPT_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {typeLabel[v]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              <Input
                label={t('examTemplates.questionCount')}
                type="number"
                min={1}
                value={editForm.questionCount}
                onChange={(e) => setEditForm((f) => ({ ...f, questionCount: e.target.value }))}
                required
              />
              <div>
                <Input
                  label={t('examTemplates.totalDuration')}
                  type="number"
                  min={0}
                  step="0.5"
                  value={editForm.totalMinutes}
                  onChange={(e) => setEditForm((f) => ({ ...f, totalMinutes: e.target.value }))}
                  placeholder="—"
                />
                <p className="mt-1 text-xs text-[var(--app-muted)]">{t('examTemplates.totalDurationHint')}</p>
              </div>
              <div>
                <Input
                  label={t('examTemplates.perQuestionSec')}
                  type="number"
                  min={0}
                  value={editForm.perQuestionSec}
                  onChange={(e) => setEditForm((f) => ({ ...f, perQuestionSec: e.target.value }))}
                  placeholder="—"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={editForm.allowResume}
                  onChange={(e) => setEditForm((f) => ({ ...f, allowResume: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--app-border)]"
                />
                {t('examTemplates.allowResume')}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--app-border)]"
                />
                {t('examTemplates.isActive')}
              </label>
            </div>
            {saveError && (
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{saveError}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? t('examTemplates.saving') : t('examTemplates.save')}
              </Button>
              <Button type="button" variant="secondary" onClick={closeEdit} disabled={saving}>
                {t('examTemplates.cancel')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
