import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { Phone, Share2 } from 'lucide-react';

function Textarea({ label, id, value, onChange, rows = 4 }) {
  const tid = id || 'textarea-field';
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={tid} className="mb-1 block text-sm font-bold text-[var(--app-muted)]">
          {label}
        </label>
      )}
      <textarea
        id={tid}
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
      />
    </div>
  );
}

export default function ContactSettings() {
  const { t } = useTranslation();
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    introAr: '',
    introEn: '',
    phone: '',
    email: '',
    facebookUrl: '',
    instagramUrl: '',
    whatsappUrl: '',
    youtubeUrl: '',
  });

  async function load() {
    setLoadError('');
    setLoading(true);
    try {
      const { data } = await api.get('/admin/contact-settings');
      setForm({
        introAr: data.introAr ?? '',
        introEn: data.introEn ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        facebookUrl: data.facebookUrl ?? '',
        instagramUrl: data.instagramUrl ?? '',
        whatsappUrl: data.whatsappUrl ?? '',
        youtubeUrl: data.youtubeUrl ?? '',
      });
    } catch {
      setLoadError(t('contactSettings.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await api.patch('/admin/contact-settings', {
        introAr: form.introAr,
        introEn: form.introEn,
        phone: form.phone,
        email: form.email,
        facebookUrl: form.facebookUrl,
        instagramUrl: form.instagramUrl,
        whatsappUrl: form.whatsappUrl,
        youtubeUrl: form.youtubeUrl,
      });
      await load();
    } catch {
      setSaveError(t('contactSettings.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">
          {t('contactSettings.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-bold text-[var(--app-muted)]">
          {t('contactSettings.subtitle')}
        </p>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-sm font-bold text-[var(--app-muted)]">{t('contactSettings.loading')}</p>
      ) : (
        <Card>
          <CardBody className="p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-black text-[var(--app-fg)]">
                <Share2 className="h-5 w-5 text-[var(--app-accent)]" />
                {t('contactSettings.sectionIntro')}
              </div>
              <Textarea
                id="site-intro-ar"
                label={t('contactSettings.introAr')}
                value={form.introAr}
                onChange={(e) => setForm((f) => ({ ...f, introAr: e.target.value }))}
                rows={5}
              />
              <Textarea
                id="site-intro-en"
                label={t('contactSettings.introEn')}
                value={form.introEn}
                onChange={(e) => setForm((f) => ({ ...f, introEn: e.target.value }))}
                rows={5}
              />

              <div className="flex items-center gap-2 border-t border-[var(--app-border)] pt-6 text-lg font-black text-[var(--app-fg)]">
                <Phone className="h-5 w-5 text-[var(--app-accent)]" />
                {t('contactSettings.sectionContact')}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('contactSettings.phone')}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <Input
                  label={t('contactSettings.email')}
                  type="text"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="border-t border-[var(--app-border)] pt-6">
                <h2 className="mb-4 text-base font-black text-[var(--app-fg)]">
                  {t('contactSettings.sectionSocial')}
                </h2>
                <p className="mb-4 text-xs font-bold text-[var(--app-muted)]">
                  {t('contactSettings.socialHint')}
                </p>
                <div className="grid gap-4">
                  <Input
                    label={t('contactSettings.facebookUrl')}
                    value={form.facebookUrl}
                    onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
                    placeholder="https://"
                  />
                  <Input
                    label={t('contactSettings.instagramUrl')}
                    value={form.instagramUrl}
                    onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
                    placeholder="https://"
                  />
                  <Input
                    label={t('contactSettings.whatsappUrl')}
                    value={form.whatsappUrl}
                    onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))}
                    placeholder="https://wa.me/…"
                  />
                  <Input
                    label={t('contactSettings.youtubeUrl')}
                    value={form.youtubeUrl}
                    onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </div>

              {saveError && (
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{saveError}</p>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? t('contactSettings.saving') : t('contactSettings.save')}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
