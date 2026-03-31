import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { Card, CardBody } from '../components/ui/Card.jsx';

export default function FeedbackList() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get('/admin/feedback', { params: { limit: 50 } })
      .then((r) => setRows(r.data.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[var(--app-fg)]">{t('feedback.title')}</h1>
      <div className="space-y-3">
        {rows.map((f) => (
          <Card key={f.id}>
            <CardBody>
              <p className="font-black text-[var(--app-accent)]">{'★'.repeat(f.rating)}</p>
              <p className="mt-2 font-bold text-[var(--app-fg)]">{f.comment}</p>
              <p className="mt-1 text-xs text-[var(--app-muted)]">
                {f.name || f.email || t('feedback.anonymous')} —{' '}
                {new Date(f.createdAt).toLocaleString(i18n.language)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
