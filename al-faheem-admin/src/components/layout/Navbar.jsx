import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Moon, Sun, Menu as MenuIcon, User, LogOut, Languages } from 'lucide-react';
import { clearTokens } from '../../api/client.js';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import NotificationPanel from './NotificationPanel.jsx';

export default function Navbar({ onOpenMobile }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function logout() {
    clearTokens();
    navigate('/login');
  }

  const otherLang = i18n.language?.startsWith('ar') ? 'en' : 'ar';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-[var(--app-border)] bg-[var(--app-navbar)] px-3 md:px-4">
      <button
        type="button"
        onClick={onOpenMobile}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] text-[var(--app-muted)] hover:bg-[var(--app-row-hover)] md:hidden"
        aria-label={t('actions.openMenu')}
      >
        <MenuIcon className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-2">
        <NotificationPanel />

        <button
          type="button"
          onClick={() => i18n.changeLanguage(otherLang)}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--app-border)] px-2.5 text-sm font-bold text-[var(--app-muted)] hover:bg-[var(--app-row-hover)] hover:text-[var(--app-card-fg)]"
          title={t('lang.switch')}
          aria-label={t('lang.switch')}
        >
          <Languages className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{otherLang === 'ar' ? t('lang.ar') : t('lang.en')}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] text-[var(--app-muted)] hover:bg-[var(--app-row-hover)] hover:text-[var(--app-card-fg)]"
          title={t('theme.toggle')}
          aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <Menu as="div" className="relative">
          <MenuButton className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-row-hover)] text-[var(--app-card-fg)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]">
            <User className="h-5 w-5" strokeWidth={2} />
          </MenuButton>
          <MenuItems
            transition
            anchor={{ to: 'bottom end', gap: '0.5rem' }}
            className="z-50 min-w-[12rem] rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] py-1 text-[var(--app-card-fg)] shadow-xl transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
          >
            <div className="border-b border-[var(--app-border)] px-3 py-2 text-xs font-bold text-[var(--app-muted)]">
              {t('userMenu.account')}
            </div>
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={logout}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-bold ${
                    focus ? 'bg-[var(--app-row-hover)]' : ''
                  } text-[var(--app-card-fg)]`}
                >
                  <LogOut className="h-4 w-4" />
                  {t('actions.logout')}
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}
