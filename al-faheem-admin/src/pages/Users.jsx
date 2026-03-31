import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Shield, Trash2, UserRound } from 'lucide-react';
import { api, getAccessToken, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
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

const emptyCreateForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'USER',
  isActive: true,
};

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

const iconBtnAccent =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function Users() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const limit = 15;

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createAvatarFile, setCreateAvatarFile] = useState(null);
  const [createAvatarPreview, setCreateAvatarPreview] = useState(null);
  const createFileInputRef = useRef(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    isActive: true,
    password: '',
    role: 'USER',
  });
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [editRemoveAvatar, setEditRemoveAvatar] = useState(false);
  const editFileInputRef = useRef(null);

  const currentUserId = jwtSub(getAccessToken());

  const fmtDate = useCallback(
    (d) => {
      if (!d) return '—';
      const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-GB';
      try {
        return new Date(d).toLocaleString(locale);
      } catch {
        return String(d);
      }
    },
    [i18n.language],
  );

  const resetCreateModal = useCallback(() => {
    if (createAvatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(createAvatarPreview);
    }
    setCreateForm(emptyCreateForm);
    setCreateAvatarFile(null);
    setCreateAvatarPreview(null);
    if (createFileInputRef.current) createFileInputRef.current.value = '';
  }, [createAvatarPreview]);

  const resetEditModal = useCallback(() => {
    if (editAvatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(editAvatarPreview);
    }
    setEditing(null);
    setEditAvatarFile(null);
    setEditAvatarPreview(null);
    setEditRemoveAvatar(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  }, [editAvatarPreview]);

  useEffect(() => {
    return () => {
      if (createAvatarPreview?.startsWith('blob:')) URL.revokeObjectURL(createAvatarPreview);
      if (editAvatarPreview?.startsWith('blob:')) URL.revokeObjectURL(editAvatarPreview);
    };
  }, [createAvatarPreview, editAvatarPreview]);

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

  async function openDetails(u) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const { data } = await api.get(`/admin/users/${u.id}`);
      setDetailUser(data);
    } catch {
      setDetailUser(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetails() {
    setDetailOpen(false);
    setDetailUser(null);
  }

  function onCreateAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (createAvatarPreview?.startsWith('blob:')) URL.revokeObjectURL(createAvatarPreview);
    setCreateAvatarFile(file);
    setCreateAvatarPreview(URL.createObjectURL(file));
  }

  function onEditAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditRemoveAvatar(false);
    if (editAvatarPreview?.startsWith('blob:')) URL.revokeObjectURL(editAvatarPreview);
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  }

  async function createUser(e) {
    e.preventDefault();
    let avatarUrl = null;
    if (createAvatarFile) {
      try {
        avatarUrl = await uploadAdminFile(createAvatarFile);
      } catch {
        window.alert(t('users.avatarUploadFailed'));
        return;
      }
    }
    await api.post('/admin/users', {
      email: createForm.email.trim(),
      password: createForm.password,
      fullName: createForm.fullName.trim(),
      phone: createForm.phone.trim() || null,
      role: createForm.role,
      isActive: createForm.isActive,
      avatarUrl,
    });
    resetCreateModal();
    setCreateOpen(false);
    load();
  }

  function openEdit(u) {
    setEditing(u);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone ?? '',
      isActive: u.isActive,
      password: '',
      role: u.role,
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(u.avatarUrl ? avatarSrc(u.avatarUrl) : null);
    setEditRemoveAvatar(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    const body = {
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || null,
      isActive: editForm.isActive,
    };
    if (editForm.password.trim()) {
      body.password = editForm.password;
    }
    if (editAvatarFile) {
      try {
        body.avatarUrl = await uploadAdminFile(editAvatarFile);
      } catch {
        window.alert(t('users.avatarUploadFailed'));
        return;
      }
    } else if (editRemoveAvatar) {
      body.avatarUrl = null;
    }
    await api.patch(`/admin/users/${editing.id}`, body);
    if (editForm.role !== editing.role && editing.id !== currentUserId) {
      await api.patch(`/admin/users/${editing.id}/role`, { role: editForm.role });
    }
    setEditOpen(false);
    resetEditModal();
    load();
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
        <Button type="button" onClick={() => setCreateOpen(true)}>
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
                  <Td>{u.role}</Td>
                  <Td>{u.isActive ? t('users.active') : t('users.inactive')}</Td>
                  <Td className="whitespace-nowrap">
                    <div className="inline-flex flex-nowrap items-center gap-0.5">
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('users.iconView')}
                        aria-label={t('users.iconView')}
                        onClick={() => openDetails(u)}
                      >
                        <Eye className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('users.iconEdit')}
                        aria-label={t('users.iconEdit')}
                        onClick={() => openEdit(u)}
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

      <Modal open={detailOpen} onClose={closeDetails} title={t('users.detailsTitle')} className="max-w-md">
        {detailLoading && (
          <p className="text-sm font-bold text-[var(--app-muted)]">{t('users.loadingDetails')}</p>
        )}
        {!detailLoading && detailUser && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-center">
              {avatarSrc(detailUser.avatarUrl) ? (
                <img
                  src={avatarSrc(detailUser.avatarUrl)}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-[var(--app-border)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--app-row-hover)] text-xl font-black text-[var(--app-muted)]">
                  {(detailUser.fullName || detailUser.email || '?').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <dl className="space-y-2">
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.detailId')}</dt>
                <dd className="max-w-[60%] truncate font-mono text-xs text-[var(--app-fg)]">{detailUser.id}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.email')}</dt>
                <dd className="text-end font-bold text-[var(--app-fg)]">{detailUser.email}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.name')}</dt>
                <dd className="text-end text-[var(--app-fg)]">{detailUser.fullName}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.phone')}</dt>
                <dd className="text-[var(--app-fg)]">{detailUser.phone || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.role')}</dt>
                <dd className="text-[var(--app-fg)]">{detailUser.role}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.status')}</dt>
                <dd className="text-[var(--app-fg)]">
                  {detailUser.isActive ? t('users.active') : t('users.inactive')}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.detailEmailVerified')}</dt>
                <dd className="text-[var(--app-fg)]">{detailUser.emailVerified ? t('users.yes') : t('users.no')}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.detailTrial')}</dt>
                <dd className="text-end text-[var(--app-fg)]">{fmtDate(detailUser.trialEndsAt)}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-[var(--app-border)] py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.detailCreated')}</dt>
                <dd className="text-end text-xs text-[var(--app-fg)]">{fmtDate(detailUser.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-2 py-1">
                <dt className="font-bold text-[var(--app-muted)]">{t('users.detailUpdated')}</dt>
                <dd className="text-end text-xs text-[var(--app-fg)]">{fmtDate(detailUser.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        )}
        {!detailLoading && !detailUser && detailOpen && (
          <p className="text-sm font-bold text-red-600 dark:text-red-400">{t('users.loadDetailsFailed')}</p>
        )}
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetCreateModal();
        }}
        title={t('users.addUserModalTitle')}
        className="max-w-2xl"
      >
        <form onSubmit={createUser} className="space-y-4">
          <div className="flex flex-col items-center gap-2 border-b border-[var(--app-border)] pb-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
              {createAvatarPreview ? (
                <img src={createAvatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">
                  {t('users.noAvatar')}
                </div>
              )}
            </div>
            <input
              ref={createFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onCreateAvatarChange}
            />
            <Button type="button" variant="secondary" onClick={() => createFileInputRef.current?.click()}>
              {t('users.chooseAvatar')}
            </Button>
            <p className="text-center text-xs text-[var(--app-muted)]">{t('users.avatarHint')}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="email"
              required
              label={t('users.email')}
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <Input
              type="password"
              required
              autoComplete="new-password"
              label={t('users.password')}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <Input
              required
              label={t('users.name')}
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            />
            <Input
              label={t('users.phone')}
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('users.role')}</label>
              <select
                className={`w-full ${selectClass}`}
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <label className="flex min-h-[2.75rem] items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
              />
              {t('users.active')}
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                resetCreateModal();
              }}
            >
              {t('users.cancel')}
            </Button>
            <Button type="submit">{t('actions.add')}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          resetEditModal();
        }}
        title={t('users.editUser')}
        className="max-w-2xl"
      >
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="flex flex-col items-center gap-2 border-b border-[var(--app-border)] pb-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
                {editAvatarPreview ? (
                  <img src={editAvatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">
                    {t('users.noAvatar')}
                  </div>
                )}
              </div>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onEditAvatarChange}
              />
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" variant="secondary" onClick={() => editFileInputRef.current?.click()}>
                  {t('users.changeAvatar')}
                </Button>
                {editing.avatarUrl && !editAvatarFile && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditRemoveAvatar(true);
                      setEditAvatarFile(null);
                      if (editAvatarPreview?.startsWith('blob:')) URL.revokeObjectURL(editAvatarPreview);
                      setEditAvatarPreview(null);
                      if (editFileInputRef.current) editFileInputRef.current.value = '';
                    }}
                  >
                    {t('users.removeAvatar')}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label={t('users.name')}
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
              />
              <Input
                type="email"
                label={t('users.email')}
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
              <Input
                label={t('users.phone')}
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <Input
                type="password"
                autoComplete="new-password"
                label={t('users.newPasswordOptional')}
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('users.role')}</label>
                <select
                  className={`w-full ${selectClass}`}
                  value={editForm.role}
                  disabled={editing.id === currentUserId}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <label className="flex min-h-[2.75rem] items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                />
                {t('users.active')}
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditOpen(false);
                  resetEditModal();
                }}
              >
                {t('users.cancel')}
              </Button>
              <Button type="submit">{t('users.save')}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
