import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import FormPage from '../components/ui/FormPage.jsx';

function buildListUrl({ subjectId, subCategoryId, difficulty }) {
  const sp = new URLSearchParams();
  if (subjectId) sp.set('subjectId', subjectId);
  if (subCategoryId) sp.set('subCategoryId', subCategoryId);
  if (difficulty) sp.set('difficulty', String(difficulty));
  return `/questions/list${sp.toString() ? `?${sp.toString()}` : ''}`;
}

export default function QuestionsPickDifficulty() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const subjectId = params.get('subjectId') || '';
  const subCategoryId = params.get('subCategoryId') || '';

  const canProceed = Boolean(subjectId);

  const subtitle = useMemo(() => {
    if (!subjectId) return 'ارجع واختر التصنيف أولاً';
    return 'اختار درجة الصعوبة لعرض بنك الأسئلة';
  }, [subjectId]);

  return (
    <FormPage title="اختيار درجة الصعوبة" backTo="/questions" maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-[var(--app-muted)]">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((d) => (
            <button
              key={d}
              type="button"
              disabled={!canProceed}
              onClick={() =>
                navigate(
                  buildListUrl({
                    subjectId,
                    subCategoryId,
                    difficulty: d,
                  }),
                )
              }
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 text-start shadow-sm transition-colors hover:bg-[var(--app-row-hover)] disabled:opacity-60"
            >
              <div className="text-lg font-black text-[var(--app-fg)]">
                {t('questions.difficulty')} {d}
              </div>
              <div className="mt-1 text-sm font-bold text-[var(--app-muted)]">عرض الأسئلة الخاصة بهذا المستوى</div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--app-border)] pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={!canProceed}
            onClick={() => navigate(buildListUrl({ subjectId, subCategoryId, difficulty: '' }))}
          >
            كل المستويات
          </Button>
        </div>
      </div>
    </FormPage>
  );
}

