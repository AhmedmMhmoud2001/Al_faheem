import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

export default function Subcategories() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const rtl = i18n.dir() === 'rtl';

  const [subjects, setSubjects] = useState([]);
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');

  // ─── حمّل قائمة المواد ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/admin/subjects').then(({ data }) => {
      const list = Array.isArray(data?.data) ? data.data : [];
      setSubjects(list);
      if (list.length && !filterSubjectId) setFilterSubjectId(String(list[0].id));
    });
  }, []); // eslint-disable-line

  // ─── حمّل التصنيفات حسب المادة المختارة ─────────────────────────────────
  const load = async (sid) => {
    if (!sid) return;
    const { data } = await api.get(`/admin/subjects/${sid}/subcategories`);
    setRows(Array.isArray(data?.data) ? data.data : []);
  };

  useEffect(() => {
    load(filterSubjectId).catch(() => {});
  }, [filterSubjectId]); // eslint-disable-line

  // ─── فلترة محلية ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.slug).toLowerCase().includes(q) ||
        String(r.nameAr).toLowerCase().includes(q) ||
        String(r.nameEn || '').toLowerCase().includes(q),
    );
  }, [rows, filter]);

  // ─── حذف تصنيف فرعي ─────────────────────────────────────────────────────
  async function remove(row) {
    if (!window.confirm(rtl ? 'حذف هذا التصنيف الفرعي؟' : 'Delete this subcategory?')) return;
    try {
      await api.delete(`/admin/subcategories/${row.id}`);
      await load(filterSubjectId);
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 409
          ? (rtl ? 'لا يمكن الحذف: التصنيف مرتبط بأسئلة' : 'Cannot delete: subcategory has questions')
          : err.response?.data?.message || (rtl ? 'تعذر الحذف' : 'Delete failed');
      window.alert(msg);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* أيقونات الأزرار */}
      {/* NOTE: نستخدم نفس نمط الأيقونات المستخدم في بقية الصفحات للتناسق */}
      {/* small helpers */}
      {null}
      {/* ── رأس الصفحة ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">
          {rtl ? 'التصنيفات الفرعية' : 'Subcategories'}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
            placeholder={rtl ? 'بحث…' : 'Filter…'}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr} ({s.slug})
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={() => navigate('/subcategories/create')}
          >
            {rtl ? 'إضافة تصنيف' : 'Add subcategory'}
          </Button>
        </div>
      </div>

      {/* ── الجدول ── */}
      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th className="w-20">ID</Th>
              <Th>Slug</Th>
              <Th>{rtl ? 'الاسم (عربي)' : 'Name (AR)'}</Th>
              <Th>{rtl ? 'الاسم (إنجليزي)' : 'Name (EN)'}</Th>
              <Th>{rtl ? 'الترتيب' : 'Sort'}</Th>
              <Th>{rtl ? 'الحالة' : 'Status'}</Th>
              <Th className="min-w-[5rem]">{rtl ? 'إجراءات' : 'Actions'}</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.length === 0 && (
              <Tr>
                <Td colSpan={7} className="py-8 text-center text-sm text-[var(--app-muted)]">
                  {rtl ? 'لا توجد تصنيفات فرعية لهذه المادة' : 'No subcategories for this subject'}
                </Td>
              </Tr>
            )}
            {filtered.map((r) => (
              <Tr key={r.id}>
                <Td className="font-mono text-xs text-[var(--app-muted)]">{r.id}</Td>
                <Td className="font-bold">{r.slug}</Td>
                <Td>{r.nameAr}</Td>
                <Td className="text-[var(--app-muted)]">{r.nameEn || '—'}</Td>
                <Td>{r.sortOrder ?? 0}</Td>
                <Td>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {r.isActive ? (rtl ? 'نشط' : 'Active') : (rtl ? 'موقوف' : 'Inactive')}
                  </span>
                </Td>
                <Td className="whitespace-nowrap">
                  <div className="inline-flex flex-nowrap items-center gap-1">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
                      title={rtl ? 'تعديل' : 'Edit'}
                      aria-label={rtl ? 'تعديل' : 'Edit'}
                      onClick={() => navigate(`/subcategories/${r.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      title={rtl ? 'حذف' : 'Delete'}
                      aria-label={rtl ? 'حذف' : 'Delete'}
                      onClick={() => remove(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>
    </div>
  );
}
