import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, publicBase } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';

function avatarSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${publicBase}${url}`;
}

export default function UserDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fmtDate = useCallback((d) => {
    if (!d) return '—';
    const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-GB';
    try { return new Date(d).toLocaleString(locale); } catch { return String(d); }
  }, [i18n.language]);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 font-bold text-[var(--app-muted)]">{t('users.loadingDetails')}</p>;
  if (!user) return <p className="p-6 font-bold text-red-600">{t('users.loadDetailsFailed')}</p>;

  const src = avatarSrc(user.avatarUrl);
  const rows = [
    [t('users.detailId'), <span className="font-mono text-xs">{user.id}</span>],
    [t('users.email'), user.email],
    [t('users.name'), user.fullName],
    [t('users.phone'), user.phone || '—'],
    [t('users.role'), user.role],
    [t('users.status'), user.isActive ? t('users.active') : t('users.inactive')],
    [t('users.detailEmailVerified'), user.emailVerified ? t('users.yes') : t('users.no')],
    [t('users.detailTrial'), fmtDate(user.trialEndsAt)],
    [t('users.detailCreated'), fmtDate(user.createdAt)],
    [t('users.detailUpdated'), fmtDate(user.updatedAt)],
  ];

  return (
    <FormPage title={t('users.detailsTitle')} backTo="/users" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex justify-center">
          {src
            ? <img src={src} alt="" className="h-24 w-24 rounded-full object-cover ring-2 ring-[var(--app-border)]" />
            : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--app-row-hover)] text-2xl font-black text-[var(--app-muted)]">{(user.fullName || user.email || '?').slice(0, 1).toUpperCase()}</div>}
        </div>

        <dl className="divide-y divide-[var(--app-border)]">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2">
              <dt className="shrink-0 text-sm font-bold text-[var(--app-muted)]">{label}</dt>
              <dd className="text-end text-sm font-bold text-[var(--app-fg)]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>{t('actions.back') ?? 'رجوع'}</Button>
          <Button type="button" onClick={() => navigate(`/users/${id}/edit`)}>{t('users.iconEdit')}</Button>
        </div>
      </div>
    </FormPage>
  );
}
