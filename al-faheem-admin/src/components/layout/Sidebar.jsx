import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileText,
  CreditCard,
  Package,
  Mail,
  PhoneForwarded,
  Star,
  MessageCircleQuestion,
  Quote,
  Info,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

const nav = [
  { to: '/', key: 'nav.overview', icon: LayoutDashboard, end: true },
  { to: '/users', key: 'nav.users', icon: Users },
  { to: '/subjects', key: 'nav.subjects', icon: BookOpen },
  { to: '/questions', key: 'nav.questions', icon: HelpCircle },
  { to: '/exam-templates', key: 'nav.examTemplates', icon: FileText },
  { to: '/payments', key: 'nav.payments', icon: CreditCard },
  { to: '/subscription-plans', key: 'nav.subscriptionPlans', icon: Package },
  { to: '/contact-settings', key: 'nav.contactSettings', icon: PhoneForwarded },
  { to: '/contact', key: 'nav.contact', icon: Mail },
  { to: '/feedback', key: 'nav.feedback', icon: Star },
  { to: '/testimonials', key: 'nav.testimonials', icon: Quote },
  { to: '/faq', key: 'nav.faq', icon: MessageCircleQuestion },
  { to: '/homepage-settings', key: 'nav.homepageContent', icon: LayoutTemplate },
  { to: '/about-settings', key: 'nav.aboutSection', icon: Info },
];

function NavItems({ collapsed, onNavigate }) {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
      {nav.map(({ to, key, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? t(key) : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors px-3 ${
              collapsed ? 'md:justify-center md:px-2' : ''
            } ${
              isActive
                ? 'bg-[var(--app-accent)] text-[var(--app-accent-fg)]'
                : 'text-[var(--app-sidebar-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-fg)]'
            }`
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { t } = useTranslation();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label={t('actions.closeMenu')}
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed start-0 top-0 z-50 flex h-dvh w-56 flex-col border-e border-[var(--app-border)] bg-[var(--app-sidebar)] text-[var(--app-sidebar-fg)] shadow-sm transition-[transform,width] duration-200 ease-out md:static md:z-0 md:h-auto md:min-h-dvh md:translate-x-0 md:shadow-none ${
          mobileOpen
            ? 'translate-x-0'
            : 'max-md:pointer-events-none max-md:ltr:-translate-x-full max-md:rtl:translate-x-full'
        } md:pointer-events-auto ${collapsed ? 'md:w-16' : 'md:w-56'}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[var(--app-border)] ps-3 pe-2 ${
            collapsed ? 'justify-between max-md:justify-between md:justify-center' : 'justify-between'
          }`}
        >
          <div
            className={`flex min-w-0 flex-col leading-tight ${
              collapsed ? 'md:hidden' : ''
            }`}
          >
            <span className="truncate text-lg font-black text-[var(--app-accent)]">
              {t('brand.short')}
            </span>
            <span className="truncate text-xs font-bold text-[var(--app-sidebar-muted)]">
              {t('brand.admin')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-sidebar-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-fg)] md:flex rtl:[&_svg]:rotate-180"
              title={collapsed ? t('actions.expandSidebar') : t('actions.collapseSidebar')}
              aria-label={collapsed ? t('actions.expandSidebar') : t('actions.collapseSidebar')}
            >
              {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-sidebar-muted)] hover:bg-[var(--app-sidebar-hover)] md:hidden"
              aria-label={t('actions.closeMenu')}
            >
              <PanelLeftClose className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
        <NavItems collapsed={collapsed} onNavigate={onCloseMobile} />
      </aside>
    </>
  );
}
