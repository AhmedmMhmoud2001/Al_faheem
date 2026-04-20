import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

export default function QuestionsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [subCategoryId, setSubCategoryId] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const didInitFromUrl = useRef(false);

  useEffect(() => {
    api.get('/admin/subjects').then((r) => setSubjects(r.data.data)).catch(() => {});
  }, []);

  // Initialize filters from URL query (?subjectId=&subCategoryId=&difficulty=)
  useEffect(() => {
    if (didInitFromUrl.current) return;
    const sp = new URLSearchParams(location.search || '');
    const sid = sp.get('subjectId') || '';
    const scid = sp.get('subCategoryId') || '';
    const diff = sp.get('difficulty') || '';
    if (sid) setSubjectId(sid);
    if (diff) setDifficultyFilter(diff);
    if (scid) setSubCategoryId(scid);
    if (sid || scid || diff) setPage(1);
    didInitFromUrl.current = true;
  }, [location.search]);

  // Load subcategories when subject changes
  useEffect(() => {
    setSubCategoryId('');
    setSubcategories([]);
    if (!subjectId) return;
    api
      .get('/admin/subcategories', { params: { subjectId } })
      .then((r) => setSubcategories(r.data.data || []))
      .catch(() => setSubcategories([]));
  }, [subjectId]);

  const load = useCallback(async () => {
    const params = { page, limit };
    if (subjectId) params.subjectId = subjectId;
    if (subCategoryId) params.subCategoryId = subCategoryId;
    if (difficultyFilter) params.difficulty = difficultyFilter;
    if (publishedFilter === 'true' || publishedFilter === 'false') params.isPublished = publishedFilter;
    if (examFilter === 'true' || examFilter === 'false') params.includeInExam = examFilter;
    const { data } = await api.get('/admin/questions', { params });
    setRows(data.data);
    setTotal(data.meta.total);
  }, [page, limit, subjectId, subCategoryId, difficultyFilter, publishedFilter, examFilter]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

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
        <Button type="button" onClick={() => navigate('/questions/create')}>
          {t('questions.openAdd')}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={subjectId}
          onChange={(e) => { setPage(1); setSubjectId(e.target.value); }}
        >
          <option value="">{t('questions.allSubjects')}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.nameAr}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={subCategoryId}
          onChange={(e) => { setPage(1); setSubCategoryId(e.target.value); }}
          disabled={!subjectId}
        >
          <option value="">{t('subcategories.title') /* reuse label */}</option>
          {subcategories.map((sc) => (
            <option key={sc.id} value={sc.id}>{sc.nameAr}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={difficultyFilter}
          onChange={(e) => { setPage(1); setDifficultyFilter(e.target.value); }}
        >
          <option value="">{t('questions.allDifficulties')}</option>
          {[1, 2, 3, 4].map((d) => (
            <option key={d} value={d}>{t('questions.difficulty')} {d}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={publishedFilter}
          onChange={(e) => { setPage(1); setPublishedFilter(e.target.value); }}
        >
          <option value="">{t('questions.allStatuses')}</option>
          <option value="true">{t('questions.published')}</option>
          <option value="false">{t('questions.draft')}</option>
        </select>
        <select
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          value={examFilter}
          onChange={(e) => { setPage(1); setExamFilter(e.target.value); }}
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
                      onClick={() => navigate(`/questions/${q.id}/edit`)}
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
    </div>
  );
}
