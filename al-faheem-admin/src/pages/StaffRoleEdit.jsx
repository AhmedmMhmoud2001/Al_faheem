import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';
import Input from '../components/ui/Input.jsx';

const ALL_PERMISSIONS = [
  { key: 'questions:read',        labelAr: 'قراءة الأسئلة',               group: 'الأسئلة' },
  { key: 'questions:write',       labelAr: 'إضافة / تعديل الأسئلة',       group: 'الأسئلة' },
  { key: 'questions:delete',      labelAr: 'حذف الأسئلة',                  group: 'الأسئلة' },
  { key: 'subjects:read',         labelAr: 'قراءة المواد',                  group: 'المواد' },
  { key: 'subjects:write',        labelAr: 'إضافة / تعديل المواد',          group: 'المواد' },
  { key: 'subjects:delete',       labelAr: 'حذف المواد',                    group: 'المواد' },
  { key: 'subcategories:read',    labelAr: 'قراءة التصنيفات الفرعية',       group: 'التصنيفات' },
  { key: 'subcategories:write',   labelAr: 'إضافة / تعديل التصنيفات',       group: 'التصنيفات' },
  { key: 'subcategories:delete',  labelAr: 'حذف التصنيفات',                  group: 'التصنيفات' },
];

const GROUPS = [...new Set(ALL_PERMISSIONS.map((p) => p.group))];

export default function StaffRoleEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/staff-roles/${id}`)
      .then(({ data }) => {
        setName(data.name);
        setDescription(data.description ?? '');
        setIsActive(data.isActive);
        setPermissions(data.permissions ?? []);
      })
      .catch(() => setError(t('staffRoles.loadFailed')))
      .finally(() => setLoading(false));
  }, [id, t]);

  function togglePerm(key) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  }

  function toggleGroup(group) {
    const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group).map((p) => p.key);
    const allChecked = groupPerms.every((k) => permissions.includes(k));
    if (allChecked) {
      setPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)));
    } else {
      setPermissions((prev) => [...new Set([...prev, ...groupPerms])]);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.patch(`/admin/staff-roles/${id}`, {
        name: name.trim(),
        description: description.trim() || null,
        isActive,
        permissions,
      });
      navigate('/staff-roles');
    } catch (err) {
      setError(err.response?.data?.message || t('staffRoles.saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="p-6 font-bold text-[var(--app-muted)]">{t('staffRoles.loading')}</p>;

  return (
    <FormPage title={t('staffRoles.editTitle')} backTo="/staff-roles">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              required
              label={t('staffRoles.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold text-[var(--app-muted)]">
              {t('staffRoles.description')}
            </label>
            <textarea
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 text-sm font-medium text-[var(--app-card-fg)] placeholder-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-fg)]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {t('staffRoles.active')}
          </label>
        </div>

        {/* Permissions */}
        <div>
          <p className="mb-3 text-sm font-black text-[var(--app-fg)]">{t('staffRoles.permissionsTitle')}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {GROUPS.map((group) => {
              const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group);
              const allChecked = groupPerms.every((p) => permissions.includes(p.key));
              const someChecked = groupPerms.some((p) => permissions.includes(p.key));
              return (
                <div
                  key={group}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4"
                >
                  <label className="mb-3 flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={() => toggleGroup(group)}
                    />
                    <span className="font-black text-[var(--app-fg)]">{group}</span>
                  </label>
                  <div className="space-y-2">
                    {groupPerms.map((p) => (
                      <label key={p.key} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={permissions.includes(p.key)}
                          onChange={() => togglePerm(p.key)}
                        />
                        <span className="text-[var(--app-fg)]">{p.labelAr}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/staff-roles')} disabled={busy}>
            {t('staffRoles.cancel')}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? '…' : t('staffRoles.save')}
          </Button>
        </div>
      </form>
    </FormPage>
  );
}
