import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, getAccessToken, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

function jwtSub(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))).sub || null;
  } catch { return null; }
}

function avatarSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${publicBase}${url}`;
}

const selectClass =
  'w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

export default function UserEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUserId = jwtSub(getAccessToken());

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', isActive: true, password: '', role: 'USER', staffRoleId: '',
  });
  const [staffRoles, setStaffRoles] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    // Load staff roles for the dropdown
    api.get('/admin/staff-roles').then(({ data }) => setStaffRoles(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/users/${id}`)
      .then(({ data }) => {
        setUser(data);
        setForm({
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          isActive: data.isActive,
          password: '',
          role: data.role,
          staffRoleId: data.staffRoleId ? String(data.staffRoleId) : '',
        });
        setAvatarPreview(data.avatarUrl ? avatarSrc(data.avatarUrl) : null);
      })
      .catch(() => setError(t('users.loadDetailsFailed')))
      .finally(() => setLoading(false));
  }, [id, t]);

  function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemoveAvatar(false);
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        isActive: form.isActive,
      };
      if (form.password.trim()) body.password = form.password;
      if (avatarFile) {
        body.avatarUrl = await uploadAdminFile(avatarFile);
      } else if (removeAvatar) {
        body.avatarUrl = null;
      }
      await api.patch(`/admin/users/${id}`, body);

      // Update role if changed and not editing yourself
      if ((form.role !== user?.role || form.staffRoleId !== String(user?.staffRoleId ?? '')) && id !== currentUserId) {
        const roleBody = { role: form.role };
        if (form.role === 'STAFF') {
          roleBody.staffRoleId = form.staffRoleId ? Number(form.staffRoleId) : null;
        }
        await api.patch(`/admin/users/${id}/role`, roleBody);
      }
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || t('users.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="p-6 font-bold text-[var(--app-muted)]">{t('users.loadingDetails')}</p>;

  return (
    <FormPage title={t('users.editUser')} backTo="/users">
      <form onSubmit={submit} className="space-y-4">
        {/* الصورة */}
        <div className="flex flex-col items-center gap-2 border-b border-[var(--app-border)] pb-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
            {avatarPreview
              ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">{t('users.noAvatar')}</div>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarChange} />
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>{t('users.changeAvatar')}</Button>
            {user?.avatarUrl && !avatarFile && (
              <Button type="button" variant="secondary" onClick={() => {
                setRemoveAvatar(true); setAvatarFile(null);
                if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
                if (fileRef.current) fileRef.current.value = '';
              }}>
                {t('users.removeAvatar')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input required label={t('users.name')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input type="email" required label={t('users.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label={t('users.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input type="password" autoComplete="new-password" label={t('users.newPasswordOptional')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">{t('users.role')}</label>
            <select
              className={selectClass}
              value={form.role}
              disabled={id === currentUserId}
              onChange={(e) => setForm({ ...form, role: e.target.value, staffRoleId: '' })}
            >
              <option value="USER">USER — {t('users.roleUserDesc')}</option>
              <option value="STAFF">STAFF — {t('users.roleStaffDesc')}</option>
              <option value="ADMIN">ADMIN — {t('users.roleAdminDesc')}</option>
            </select>
          </div>
          <label className="flex min-h-[2.75rem] items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            {t('users.active')}
          </label>
        </div>

        {/* Staff role picker — only visible when role === STAFF */}
        {form.role === 'STAFF' && (
          <div className="rounded-xl border border-[var(--app-accent)]/30 bg-[var(--app-accent)]/5 p-4">
            <label className="mb-1 block text-sm font-bold text-[var(--app-fg)]">
              {t('users.staffRole')}
            </label>
            <select
              className={selectClass}
              value={form.staffRoleId}
              disabled={id === currentUserId}
              onChange={(e) => setForm({ ...form, staffRoleId: e.target.value })}
            >
              <option value="">{t('users.staffRoleNone')}</option>
              {staffRoles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--app-muted)]">{t('users.staffRoleHint')}</p>
          </div>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')} disabled={busy}>{t('users.cancel')}</Button>
          <Button type="submit" disabled={busy}>{busy ? '…' : t('users.save')}</Button>
        </div>
      </form>
    </FormPage>
  );
}
