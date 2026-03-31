import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, publicBase, uploadAdminFile } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import { LayoutTemplate, ListChecks, Sparkles } from 'lucide-react';

function mediaSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const p = url.startsWith('/') ? url : `/${url}`;
  return `${publicBase}${p}`;
}

function Textarea({ label, id, value, onChange, rows = 4, dir }) {
  const tid = id || 'tx';
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

const emptyHero = {
  titleAr: '',
  titleEn: '',
  subtitleAr: '',
  subtitleEn: '',
  howItWorksAr: '',
  howItWorksEn: '',
  startNowAr: '',
  startNowEn: '',
  laptopAltAr: '',
  laptopAltEn: '',
};

const emptyStats = {
  stat1Value: '',
  stat1LabelAr: '',
  stat1LabelEn: '',
  stat2Value: '',
  stat2LabelAr: '',
  stat2LabelEn: '',
  stat3Value: '',
  stat3LabelAr: '',
  stat3LabelEn: '',
  titleAr: '',
  titleEn: '',
  bodyAr: '',
  bodyEn: '',
  ctaAr: '',
  ctaEn: '',
  imageUrl: '',
  imageAltAr: '',
  imageAltEn: '',
};

const emptyWhy = {
  titleAr: '',
  titleEn: '',
  item1Ar: '',
  item1En: '',
  item2Ar: '',
  item2En: '',
  item3Ar: '',
  item3En: '',
  item4Ar: '',
  item4En: '',
};

export default function HomepageSettings() {
  const { t } = useTranslation();
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const [heroForm, setHeroForm] = useState(emptyHero);
  const [heroErr, setHeroErr] = useState('');
  const [heroSaving, setHeroSaving] = useState(false);

  const [statsForm, setStatsForm] = useState(emptyStats);
  const [statsErr, setStatsErr] = useState('');
  const [statsSaving, setStatsSaving] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);

  const [whyForm, setWhyForm] = useState(emptyWhy);
  const [whyErr, setWhyErr] = useState('');
  const [whySaving, setWhySaving] = useState(false);

  async function load() {
    setLoadError('');
    setLoading(true);
    try {
      const [hr, st, wy] = await Promise.all([
        api.get('/admin/hero'),
        api.get('/admin/home-stats'),
        api.get('/admin/why-us'),
      ]);
      const h = hr.data;
      setHeroForm({
        titleAr: h.titleAr ?? '',
        titleEn: h.titleEn ?? '',
        subtitleAr: h.subtitleAr ?? '',
        subtitleEn: h.subtitleEn ?? '',
        howItWorksAr: h.howItWorksAr ?? '',
        howItWorksEn: h.howItWorksEn ?? '',
        startNowAr: h.startNowAr ?? '',
        startNowEn: h.startNowEn ?? '',
        laptopAltAr: h.laptopAltAr ?? '',
        laptopAltEn: h.laptopAltEn ?? '',
      });
      const s = st.data;
      setStatsForm({
        stat1Value: s.stat1Value ?? '',
        stat1LabelAr: s.stat1LabelAr ?? '',
        stat1LabelEn: s.stat1LabelEn ?? '',
        stat2Value: s.stat2Value ?? '',
        stat2LabelAr: s.stat2LabelAr ?? '',
        stat2LabelEn: s.stat2LabelEn ?? '',
        stat3Value: s.stat3Value ?? '',
        stat3LabelAr: s.stat3LabelAr ?? '',
        stat3LabelEn: s.stat3LabelEn ?? '',
        titleAr: s.titleAr ?? '',
        titleEn: s.titleEn ?? '',
        bodyAr: s.bodyAr ?? '',
        bodyEn: s.bodyEn ?? '',
        ctaAr: s.ctaAr ?? '',
        ctaEn: s.ctaEn ?? '',
        imageUrl: s.imageUrl ?? '',
        imageAltAr: s.imageAltAr ?? '',
        imageAltEn: s.imageAltEn ?? '',
      });
      const w = wy.data;
      setWhyForm({
        titleAr: w.titleAr ?? '',
        titleEn: w.titleEn ?? '',
        item1Ar: w.item1Ar ?? '',
        item1En: w.item1En ?? '',
        item2Ar: w.item2Ar ?? '',
        item2En: w.item2En ?? '',
        item3Ar: w.item3Ar ?? '',
        item3En: w.item3En ?? '',
        item4Ar: w.item4Ar ?? '',
        item4En: w.item4En ?? '',
      });
    } catch {
      setLoadError(t('homepageSettings.loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveHero(e) {
    e.preventDefault();
    setHeroErr('');
    setHeroSaving(true);
    try {
      await api.put('/admin/hero', heroForm);
      await load();
    } catch {
      setHeroErr(t('homepageSettings.saveError'));
    } finally {
      setHeroSaving(false);
    }
  }

  async function saveStats(e) {
    e.preventDefault();
    setStatsErr('');
    setStatsSaving(true);
    try {
      await api.put('/admin/home-stats', statsForm);
      await load();
    } catch {
      setStatsErr(t('homepageSettings.saveError'));
    } finally {
      setStatsSaving(false);
    }
  }

  async function saveWhy(e) {
    e.preventDefault();
    setWhyErr('');
    setWhySaving(true);
    try {
      await api.put('/admin/why-us', whyForm);
      await load();
    } catch {
      setWhyErr(t('homepageSettings.saveError'));
    } finally {
      setWhySaving(false);
    }
  }

  async function onStatsImage(file) {
    if (!file) return;
    setImgBusy(true);
    try {
      const url = await uploadAdminFile(file);
      setStatsForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      window.alert(t('aboutSettings.uploadFailed'));
    } finally {
      setImgBusy(false);
    }
  }

  const statsPreview = mediaSrc(statsForm.imageUrl);

  const heroOk =
    heroForm.titleAr.trim() &&
    heroForm.subtitleAr.trim() &&
    heroForm.howItWorksAr.trim() &&
    heroForm.startNowAr.trim();
  const statsOk =
    statsForm.stat1Value.trim() &&
    statsForm.stat1LabelAr.trim() &&
    statsForm.stat2Value.trim() &&
    statsForm.stat2LabelAr.trim() &&
    statsForm.stat3Value.trim() &&
    statsForm.stat3LabelAr.trim() &&
    statsForm.titleAr.trim() &&
    statsForm.bodyAr.trim() &&
    statsForm.ctaAr.trim();
  const whyOk =
    whyForm.titleAr.trim() &&
    whyForm.item1Ar.trim() &&
    whyForm.item2Ar.trim() &&
    whyForm.item3Ar.trim() &&
    whyForm.item4Ar.trim();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--app-fg)] md:text-3xl">{t('homepageSettings.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm font-bold text-[var(--app-muted)]">{t('homepageSettings.subtitle')}</p>
      </div>

      {loadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-sm font-bold text-[var(--app-muted)]">{t('homepageSettings.loading')}</p>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardBody className="space-y-5 p-5 md:p-6">
              <div className="flex items-start gap-3 border-b border-[var(--app-border)] pb-4">
                <Sparkles className="h-6 w-6 shrink-0 text-[var(--app-accent)]" />
                <div>
                  <h2 className="text-lg font-black text-[var(--app-fg)]">{t('homepageSettings.heroTitle')}</h2>
                  <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{t('homepageSettings.heroHint')}</p>
                </div>
              </div>
              <form onSubmit={saveHero} className="space-y-4">
                <p className="text-sm font-black text-[var(--app-accent)]">{t('aboutSettings.sectionAr')}</p>
                <Textarea
                  dir="rtl"
                  label={t('homepageSettings.heroTitleAr')}
                  value={heroForm.titleAr}
                  onChange={(e) => setHeroForm((f) => ({ ...f, titleAr: e.target.value }))}
                  rows={2}
                />
                <Textarea
                  dir="rtl"
                  label={t('homepageSettings.heroSubtitleAr')}
                  value={heroForm.subtitleAr}
                  onChange={(e) => setHeroForm((f) => ({ ...f, subtitleAr: e.target.value }))}
                  rows={5}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    dir="rtl"
                    label={t('homepageSettings.howItWorksAr')}
                    value={heroForm.howItWorksAr}
                    onChange={(e) => setHeroForm((f) => ({ ...f, howItWorksAr: e.target.value }))}
                  />
                  <Input
                    dir="rtl"
                    label={t('homepageSettings.startNowAr')}
                    value={heroForm.startNowAr}
                    onChange={(e) => setHeroForm((f) => ({ ...f, startNowAr: e.target.value }))}
                  />
                </div>
                <Input
                  dir="rtl"
                  label={t('homepageSettings.laptopAltAr')}
                  value={heroForm.laptopAltAr}
                  onChange={(e) => setHeroForm((f) => ({ ...f, laptopAltAr: e.target.value }))}
                />
                <p className="text-sm font-black text-[var(--app-accent)]">{t('aboutSettings.sectionEn')}</p>
                <Textarea
                  dir="ltr"
                  label={t('homepageSettings.heroTitleEn')}
                  value={heroForm.titleEn}
                  onChange={(e) => setHeroForm((f) => ({ ...f, titleEn: e.target.value }))}
                  rows={2}
                />
                <Textarea
                  dir="ltr"
                  label={t('homepageSettings.heroSubtitleEn')}
                  value={heroForm.subtitleEn}
                  onChange={(e) => setHeroForm((f) => ({ ...f, subtitleEn: e.target.value }))}
                  rows={5}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('homepageSettings.howItWorksEn')}
                    value={heroForm.howItWorksEn}
                    onChange={(e) => setHeroForm((f) => ({ ...f, howItWorksEn: e.target.value }))}
                  />
                  <Input
                    label={t('homepageSettings.startNowEn')}
                    value={heroForm.startNowEn}
                    onChange={(e) => setHeroForm((f) => ({ ...f, startNowEn: e.target.value }))}
                  />
                </div>
                <Input
                  label={t('homepageSettings.laptopAltEn')}
                  value={heroForm.laptopAltEn}
                  onChange={(e) => setHeroForm((f) => ({ ...f, laptopAltEn: e.target.value }))}
                />
                {heroErr && <p className="text-sm font-bold text-red-600 dark:text-red-400">{heroErr}</p>}
                <Button type="submit" disabled={heroSaving || !heroOk}>
                  {heroSaving ? t('homepageSettings.saving') : t('homepageSettings.saveHero')}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-5 p-5 md:p-6">
              <div className="flex items-start gap-3 border-b border-[var(--app-border)] pb-4">
                <LayoutTemplate className="h-6 w-6 shrink-0 text-[var(--app-accent)]" />
                <div>
                  <h2 className="text-lg font-black text-[var(--app-fg)]">{t('homepageSettings.statsTitle')}</h2>
                  <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{t('homepageSettings.statsHint')}</p>
                </div>
              </div>
              <form onSubmit={saveStats} className="space-y-4">
                <p className="text-sm font-black text-[var(--app-accent)]">{t('homepageSettings.statsStrip')}</p>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-xl border border-[var(--app-border)] p-4 space-y-3">
                    <p className="text-xs font-black text-[var(--app-muted)]">{t('homepageSettings.statBlock', { n })}</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        label={t('homepageSettings.statValue')}
                        value={statsForm[`stat${n}Value`]}
                        onChange={(e) => setStatsForm((f) => ({ ...f, [`stat${n}Value`]: e.target.value }))}
                      />
                      <Input
                        dir="rtl"
                        label={t('homepageSettings.statLabelAr')}
                        value={statsForm[`stat${n}LabelAr`]}
                        onChange={(e) => setStatsForm((f) => ({ ...f, [`stat${n}LabelAr`]: e.target.value }))}
                      />
                      <Input
                        label={t('homepageSettings.statLabelEn')}
                        value={statsForm[`stat${n}LabelEn`]}
                        onChange={(e) => setStatsForm((f) => ({ ...f, [`stat${n}LabelEn`]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}

                <p className="text-sm font-black text-[var(--app-accent)] pt-2">{t('homepageSettings.cardBlock')}</p>
                <div className="border-b border-[var(--app-border)] pb-4">
                  <p className="mb-2 text-xs font-bold text-[var(--app-muted)]">{t('homepageSettings.cardImage')}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="aspect-video w-full max-w-md overflow-hidden rounded-2xl bg-[var(--app-row-hover)] ring-2 ring-[var(--app-border)]">
                      {statsPreview ? (
                        <img src={statsPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full min-h-[120px] items-center justify-center text-xs font-bold text-[var(--app-muted)]">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        id="hs-img"
                        onChange={(e) => {
                          onStatsImage(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      <Button type="button" variant="secondary" disabled={imgBusy} onClick={() => document.getElementById('hs-img')?.click()}>
                        {t('aboutSettings.uploadImage')}
                      </Button>
                      {statsForm.imageUrl ? (
                        <Button type="button" variant="secondary" onClick={() => setStatsForm((f) => ({ ...f, imageUrl: '' }))}>
                          {t('aboutSettings.removeImage')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input dir="rtl" label={t('homepageSettings.imageAltAr')} value={statsForm.imageAltAr} onChange={(e) => setStatsForm((f) => ({ ...f, imageAltAr: e.target.value }))} />
                  <Input label={t('homepageSettings.imageAltEn')} value={statsForm.imageAltEn} onChange={(e) => setStatsForm((f) => ({ ...f, imageAltEn: e.target.value }))} />
                </div>
                <Textarea dir="rtl" label={t('homepageSettings.cardTitleAr')} value={statsForm.titleAr} onChange={(e) => setStatsForm((f) => ({ ...f, titleAr: e.target.value }))} rows={2} />
                <Textarea dir="ltr" label={t('homepageSettings.cardTitleEn')} value={statsForm.titleEn} onChange={(e) => setStatsForm((f) => ({ ...f, titleEn: e.target.value }))} rows={2} />
                <Textarea dir="rtl" label={t('homepageSettings.cardBodyAr')} value={statsForm.bodyAr} onChange={(e) => setStatsForm((f) => ({ ...f, bodyAr: e.target.value }))} rows={5} />
                <Textarea dir="ltr" label={t('homepageSettings.cardBodyEn')} value={statsForm.bodyEn} onChange={(e) => setStatsForm((f) => ({ ...f, bodyEn: e.target.value }))} rows={5} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input dir="rtl" label={t('homepageSettings.ctaAr')} value={statsForm.ctaAr} onChange={(e) => setStatsForm((f) => ({ ...f, ctaAr: e.target.value }))} />
                  <Input label={t('homepageSettings.ctaEn')} value={statsForm.ctaEn} onChange={(e) => setStatsForm((f) => ({ ...f, ctaEn: e.target.value }))} />
                </div>
                {statsErr && <p className="text-sm font-bold text-red-600 dark:text-red-400">{statsErr}</p>}
                <Button type="submit" disabled={statsSaving || !statsOk}>
                  {statsSaving ? t('homepageSettings.saving') : t('homepageSettings.saveStats')}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-5 p-5 md:p-6">
              <div className="flex items-start gap-3 border-b border-[var(--app-border)] pb-4">
                <ListChecks className="h-6 w-6 shrink-0 text-[var(--app-accent)]" />
                <div>
                  <h2 className="text-lg font-black text-[var(--app-fg)]">{t('homepageSettings.whyTitle')}</h2>
                  <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{t('homepageSettings.whyHint')}</p>
                </div>
              </div>
              <form onSubmit={saveWhy} className="space-y-4">
                <Textarea dir="rtl" label={t('homepageSettings.whyHeadingAr')} value={whyForm.titleAr} onChange={(e) => setWhyForm((f) => ({ ...f, titleAr: e.target.value }))} rows={2} />
                <Textarea dir="ltr" label={t('homepageSettings.whyHeadingEn')} value={whyForm.titleEn} onChange={(e) => setWhyForm((f) => ({ ...f, titleEn: e.target.value }))} rows={2} />
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="rounded-xl border border-[var(--app-border)] p-4 space-y-3">
                    <p className="text-xs font-black text-[var(--app-muted)]">{t('homepageSettings.benefitBlock', { n })}</p>
                    <Textarea
                      dir="rtl"
                      label={t('homepageSettings.itemAr')}
                      value={whyForm[`item${n}Ar`]}
                      onChange={(e) => setWhyForm((f) => ({ ...f, [`item${n}Ar`]: e.target.value }))}
                      rows={2}
                    />
                    <Textarea
                      dir="ltr"
                      label={t('homepageSettings.itemEn')}
                      value={whyForm[`item${n}En`]}
                      onChange={(e) => setWhyForm((f) => ({ ...f, [`item${n}En`]: e.target.value }))}
                      rows={2}
                    />
                  </div>
                ))}
                {whyErr && <p className="text-sm font-bold text-red-600 dark:text-red-400">{whyErr}</p>}
                <Button type="submit" disabled={whySaving || !whyOk}>
                  {whySaving ? t('homepageSettings.saving') : t('homepageSettings.saveWhy')}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
