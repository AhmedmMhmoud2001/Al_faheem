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
              </Tr>
            ))}
          </TBody>
        </Table>
      </TableWrap>
    </div>
  );
}
