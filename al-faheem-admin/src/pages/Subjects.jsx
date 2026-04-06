import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, publicBase } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

function subjectImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const p = url.startsWith('/') ? url : `/${url}`;
  return `${publicBase}${p}`;
}

const iconBtn =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]';

const iconBtnDanger =
  'inline-flex items-center justify-center rounded-lg p-2 text-[var(--app-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';

export default function Subjects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    const { data } = await api.get('/admin/subjects');
    setRows(data.data);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  async function remove(s) {
    if (!window.confirm(t('subjects.confirmDelete'))) return;
    try {
      await api.delete(`/admin/subjects/${s.id}`);
      load();
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 409
          ? t('subjects.hasQuestions')
          : err.response?.data?.message || t('subjects.deleteFailed');
      window.alert(msg);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('subjects.title')}</h1>
        <Button type="button" onClick={() => navigate('/subjects/create')}>
          {t('subjects.openAdd')}
        </Button>
      </div>

      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th className="w-20">{t('subjects.image')}</Th>
              <Th>{t('subjects.id')}</Th>
              <Th>{t('subjects.slug')}</Th>
              <Th>{t('subjects.nameAr')}</Th>
              <Th>{t('subjects.nameEn')}</Th>
              <Th>{t('subjects.sortOrder')}</Th>
              <Th>{t('users.status')}</Th>
              <Th className="min-w-[5rem] whitespace-nowrap">{t('subjects.actions')}</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map((s) => {
              const thumb = subjectImageSrc(s.imageUrl);
              return (
                <Tr key={s.id}>
                  <Td>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-12 w-16 rounded-lg object-cover ring-1 ring-[var(--app-border)]"
                      />
                    ) : (
                      <span className="text-[var(--app-muted)]">—</span>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-[var(--app-muted)]">{s.id}</Td>
                  <Td className="font-bold">{s.slug}</Td>
                  <Td>{s.nameAr}</Td>
                  <Td className="text-[var(--app-muted)]">{s.nameEn || '—'}</Td>
                  <Td>{s.sortOrder}</Td>
                  <Td>{s.isActive ? t('subjects.active') : t('subjects.inactive')}</Td>
                  <Td className="whitespace-nowrap">
                    <div className="inline-flex flex-nowrap items-center gap-0.5">
                      <button
                        type="button"
                        className={iconBtn}
                        title={t('subjects.edit')}
                        aria-label={t('subjects.edit')}
                        onClick={() => navigate(`/subjects/${s.id}/edit`)}
                      >
                        <Pencil className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className={iconBtnDanger}
                        title={t('subjects.delete')}
                        aria-label={t('subjects.delete')}
                        onClick={() => remove(s)}
                      >
                        <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </TableWrap>
    </div>
  );
}
