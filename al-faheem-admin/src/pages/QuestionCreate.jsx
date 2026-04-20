import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

import 'mathlive';

const textareaClass =
  'w-full min-h-[88px] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const selectClass =
  'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

function mediaSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${publicBase}${url.startsWith('/') ? url : `/${url}`}`;
}

const emptyForm = { subjectId: '', subCategoryId: '', difficulty: 1, sortOrder: 0, stem: '', stemEn: '', optionA: '', optionAEn: '', optionB: '', optionBEn: '', optionC: '', optionCEn: '', optionD: '', optionDEn: '', correctIndex: 0, imageUrl: '', explanation: '', explanationEn: '', videoUrl: '', pdfUrl: '', isPublished: false, includeInExam: false };

function buildPayload(form) {
  const opt = (s) => (s?.trim() ? s.trim() : null);
  return { subjectId: Number(form.subjectId), subCategoryId: form.subCategoryId ? Number(form.subCategoryId) : null, difficulty: Number(form.difficulty) || 1, sortOrder: Number(form.sortOrder) || 0, stem: form.stem.trim(), stemEn: opt(form.stemEn), optionA: form.optionA.trim(), optionAEn: opt(form.optionAEn), optionB: form.optionB.trim(), optionBEn: opt(form.optionBEn), optionC: form.optionC.trim(), optionCEn: opt(form.optionCEn), optionD: form.optionD.trim(), optionDEn: opt(form.optionDEn), correctIndex: Number(form.correctIndex), imageUrl: form.imageUrl?.trim() || null, explanation: opt(form.explanation), explanationEn: opt(form.explanationEn), videoUrl: form.videoUrl?.trim() || null, pdfUrl: form.pdfUrl?.trim() || null, isPublished: !!form.isPublished, includeInExam: !!form.includeInExam };
}

function insertAtSelection(textarea, valueToInsert) {
  if (!textarea) return null;
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? start;
  const v = textarea.value ?? '';
  const next = v.slice(0, start) + valueToInsert + v.slice(end);
  const nextPos = start + valueToInsert.length;
  return { next, nextPos };
}

export default function QuestionCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [subcats, setSubcats] = useState([]);
  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const pdfRef = useRef(null);

  // MathLive modal
  const [mathOpen, setMathOpen] = useState(false);
  const [mathMode, setMathMode] = useState('block'); // inline | block
  const [mathTarget, setMathTarget] = useState(null); // key in form, e.g. 'stem'
  const mathFieldRef = useRef(null);
  const textareasRef = useRef({});

  const canMath = useMemo(
    () => new Set(['stem', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation', 'stemEn', 'optionAEn', 'optionBEn', 'optionCEn', 'optionDEn', 'explanationEn']),
    [],
  );

  useEffect(() => {
    api.get('/admin/subjects').then((r) => {
      const list = r.data.data || [];
      setSubjects(list);
      if (list.length) {
        const sid = String(list[0].id);
        setForm((p) => ({ ...p, subjectId: sid }));
        api.get(`/admin/subjects/${sid}/subcategories`).then((res) => {
          setSubcats(Array.isArray(res.data?.data) ? res.data.data : []);
        }).catch(() => setSubcats([]));
      }
    });
  }, []);

  useEffect(() => {
    if (!mathOpen) return;
    const el = mathFieldRef.current;
    if (!el) return;
    try {
      el.setOptions?.({ virtualKeyboardMode: 'onfocus', virtualKeyboards: 'all' });
      setTimeout(() => {
        try {
          el.focus?.();
          el.executeCommand?.('showVirtualKeyboard');
        } catch {
          /* ignore */
        }
      }, 0);
    } catch {
      /* ignore */
    }
  }, [mathOpen]);

  function openMath(key) {
    if (!canMath.has(key)) return;
    setMathTarget(key);
    setMathMode('block');
    setMathOpen(true);
  }

  function closeMath() {
    setMathOpen(false);
    setTimeout(() => {
      const ta = textareasRef.current?.[mathTarget];
      ta?.focus?.();
    }, 0);
  }

  function applyMath() {
    const el = mathFieldRef.current;
    const ta = textareasRef.current?.[mathTarget];
    if (!el || !ta || !mathTarget) return;
    const latex = String(el.getValue?.('latex') ?? el.value ?? '').trim();
    if (!latex) return;
    const wrapped = mathMode === 'inline' ? `$${latex}$` : `$$${latex}$$`;
    const ins = insertAtSelection(ta, wrapped);
    if (!ins) return;
    setForm((p) => ({ ...p, [mathTarget]: ins.next }));
    setMathOpen(false);
    setTimeout(() => {
      ta.focus?.();
      ta.setSelectionRange?.(ins.nextPos, ins.nextPos);
    }, 0);
  }

  function onSubjectChange(sid) {
    setForm((p) => ({ ...p, subjectId: sid, subCategoryId: '' }));
    if (!sid) { setSubcats([]); return; }
    api.get(`/admin/subjects/${sid}/subcategories`).then((res) => {
      setSubcats(Array.isArray(res.data?.data) ? res.data.data : []);
    }).catch(() => setSubcats([]));
  }

  async function handleUpload(file, kind) {
    const setBusy = kind === 'image' ? setImageBusy : kind === 'video' ? setVideoBusy : setPdfBusy;
    setBusy(true);
    try {
      const url = await uploadAdminFile(file);
      if (kind === 'image') setForm((p) => ({ ...p, imageUrl: url }));
      else if (kind === 'video') setForm((p) => ({ ...p, videoUrl: url }));
      else setForm((p) => ({ ...p, pdfUrl: url }));
    } catch { window.alert(t('questions.uploadFailed')); }
    finally { setBusy(false); }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.subjectId) { setError(t('questions.pickSubject')); return; }
    setBusy(true);
    try {
      await api.post('/admin/questions', buildPayload(form));
      navigate('/questions');
    } catch (err) {
      setError(err.response?.data?.message || t('questions.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  const src = mediaSrc(form.imageUrl);

  return (
    <FormPage title={t('questions.addTitle')} backTo="/questions" maxWidth="max-w-4xl">
      <form onSubmit={submit} className="space-y-5">
        {/* صورة السؤال */}
        <div className="border-b border-[var(--app-border)] pb-4">
          <p className="mb-3 text-sm font-bold text-[var(--app-muted)]">{t('questions.questionImage')}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
              {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">—</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUpload(f, 'image'); }} />
              <Button type="button" variant="secondary" disabled={imageBusy} onClick={() => imageRef.current?.click()}>{t('subjects.chooseImage')}</Button>
              {form.imageUrl && <Button type="button" variant="secondary" disabled={imageBusy} onClick={() => { setForm((p) => ({ ...p, imageUrl: '' })); if (imageRef.current) imageRef.current.value = ''; }}>{t('subjects.removeImage')}</Button>}
            </div>
          </div>
        </div>

        {/* المادة والسب كاتيجوري والصعوبة */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('questions.subject')}</label>
            <select className={selectClass} value={form.subjectId} onChange={(e) => onSubjectChange(e.target.value)} required>
              <option value="" disabled>—</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('subcategories.title') || 'Subcategory'}</label>
            <select className={selectClass} value={form.subCategoryId} onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })} disabled={!subcats.length}>
              <option value="">{t('questions.none') || '—'}</option>
              {subcats.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
            </select>
          </div>
          <Input label={t('questions.difficulty')} type="number" min={1} max={4} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} required />
        </div>
        <Input label={t('questions.sortOrder')} type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />

        {/* قسم عربي */}
        <p className="text-sm font-black text-[var(--app-accent)]">{t('questions.sectionAr')}</p>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-bold text-[var(--app-muted)]">{t('questions.stem')}</label>
            <button type="button" onClick={() => openMath('stem')} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 text-xs font-black text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]">
              <span className="text-base leading-none">∑</span>
              <span>لوحة المعادلات</span>
            </button>
          </div>
          <textarea ref={(el) => { if (el) textareasRef.current.stem = el; }} className={textareaClass} rows={3} value={form.stem} onChange={(e) => setForm({ ...form, stem: e.target.value })} required />
        </div>
        {['optionA', 'optionB', 'optionC', 'optionD'].map((key) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-bold text-[var(--app-muted)]">{t(`questions.${key}`)}</label>
              <button type="button" onClick={() => openMath(key)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 text-xs font-black text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]">
                <span className="text-base leading-none">∑</span>
                <span>لوحة المعادلات</span>
              </button>
            </div>
            <textarea ref={(el) => { if (el) textareasRef.current[key] = el; }} className={textareaClass} rows={2} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
          </div>
        ))}

        {/* قسم إنجليزي */}
        <p className="text-sm font-black text-[var(--app-accent)]">{t('questions.sectionEn')}</p>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-bold text-[var(--app-muted)]">{t('questions.stemEn')}</label>
            <button type="button" onClick={() => openMath('stemEn')} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 text-xs font-black text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]">
              <span className="text-base leading-none">∑</span>
              <span>Math keyboard</span>
            </button>
          </div>
          <textarea ref={(el) => { if (el) textareasRef.current.stemEn = el; }} className={textareaClass} rows={3} value={form.stemEn} onChange={(e) => setForm({ ...form, stemEn: e.target.value })} />
        </div>
        {[['optionA', 'optionAEn'], ['optionB', 'optionBEn'], ['optionC', 'optionCEn'], ['optionD', 'optionDEn']].map(([arKey, enKey]) => (
          <div key={enKey}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-sm font-bold text-[var(--app-muted)]">{t(`questions.${arKey}`)} ({t('questions.english')})</label>
              <button type="button" onClick={() => openMath(enKey)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 text-xs font-black text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]">
                <span className="text-base leading-none">∑</span>
                <span>Math keyboard</span>
              </button>
            </div>
            <textarea ref={(el) => { if (el) textareasRef.current[enKey] = el; }} className={textareaClass} rows={2} value={form[enKey]} onChange={(e) => setForm({ ...form, [enKey]: e.target.value })} />
          </div>
        ))}

        {/* الإجابة الصحيحة */}
        <div>
          <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">{t('questions.correctAnswer')}</p>
          <div className="flex flex-wrap gap-4">
            {[0, 1, 2, 3].map((i) => (
              <label key={i} className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input type="radio" name="correct-create" checked={Number(form.correctIndex) === i} onChange={() => setForm({ ...form, correctIndex: i })} />
                {t(`questions.optionLabel${i}`)}
              </label>
            ))}
          </div>
        </div>

        {/* الشرح */}
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-bold text-[var(--app-muted)]">{t('questions.explanation')}</label>
            <button type="button" onClick={() => openMath('explanation')} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 text-xs font-black text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]">
              <span className="text-base leading-none">∑</span>
              <span>لوحة المعادلات</span>
            </button>
          </div>
          <textarea ref={(el) => { if (el) textareasRef.current.explanation = el; }} className={textareaClass} rows={3} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-bold text-[var(--app-muted)]">{t('questions.explanationEn')}</label>
            <button type="button" onClick={() => openMath('explanationEn')} className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-1.5 text-xs font-black text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]">
              <span className="text-base leading-none">∑</span>
              <span>Math keyboard</span>
            </button>
          </div>
          <textarea ref={(el) => { if (el) textareasRef.current.explanationEn = el; }} className={textareaClass} rows={3} value={form.explanationEn} onChange={(e) => setForm({ ...form, explanationEn: e.target.value })} />
        </div>

        {/* فيديو وPDF */}
        <div className="border-t border-[var(--app-border)] pt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">{t('questions.video')}</p>
            <Input label={t('questions.videoUrl')} value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." className="mb-2" />
            <div className="flex flex-wrap gap-2">
              <input ref={videoRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUpload(f, 'video'); }} />
              <Button type="button" variant="secondary" disabled={videoBusy} onClick={() => videoRef.current?.click()}>{t('questions.uploadVideo')}</Button>
              {form.videoUrl && <Button type="button" variant="secondary" disabled={videoBusy} onClick={() => { setForm((p) => ({ ...p, videoUrl: '' })); if (videoRef.current) videoRef.current.value = ''; }}>{t('questions.removeVideo')}</Button>}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">{t('questions.pdfOptional')}</p>
            <Input label={t('questions.pdfUrl')} value={form.pdfUrl} onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })} placeholder="https://..." className="mb-2" />
            <div className="flex flex-wrap gap-2">
              <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUpload(f, 'pdf'); }} />
              <Button type="button" variant="secondary" disabled={pdfBusy} onClick={() => pdfRef.current?.click()}>{t('questions.uploadPdf')}</Button>
              {form.pdfUrl && <Button type="button" variant="secondary" disabled={pdfBusy} onClick={() => { setForm((p) => ({ ...p, pdfUrl: '' })); if (pdfRef.current) pdfRef.current.value = ''; }}>{t('questions.removePdf')}</Button>}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
          <input type="checkbox" checked={form.includeInExam} onChange={(e) => setForm({ ...form, includeInExam: e.target.checked })} />
          {t('questions.includeInExam')}
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          {t('questions.published')}
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/questions')} disabled={busy}>{t('subjects.cancel')}</Button>
          <Button type="submit" disabled={busy}>{busy ? '…' : t('questions.add')}</Button>
        </div>
      </form>

      {mathOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto p-4 pb-[320px] pointer-events-none"
          dir="rtl"
        >
          {/* Backdrop is visual-only (don't close on click), because MathLive keyboard is rendered outside this modal. */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden="true" />
          <div className="relative mt-8 w-full max-w-2xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 shadow-2xl pointer-events-auto">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-black text-[var(--app-card-fg)]">لوحة المعادلات</div>
                <div className="text-xs font-bold text-[var(--app-muted)]">اكتب المعادلة ثم اضغط إدراج</div>
              </div>
              <Button type="button" variant="secondary" onClick={closeMath}>×</Button>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-black text-[var(--app-muted)]">الوضع:</span>
              <button type="button" onClick={() => setMathMode('inline')} className={`rounded-lg border px-3 py-1.5 text-xs font-black ${mathMode === 'inline' ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-fg)]' : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]'}`}>
                Inline ($...$)
              </button>
              <button type="button" onClick={() => setMathMode('block')} className={`rounded-lg border px-3 py-1.5 text-xs font-black ${mathMode === 'block' ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-[var(--app-accent-fg)]' : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-card-fg)] hover:bg-[var(--app-row-hover)]'}`}>
                Block ($$...$$)
              </button>
            </div>

            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-row-hover)] p-3">
              <math-field
                ref={mathFieldRef}
                class="w-full"
                style={{
                  width: '100%',
                  minHeight: '56px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--app-border)',
                  background: 'var(--app-card)',
                  color: 'var(--app-card-fg)',
                  fontSize: '22px',
                }}
              >
                x=
              </math-field>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={closeMath}>إلغاء</Button>
              <Button type="button" onClick={applyMath}>إدراج</Button>
            </div>
          </div>
        </div>
      )}
    </FormPage>
  );
}
