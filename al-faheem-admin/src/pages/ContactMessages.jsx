import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { Card, CardBody } from '../components/ui/Card.jsx';

export default function ContactMessages() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await api.get('/admin/contact', { params: { limit: 50 } });
    setRows(data.data);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function mark(id, status) {
    await api.patch(`/admin/contact/${id}`, { status });
    load();
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[var(--app-fg)]">{t('contact.title')}</h1>
      <div className="space-y-3">
        {rows.map((m) => (
          <Card key={m.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-[var(--app-fg)]">{m.name}</p>
                  <p className="text-sm text-[var(--app-muted)]">{m.email}</p>
                </div>
                <span className="rounded-lg bg-[var(--app-row-hover)] px-2 py-1 text-xs font-bold text-[var(--app-muted)]">
                  {m.status}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap font-bold text-[var(--app-fg)]">{m.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--app-link)] hover:underline"
                  onClick={() => mark(m.id, 'READ')}
                >
                  {t('actions.markRead')}
                </button>
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--app-success)] hover:underline"
                  onClick={() => mark(m.id, 'REPLIED')}
                >
                  {t('actions.markReplied')}
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
