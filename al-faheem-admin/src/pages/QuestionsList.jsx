import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const emptyForm = {
  subjectId: '',
  difficulty: 1,
  sortOrder: 0,
  stem: '',
  stemEn: '',
  optionA: '',
  optionAEn: '',
  optionB: '',
  optionBEn: '',
  optionC: '',
  optionCEn: '',
  optionD: '',
  optionDEn: '',
  correctIndex: 0,
  imageUrl: '',
  explanation: '',
  explanationEn: '',
  videoUrl: '',
  pdfUrl: '',
  isPublished: false,
  includeInExam: false,
};

function mediaSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const p = url.startsWith('/') ? url : `/${url}`;
  return `${publicBase}${p}`;
}

const textareaClass =
  'w-full min-h-[88px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

function buildPayload(form) {
  const sid = Number(form.subjectId);
  const opt = (s) => (s?.trim() ? s.trim() : null);
  return {
    subjectId: sid,
    difficulty: Number(form.difficulty) || 1,
    sortOrder: Number(form.sortOrder) || 0,
    stem: form.stem.trim(),
    stemEn: opt(form.stemEn),
    optionA: form.optionA.trim(),
    optionAEn: opt(form.optionAEn),
    optionB: form.optionB.trim(),
    optionBEn: opt(form.optionBEn),
    optionC: form.optionC.trim(),
    optionCEn: opt(form.optionCEn),
    optionD: form.optionD.trim(),
    optionDEn: opt(form.optionDEn),
    correctIndex: Number(form.correctIndex),
    imageUrl: form.imageUrl?.trim() ? form.imageUrl.trim() : null,
    explanation: opt(form.explanation),
    explanationEn: opt(form.explanationEn),
    videoUrl: form.videoUrl?.trim() ? form.videoUrl.trim() : null,
    pdfUrl: form.pdfUrl?.trim() ? form.pdfUrl.trim() : null,
    isPublished: !!form.isPublished,
    includeInExam: !!form.includeInExam,
  };
}

export default function QuestionsList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const createImageRef = useRef(null);
  const createVideoRef = useRef(null);
  const createPdfRef = useRef(null);
  const editImageRef = useRef(null);
  const editVideoRef = useRef(null);
  const editPdfRef = useRef(null);

  useEffect(() => {
    api.get('/admin/subjects').then((r) => setSubjects(r.data.data));
  }, []);

  const load = useCallback(async () => {
    const params = { page, limit };
    if (subjectId) params.subjectId = subjectId;
    if (difficultyFilter) params.difficulty = difficultyFilter;
    if (publishedFilter === 'true' || publishedFilter === 'false') params.isPublished = publishedFilter;
    if (examFilter === 'true' || examFilter === 'false') params.includeInExam = examFilter;
    const { data } = await api.get('/admin/questions', { params });
    setRows(data.data);
    setTotal(data.meta.total);
  }, [page, limit, subjectId, difficultyFilter, publishedFilter, examFilter]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const resetCreate = useCallback(() => {
    setCreateForm({
      ...emptyForm,
      subjectId: subjects[0]?.id != null ? String(subjects[0].id) : '',
    });
    [createImageRef, createVideoRef, createPdfRef].forEach((r) => {
      if (r.current) r.current.value = '';
    });
  }, [subjects]);

  async function handleUpload(file, setForm, kind) {
    const setBusy = kind === 'image' ? setImageBusy : kind === 'video' ? setVideoBusy : setPdfBusy;
    setBusy(true);
    try {
      const url = await uploadAdminFile(file);
      if (kind === 'image') setForm((prev) => ({ ...prev, imageUrl: url }));
      else if (kind === 'video') setForm((prev) => ({ ...prev, videoUrl: url }));
      else setForm((prev) => ({ ...prev, pdfUrl: url }));
    } catch {
      window.alert(t('questions.uploadFailed'));
    } finally {
      setBusy(false);
    }
  }

  function QuestionImageBlock({ form, setForm, fileRef }) {
    const src = mediaSrc(form.imageUrl);
    return (
      <div className="border-b border-[var(--app-border)] pb-4 sm:col-span-2">
        <p className="mb-3 text-sm font-bold text-[var(--app-muted)]">{t('questions.questionImage')}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
            {src ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">—</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) handleUpload(f, setForm, 'image');
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={imageBusy}
              onClick={() => fileRef.current?.click()}
            >
              {t('subjects.chooseImage')}
            </Button>
            {form.imageUrl ? (
              <Button
                type="button"
                variant="secondary"
                disabled={imageBusy}
                onClick={() => {
                  setForm((p) => ({ ...p, imageUrl: '' }));
                  if (fileRef.current) fileRef.current.value = '';
                }}
              >
                {t('subjects.removeImage')}
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--app-muted)]">{t('questions.uploadHint')}</p>
      </div>
    );
  }

  function VideoPdfRow({ form, setForm, videoRef, pdfRef }) {
    return (
      <div className="space-y-4 border-b border-[var(--app-border)] pb-4 sm:col-span-2">
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">{t('questions.video')}</p>
          <Input
            label={t('questions.videoUrl')}
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://..."
            className="mb-2"
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={videoRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) handleUpload(f, setForm, 'video');
              }}
            />
            <Button type="button" variant="secondary" disabled={videoBusy} onClick={() => videoRef.current?.click()}>
              {t('questions.uploadVideo')}
            </Button>
            {form.videoUrl ? (
              <Button
                type="button"
                variant="secondary"
                disabled={videoBusy}
                onClick={() => {
                  setForm((p) => ({ ...p, videoUrl: '' }));
                  if (videoRef.current) videoRef.current.value = '';
                }}
              >
                {t('questions.removeVideo')}
              </Button>
            ) : null}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">{t('questions.pdfOptional')}</p>
          <Input
            label={t('questions.pdfUrl')}
            value={form.pdfUrl}
            onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
            placeholder="https://... أو مسار بعد الرفع"
            className="mb-2"
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={pdfRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) handleUpload(f, setForm, 'pdf');
              }}
            />
            <Button type="button" variant="secondary" disabled={pdfBusy} onClick={() => pdfRef.current?.click()}>
              {t('questions.uploadPdf')}
            </Button>
            {form.pdfUrl ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pdfBusy}
                onClick={() => {
                  setForm((p) => ({ ...p, pdfUrl: '' }));
                  if (pdfRef.current) pdfRef.current.value = '';
                }}
              >
                {t('questions.removePdf')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function formFields(form, setForm, imageRef, videoRef, pdfRef, correctRadioName) {
    return (
      <div className="grid max-h-[min(70vh,640px)] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        <QuestionImageBlock form={form} setForm={setForm} fileRef={imageRef} />
        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.subject')}</label>
            <select
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              required
            >
              <option value="" disabled>
                —
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t('questions.difficulty')}
            type="number"
            min={1}
            max={4}
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            required
          />
          <Input
            label={t('questions.sortOrder')}
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>
        <p className="text-sm font-black text-[var(--app-accent)] sm:col-span-2">{t('questions.sectionAr')}</p>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.stem')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.stem}
            onChange={(e) => setForm({ ...form, stem: e.target.value })}
            required
          />
        </div>
        {(['optionA', 'optionB', 'optionC', 'optionD']).map((key) => (
          <div key={key} className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t(`questions.${key}`)}</label>
            <textarea
              className={textareaClass}
              rows={2}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          </div>
        ))}
        <p className="text-sm font-black text-[var(--app-accent)] sm:col-span-2">{t('questions.sectionEn')}</p>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.stemEn')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.stemEn}
            onChange={(e) => setForm({ ...form, stemEn: e.target.value })}
          />
        </div>
        {(
          [
            ['optionA', 'optionAEn'],
            ['optionB', 'optionBEn'],
            ['optionC', 'optionCEn'],
            ['optionD', 'optionDEn'],
          ]
        ).map(([arKey, enKey]) => (
          <div key={enKey} className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">
              {t(`questions.${arKey}`)} ({t('questions.english')})
            </label>
            <textarea
              className={textareaClass}
              rows={2}
              value={form[enKey]}
              onChange={(e) => setForm({ ...form, [enKey]: e.target.value })}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">{t('questions.correctAnswer')}</p>
          <div className="flex flex-wrap gap-4">
            {[0, 1, 2, 3].map((i) => (
              <label key={i} className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="radio"
                  name={correctRadioName}
                  checked={Number(form.correctIndex) === i}
                  onChange={() => setForm({ ...form, correctIndex: i })}
                />
                {t(`questions.optionLabel${i}`)}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.explanation')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.explanationEn')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.explanationEn}
            onChange={(e) => setForm({ ...form, explanationEn: e.target.value })}
          />
        </div>
        <VideoPdfRow form={form} setForm={setForm} videoRef={videoRef} pdfRef={pdfRef} />
        <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)] sm:col-span-2">
          <input
            type="checkbox"
            checked={form.includeInExam}
            onChange={(e) => setForm({ ...form, includeInExam: e.target.checked })}
          />
          {t('questions.includeInExam')}
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)] sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          {t('questions.published')}
        </label>
      </div>
    );
  }

  async function create(e) {
    e.preventDefault();
    const p = buildPayload(createForm);
    if (!p.subjectId) {
      window.alert(t('questions.pickSubject'));
      return;
    }
    await api.post('/admin/questions', p);
    setCreateOpen(false);
    resetCreate();
    load();
  }

  function openEdit(q) {
    setEditing(q);
    setEditForm({
      subjectId: String(q.subjectId),
      difficulty: q.difficulty,
      sortOrder: q.sortOrder ?? 0,
      stem: q.stem ?? '',
      stemEn: q.stemEn ?? '',
      optionA: q.optionA ?? '',
      optionAEn: q.optionAEn ?? '',
      optionB: q.optionB ?? '',
      optionBEn: q.optionBEn ?? '',
      optionC: q.optionC ?? '',
      optionCEn: q.optionCEn ?? '',
      optionD: q.optionD ?? '',
      optionDEn: q.optionDEn ?? '',
      correctIndex: q.correctIndex ?? 0,
      imageUrl: q.imageUrl ?? '',
      explanation: q.explanation ?? '',
      explanationEn: q.explanationEn ?? '',
      videoUrl: q.videoUrl ?? '',
      pdfUrl: q.pdfUrl ?? '',
      isPublished: !!q.isPublished,
      includeInExam: !!q.includeInExam,
    });
    [editImageRef, editVideoRef, editPdfRef].forEach((r) => {
      if (r.current) r.current.value = '';
    });
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    const p = buildPayload(editForm);
    await api.patch(`/admin/questions/${editing.id}`, p);
    setEditOpen(false);
    setEditing(null);
    load();
  }

  async function remove(q) {
    if (!window.confirm(t('questions.confirmDelete'))) return;
    try {
      await api.delete(`/admin/questions/${q.id}`);
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || t('questions.deleteFailed'));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('questions.title')}</h1>
        <Button
          type="button"
          onClick={() => {
            resetCreate();
            setCreateOpen(true);
          }}
        >
          {t('questions.openAdd')}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={subjectId}
          onChange={(e) => {
            setPage(1);
            setSubjectId(e.target.value);
          }}
        >
          <option value="">{t('questions.allSubjects')}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameAr}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={difficultyFilter}
          onChange={(e) => {
            setPage(1);
            setDifficultyFilter(e.target.value);
          }}
        >
          <option value="">{t('questions.allDifficulties')}</option>
          {[1, 2, 3, 4].map((d) => (
            <option key={d} value={d}>
              {t('questions.difficulty')} {d}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={publishedFilter}
          onChange={(e) => {
            setPage(1);
            setPublishedFilter(e.target.value);
          }}
        >
          <option value="">{t('questions.allStatuses')}</option>
          <option value="true">{t('questions.published')}</option>
          <option value="false">{t('questions.draft')}</option>
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={examFilter}
          onChange={(e) => {
            setPage(1);
            setExamFilter(e.target.value);
          }}
        >
          <option value="">{t('questions.examFilterAll')}</option>
          <option value="true">{t('questions.examYes')}</option>
          <option value="false">{t('questions.examNo')}</option>
        </select>
      </div>

      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th>{t('questions.id')}</Th>
              <Th>{t('questions.stem')}</Th>
              <Th>{t('questions.subject')}</Th>
              <Th>{t('questions.difficulty')}</Th>
              <Th>{t('questions.sortOrder')}</Th>
              <Th>{t('questions.status')}</Th>
              <Th>{t('questions.includeInExamShort')}</Th>
              <Th className="min-w-[5rem] whitespace-nowrap">{t('subjects.actions')}</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map((q) => (
              <Tr key={q.id}>
                <Td className="font-mono text-xs text-[var(--app-muted)]">{q.id}</Td>
                <Td className="max-w-[220px]">
                  <p className="line-clamp-2 font-bold text-[var(--app-fg)]">{q.stem}</p>
                </Td>
                <Td>{q.subject?.nameAr ?? '—'}</Td>
                <Td>{q.difficulty}</Td>
                <Td>{q.sortOrder ?? 0}</Td>
                <Td>{q.isPublished ? t('questions.published') : t('questions.draft')}</Td>
                <Td>{q.includeInExam ? t('questions.examYes') : t('questions.examNo')}</Td>
                <Td className="whitespace-nowrap">
                  <div className="inline-flex flex-nowrap items-center gap-0.5">
                    <button
                      type="button"
                      className={iconBtn}
                      title={t('subjects.edit')}
                      aria-label={t('subjects.edit')}
                      onClick={() => openEdit(q)}
                    >
                      <Pencil className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className={iconBtnDanger}
                      title={t('subjects.delete')}
                      aria-label={t('subjects.delete')}
                      onClick={() => remove(q)}
                    >
                      <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>

      <div className="mt-4 flex justify-center gap-2">
        <Button variant="secondary" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          {t('actions.prev')}
        </Button>
        <Button variant="secondary" type="button" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>
          {t('actions.next')}
        </Button>
      </div>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetCreate();
        }}
        title={t('questions.addTitle')}
        className="max-w-3xl"
      >
        <form onSubmit={create} className="space-y-4">
          {formFields(
            createForm,
            setCreateForm,
            createImageRef,
            createVideoRef,
            createPdfRef,
            'question-correct-create',
          )}
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                resetCreate();
              }}
            >
              {t('subjects.cancel')}
            </Button>
            <Button type="submit">{t('questions.add')}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        title={t('questions.editTitle')}
        className="max-w-3xl"
      >
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            {formFields(
              editForm,
              setEditForm,
              editImageRef,
              editVideoRef,
              editPdfRef,
              'question-correct-edit',
            )}
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditOpen(false);
                  setEditing(null);
                }}
              >
                {t('subjects.cancel')}
              </Button>
              <Button type="submit">{t('subjects.save')}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
