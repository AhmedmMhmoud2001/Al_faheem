import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Shield, Trash2, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, getAccessToken, publicBase } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

function jwtSub(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return json.sub || null;
  } catch {
    return null;
  }
}

function avatarSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${publicBase}${url}`;
}

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

const iconBtnAccent =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const limit = 15;

  const currentUserId = jwtSub(getAccessToken());

  const load = useCallback(async () => {
    const params = { page, limit };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    const { data } = await api.get('/admin/users', { params });
    setRows(data.data);
    setTotal(data.meta.total);
  }, [page, limit, search, roleFilter]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  function applySearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function onRoleFilterChange(e) {
    setRoleFilter(e.target.value);
    setPage(1);
  }

  async function removeUser(u) {
    if (!window.confirm(t('users.confirmDelete'))) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || t('users.deleteFailed');
      window.alert(msg);
    }
  }

  async function setRole(id, role) {
    await api.patch(`/admin/users/${id}/role`, { role });
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const selectClass =
    'rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('users.title')}</h1>
        <Button type="button" onClick={() => navigate('/users/create')}>
          {t('users.openAddModal')}
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form onSubmit={applySearch} className="flex w-full min-w-0 max-w-xl flex-1 items-stretch gap-2">
          <Input
            className="min-w-0 flex-1"
            placeholder={t('users.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary" className="shrink-0 self-stretch px-4">
            {t('users.search')}
          </Button>
        </form>
        <div className="w-full min-w-[11rem] max-w-xs sm:w-auto">
          <select className={`w-full ${selectClass}`} value={roleFilter} onChange={onRoleFilterChange}>
            <option value="">{t('users.roleAll')}</option>
            <option value="USER">USER</option>
            <option value="STAFF">STAFF</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th className="w-14">{t('users.avatar')}</Th>
              <Th>{t('users.email')}</Th>
              <Th>{t('users.name')}</Th>
              <Th>{t('users.phone')}</Th>
              <Th>{t('users.role')}</Th>
              <Th>{t('users.status')}</Th>
              <Th className="min-w-[9rem] whitespace-nowrap">{t('users.actions')}</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map((u) => {
              const src = avatarSrc(u.avatarUrl);
              return (
                <Tr key={u.id}>
                  <Td>
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--app-border)]"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-row-hover)] text-sm font-black text-[var(--app-muted)]">
                        {(u.fullName || u.email || '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </Td>
                  <Td className="font-bold">{u.email}</Td>
                  <Td>{u.fullName}</Td>
                  <Td className="text-[var(--app-muted)]">{u.phone || '—'}</Td>
                  <Td>
                    <span className="font-bold">{u.role}</span>
                    {u.role === 'STAFF' && u.staffRole && (
                      <span className="ms-1 text-xs text-[var(--app-muted)]">({u.staffRole.name})</span>
                    )}
                  </Td>
                  <Td>{u.isActive ? t('users.active') : t('users.inactive')}</Td>
                  <Td className="whitespace-nowrap">
                    <div className="inline-flex flex-nowrap items-center gap-0.5">
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('users.iconView')}
                        aria-label={t('users.iconView')}
                        onClick={() => navigate(`/users/${u.id}`)}
                      >
                        <Eye className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('users.iconEdit')}
                        aria-label={t('users.iconEdit')}
                        onClick={() => navigate(`/users/${u.id}/edit`)}
                      >
                        <Pencil className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          className={iconBtnDanger}
                          title={t('users.iconDelete')}
                          aria-label={t('users.iconDelete')}
                          onClick={() => removeUser(u)}
                        >
                          <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                        </button>
                      )}
                      {u.id !== currentUserId &&
                        (u.role === 'ADMIN' ? (
                          <button
                            type="button"
                            className={iconBtn}
                            title={t('users.iconMakeUser')}
                            aria-label={t('users.iconMakeUser')}
                            onClick={() => setRole(u.id, 'USER')}
                          >
                            <UserRound className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={iconBtnAccent}
                            title={t('users.iconMakeAdmin')}
                            aria-label={t('users.iconMakeAdmin')}
                            onClick={() => setRole(u.id, 'ADMIN')}
                          >
                            <Shield className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                          </button>
                        ))}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </TableWrap>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant="secondary"
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t('actions.prev')}
        </Button>
        <span className="flex items-center py-2 text-sm font-bold text-[var(--app-muted)]">
          {t('pagination.pageOf', { page, total: totalPages })}
        </span>
        <Button
          variant="secondary"
          type="button"
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
}
