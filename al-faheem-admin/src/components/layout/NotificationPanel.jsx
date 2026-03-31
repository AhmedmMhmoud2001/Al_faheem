import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bell } from 'lucide-react';

const MOCK_IDS = ['n1', 'n2', 'n3'];

export default function NotificationPanel() {
  const { t } = useTranslation();
  const [readIds, setReadIds] = useState(() => new Set());

  const items = useMemo(
    () => [
      { id: 'n1', titleKey: 'notifications.mock1Title', bodyKey: 'notifications.mock1Body', time: '2h' },
      { id: 'n2', titleKey: 'notifications.mock2Title', bodyKey: 'notifications.mock2Body', time: '1d' },
      { id: 'n3', titleKey: 'notifications.mock3Title', bodyKey: 'notifications.mock3Body', time: '3d' },
    ],
    [],
  );

  const unreadCount = items.filter((i) => !readIds.has(i.id)).length;

  function markAllRead() {
    setReadIds(new Set(MOCK_IDS));
  }

  return (
    <Popover className="relative">
      <PopoverButton
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-navbar)] text-[var(--app-muted)] transition-colors hover:bg-[var(--app-row-hover)] hover:text-[var(--app-card-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
        aria-label={t('notifications.title')}
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-[var(--app-navbar)]">
            {unreadCount}
          </span>
        )}
      </PopoverButton>
      <PopoverPanel
        transition
        anchor={{ to: 'bottom end', gap: '0.5rem' }}
        className="z-50 w-[min(100vw-2rem,22rem)] origin-top rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-0 text-[var(--app-card-fg)] shadow-xl transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
      >
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <p className="font-black text-[var(--app-card-fg)]">{t('notifications.title')}</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-bold text-[var(--app-link)] hover:underline"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {items.map((item) => {
            const unread = !readIds.has(item.id);
            return (
              <li
                key={item.id}
                className="border-b border-[var(--app-border)] px-4 py-3 last:border-b-0"
              >
                <div className="flex gap-3">
                  {unread && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--app-accent)]"
                      aria-hidden
                    />
                  )}
                  <div className={unread ? '' : 'ps-5'}>
                    <p className="font-bold text-[var(--app-card-fg)]">{t(item.titleKey)}</p>
                    <p className="mt-0.5 text-sm text-[var(--app-muted)]">{t(item.bodyKey)}</p>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">{item.time}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </PopoverPanel>
    </Popover>
  );
}
