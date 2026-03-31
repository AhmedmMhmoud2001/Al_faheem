import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { Clapperboard, ImageIcon } from 'lucide-react';

function mediaSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const p = url.startsWith('/') ? url : `/${url}`;
  return `${publicBase}${p}`;
}

function Textarea({ label, id, value, onChange, rows = 4, dir }) {
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
        dir={dir}
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-bold text-[var(--app-card-fg)] placeholder:text-[var(--app-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
      />
    </div>
  );
}

const emptyVideo = {
  titleAr: '',
  titleEn: '',
  bodyAr: '',
  bodyEn: '',
  thumbUrl: '',
  videoUrl: '',
};

export default function AboutSettings() {
  const { t } = useTranslation();
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    badgeAr: '',
    badgeEn: '',
    titleAr: '',
    titleEn: '',
    bodyAr: '',
    bodyEn: '',
    imageUrl: '',
  });

  const [videoSaveError, setVideoSaveError] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoThumbBusy, setVideoThumbBusy] = useState(false);
  const videoThumbRef = useRef(null);
  const [videoForm, setVideoForm] = useState(emptyVideo);

  async function load() {
    setLoadError('');
    setLoading(true);
    try {
      const [aboutRes, videoRes] = await Promise.all([api.get('/admin/about'), api.get('/admin/home-video')]);
      const data = aboutRes.data;
      setForm({
        badgeAr: data.badgeAr ?? '',
        badgeEn: data.badgeEn ?? '',
        titleAr: data.titleAr ?? '',
        titleEn: data.titleEn ?? '',
        bodyAr: data.bodyAr ?? '',
        bodyEn: data.bodyEn ?? '',
        imageUrl: data.imageUrl ?? '',
      });
      const v = videoRes.data;
      setVideoForm({
        titleAr: v.titleAr ?? '',
        titleEn: v.titleEn ?? '',
        bodyAr: v.bodyAr ?? '',
        bodyEn: v.bodyEn ?? '',
        thumbUrl: v.thumbUrl ?? '',
        videoUrl: v.videoUrl ?? '',
      });
    } catch {
      setLoadError(t('aboutSettings.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      window.alert(t('aboutSettings.uploadFailed'));
    } finally {
      setImageBusy(false);
    }
  }

  async function handleVideoThumb(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setVideoThumbBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setVideoForm((f) => ({ ...f, thumbUrl: url }));
    } catch {
      window.alert(t('aboutSettings.uploadFailed'));
    } finally {
      setVideoThumbBusy(false);
    }
  }

  async function handleSubmitAbout(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await api.put('/admin/about', form);
      await load();
    } catch {
      setSaveError(t('aboutSettings.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitVideo(e) {
    e.preventDefault();
    setVideoSaveError('');
    setSavingVideo(true);
    try {
      await api.put('/admin/home-video', videoForm);
      await load();
    } catch {
      setVideoSaveError(t('aboutSettings.videoSaveError'));
    } finally {
      setSavingVideo(false);
    }
  }

  const imgPreview = mediaSrc(form.imageUrl);
  const videoThumbPreview = mediaSrc(videoForm.thumbUrl);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">{t('aboutSettings.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm font-bold text-[var(--app-muted)]">{t('aboutSettings.subtitle')}</p>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-sm font-bold text-[var(--app-muted)]">{t('aboutSettings.loading')}</p>
      ) : (
        <>
          <Card>
            <CardBody className="space-y-6 p-5 md:p-6">
              <div className="border-b border-[var(--app-border)] pb-5">
                <h2 className="text-lg font-black text-[var(--app-fg)]">{t('aboutSettings.aboutBlockTitle')}</h2>
                <p className="mt-1.5 text-xs font-bold leading-relaxed text-[var(--app-muted)]">{t('aboutSettings.aboutBlockHint')}</p>
              </div>
              <form onSubmit={handleSubmitAbout} className="space-y-6">
                <div className="border-b border-[var(--app-border)] pb-6">
                  <p className="mb-3 flex items-center gap-2 text-lg font-black text-[var(--app-fg)]">
                    <ImageIcon className="h-5 w-5 text-[var(--app-accent)]" />
                    {t('aboutSettings.sectionImage')}
                  </p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="h-40 w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)] sm:h-36 sm:w-56">
                      {imgPreview ? (
                        <img src={imgPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-[var(--app-muted)]">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} />
                      <Button type="button" variant="secondary" disabled={imageBusy} onClick={() => fileRef.current?.click()}>
                        {t('aboutSettings.uploadImage')}
                      </Button>
                      {form.imageUrl ? (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={imageBusy}
                          onClick={() => {
                            setForm((f) => ({ ...f, imageUrl: '' }));
                            if (fileRef.current) fileRef.current.value = '';
                          }}
                        >
                          {t('aboutSettings.removeImage')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-[var(--app-muted)]">{t('aboutSettings.imageHint')}</p>
                </div>

                <div>
                  <p className="mb-3 text-sm font-black text-[var(--app-accent)]">{t('aboutSettings.sectionAr')}</p>
                  <div className="space-y-4">
                    <Input
                      label={t('aboutSettings.badgeAr')}
                      dir="rtl"
                      value={form.badgeAr}
                      onChange={(e) => setForm((f) => ({ ...f, badgeAr: e.target.value }))}
                    />
                    <Textarea
                      dir="rtl"
                      label={t('aboutSettings.titleAr')}
                      value={form.titleAr}
                      onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                      rows={2}
                    />
                    <Textarea
                      dir="rtl"
                      label={t('aboutSettings.bodyAr')}
                      value={form.bodyAr}
                      onChange={(e) => setForm((f) => ({ ...f, bodyAr: e.target.value }))}
                      rows={6}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-black text-[var(--app-accent)]">{t('aboutSettings.sectionEn')}</p>
                  <div className="space-y-4">
                    <Input
                      label={t('aboutSettings.badgeEn')}
                      dir="ltr"
                      value={form.badgeEn}
                      onChange={(e) => setForm((f) => ({ ...f, badgeEn: e.target.value }))}
                    />
                    <Textarea
                      dir="ltr"
                      label={t('aboutSettings.titleEn')}
                      value={form.titleEn}
                      onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                      rows={2}
                    />
                    <Textarea
                      dir="ltr"
                      label={t('aboutSettings.bodyEn')}
                      value={form.bodyEn}
                      onChange={(e) => setForm((f) => ({ ...f, bodyEn: e.target.value }))}
                      rows={6}
                    />
                  </div>
                </div>

                {saveError && <p className="text-sm font-bold text-red-600 dark:text-red-400">{saveError}</p>}
                <Button type="submit" disabled={saving || !form.badgeAr.trim() || !form.titleAr.trim() || !form.bodyAr.trim()}>
                  {saving ? t('aboutSettings.saving') : t('aboutSettings.save')}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card className="mt-8">
            <CardBody className="space-y-6 p-5 md:p-6">
              <div className="mb-2">
                <h2 className="flex items-center gap-2 text-lg font-black text-[var(--app-fg)]">
                  <Clapperboard className="h-5 w-5 text-[var(--app-accent)]" />
                  {t('aboutSettings.videoSectionTitle')}
                </h2>
                <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{t('aboutSettings.videoSectionHint')}</p>
              </div>

              <form onSubmit={handleSubmitVideo} className="space-y-6">
                <div className="border-b border-[var(--app-border)] pb-6">
                  <p className="mb-3 text-sm font-bold text-[var(--app-fg)]">{t('aboutSettings.videoThumbSection')}</p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="aspect-video w-full max-w-md overflow-hidden rounded-2xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
                      {videoThumbPreview ? (
                        <img src={videoThumbPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full min-h-[140px] items-center justify-center text-xs font-bold text-[var(--app-muted)]">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={videoThumbRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleVideoThumb}
                      />
                      <Button type="button" variant="secondary" disabled={videoThumbBusy} onClick={() => videoThumbRef.current?.click()}>
                        {t('aboutSettings.uploadImage')}
                      </Button>
                      {videoForm.thumbUrl ? (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={videoThumbBusy}
                          onClick={() => {
                            setVideoForm((f) => ({ ...f, thumbUrl: '' }));
                            if (videoThumbRef.current) videoThumbRef.current.value = '';
                          }}
                        >
                          {t('aboutSettings.removeImage')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Input
                  label={t('aboutSettings.videoUrlLabel')}
                  dir="ltr"
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="-mt-4 text-xs font-bold text-[var(--app-muted)]">{t('aboutSettings.videoUrlHint')}</p>

                <div>
                  <p className="mb-3 text-sm font-black text-[var(--app-accent)]">{t('aboutSettings.sectionAr')}</p>
                  <div className="space-y-4">
                    <Textarea
                      dir="rtl"
                      label={t('aboutSettings.videoTitleAr')}
                      value={videoForm.titleAr}
                      onChange={(e) => setVideoForm((f) => ({ ...f, titleAr: e.target.value }))}
                      rows={2}
                    />
                    <Textarea
                      dir="rtl"
                      label={t('aboutSettings.videoBodyAr')}
                      value={videoForm.bodyAr}
                      onChange={(e) => setVideoForm((f) => ({ ...f, bodyAr: e.target.value }))}
                      rows={5}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-black text-[var(--app-accent)]">{t('aboutSettings.sectionEn')}</p>
                  <div className="space-y-4">
                    <Textarea
                      dir="ltr"
                      label={t('aboutSettings.videoTitleEn')}
                      value={videoForm.titleEn}
                      onChange={(e) => setVideoForm((f) => ({ ...f, titleEn: e.target.value }))}
                      rows={2}
                    />
                    <Textarea
                      dir="ltr"
                      label={t('aboutSettings.videoBodyEn')}
                      value={videoForm.bodyEn}
                      onChange={(e) => setVideoForm((f) => ({ ...f, bodyEn: e.target.value }))}
                      rows={5}
                    />
                  </div>
                </div>

                {videoSaveError && <p className="text-sm font-bold text-red-600 dark:text-red-400">{videoSaveError}</p>}
                <Button type="submit" disabled={savingVideo || !videoForm.titleAr.trim() || !videoForm.bodyAr.trim()}>
                  {savingVideo ? t('aboutSettings.savingVideo') : t('aboutSettings.saveVideo')}
                </Button>
              </form>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
