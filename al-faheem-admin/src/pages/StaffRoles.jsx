import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Plus, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';
const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

// Human-readable permission labels (matches actual DB enum values)
const PERM_LABELS = {
  MANAGE_QUESTIONS:   { ar: 'إدارة الأسئلة',            en: 'Manage Questions' },
  MANAGE_SUBJECTS:    { ar: 'إدارة المواد',              en: 'Manage Subjects' },
  MANAGE_USERS:       { ar: 'إدارة المستخدمين',         en: 'Manage Users' },
  MANAGE_STAFF_ROLES: { ar: 'إدارة أدوار الموظفين',     en: 'Manage Staff Roles' },
  VIEW_REPORTS:       { ar: 'عرض التقارير',              en: 'View Reports' },
  MANAGE_PAYMENTS:    { ar: 'إدارة المدفوعات',           en: 'Manage Payments' },
  MANAGE_SETTINGS:    { ar: 'إدارة الإعدادات',           en: 'Manage Settings' },
};

export default function StaffRoles() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRtl = i18n.dir() === 'rtl';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/staff-roles');
      setRows(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  async function remove(id) {
    if (!window.confirm(t('staffRoles.confirmDelete'))) return;
    try {
      await api.delete(`/admin/staff-roles/${id}`);
      load();
    } catch (err) {
      window.alert(err.response?.data?.message || t('staffRoles.deleteFailed'));
    }
  }

  function permLabel(key) {
    const entry = PERM_LABELS[key];
    if (!entry) return key;
    return isRtl ? entry.ar : entry.en;
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
            aria-label={t('nav.overview')}
            title={t('nav.overview')}
          >
            <BackIcon className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('staffRoles.title')}</h1>
            <p className="mt-0.5 text-sm text-[var(--app-muted)]">{t('staffRoles.subtitle')}</p>
          </div>
        </div>
        <Button type="button" onClick={() => navigate('/staff-roles/create')}>
          <Plus className="me-1.5 h-4 w-4" strokeWidth={2.5} />
          {t('staffRoles.add')}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--app-muted)]">{t('staffRoles.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] p-10 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-[var(--app-muted)]" strokeWidth={1.5} />
          <p className="font-bold text-[var(--app-muted)]">{t('staffRoles.empty')}</p>
          <p className="mt-1 text-sm text-[var(--app-muted)]">{t('staffRoles.emptyCta')}</p>
        </div>
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <Tr>
                <Th className="w-12">#</Th>
                <Th>{t('staffRoles.name')}</Th>
                <Th>{t('staffRoles.permissions')}</Th>
                <Th>{t('staffRoles.staffCount')}</Th>
                <Th>{t('staffRoles.status')}</Th>
                <Th className="w-24">{t('staffRoles.actions')}</Th>
              </Tr>
            </THead>
            <TBody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td className="text-[var(--app-muted)]">{r.id}</Td>
                  <Td className="font-bold">{r.name}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.length === 0 ? (
                        <span className="text-xs text-[var(--app-muted)]">—</span>
                      ) : (
                        r.permissions.map((p) => {
                          // API returns { permission: 'MANAGE_QUESTIONS' } objects
                          const key = typeof p === 'object' ? p.permission : p;
                          return (
                            <span
                              key={key}
                              className="rounded-full bg-[var(--app-accent)]/10 px-2 py-0.5 text-xs font-bold text-[var(--app-accent)]"
                            >
                              {permLabel(key)}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </Td>
                  <Td>{r.userCount ?? 0}</Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        r.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-[var(--app-row-hover)] text-[var(--app-muted)]'
                      }`}
                    >
                      {r.isActive ? t('staffRoles.active') : t('staffRoles.inactive')}
                    </span>
                  </Td>
                  <Td>
                    <div className="inline-flex items-center gap-0.5">
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('staffRoles.edit')}
                        onClick={() => navigate(`/staff-roles/${r.id}/edit`)}
                      >
                        <Pencil className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={iconBtnDanger}
                        title={t('staffRoles.delete')}
                        onClick={() => remove(r.id)}
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
      )}
    </div>
  );
}

