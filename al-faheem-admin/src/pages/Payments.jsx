import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { Table, TableWrap, TBody, Td, Th, THead, Tr } from '../components/ui/Table.jsx';

export default function Payments() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get('/admin/payments', { params: { limit: 50 } })
      .then((r) => setRows(r.data.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[var(--app-fg)]">{t('payments.title')}</h1>
      <TableWrap>
        <Table>
          <THead>
            <Tr>
              <Th>{t('payments.user')}</Th>
              <Th>{t('payments.amount')}</Th>
              <Th>{t('payments.status')}</Th>
              <Th>{t('payments.date')}</Th>
              <Th>تاريخ انتهاء الاشتراك</Th>
              <Th>{t('payments.actions')}</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map((p) => (
              <Tr key={p.id}>
                <Td>{p.user?.email}</Td>
                <Td className="font-bold">
                  {(p.amountCents / 100).toFixed(2)} {p.currency}
                </Td>
                <Td>{p.status}</Td>
                <Td className="text-[var(--app-muted)]">
                  {new Date(p.createdAt).toLocaleString(i18n.language)}
                </Td>
                <Td className="text-[var(--app-muted)]">
                  {p.subscription?.currentPeriodEnd
                    ? new Date(p.subscription.currentPeriodEnd).toLocaleString(i18n.language)
                    : '—'}
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {p.subscriptionId ? (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.post(`/admin/subscriptions/${p.subscriptionId}/action`, { action: 'cancel_now' });
                              alert('تم إلغاء الاشتراك فوراً.');
                            } catch (e) {
                              alert(e?.response?.data?.message || 'تعذر تحديث الاشتراك');
                            }
                          }}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                        >
                          إلغاء الآن
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.post(`/admin/subscriptions/${p.subscriptionId}/action`, { action: 'reactivate' });
                              alert('تم تفعيل الاشتراك.');
                            } catch (e) {
                              alert(e?.response?.data?.message || 'تعذر تحديث الاشتراك');
                            }
                          }}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          تفعيل
                        </button>
                      </>
                    ) : (
                      <span className="text-[var(--app-muted)] text-xs">—</span>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>
    </div>
  );
}
