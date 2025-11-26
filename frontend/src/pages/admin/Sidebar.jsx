import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  HomeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const mainNav = [
  { name: 'Admin Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Reports', href: '/admin/reports', icon: ShieldCheckIcon },
];

const managementNav = [
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Add User', href: '/admin/users/new', icon: PlusIcon },
  { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
  { name: 'Pending Approvals', href: '/admin/approvals/pending', icon: ClockIcon },
];

const settingsNav = [
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: UserGroupIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href) => {
    if (onNavigate) onNavigate();
    // allow normal Link navigation; used for programmatic actions like logout
    if (href) navigate(href);
  };

  const isActive = (href) => {
    if (!href) return false;
    return (
      location.pathname === href ||
      (href !== '/' && location.pathname.startsWith(href + '/'))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // optionally clear other auth state
    window.location.href = '/login';
  };

  const NavSection = ({ title, items }) => (
    <div>
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => handleNavigation()}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={classNames(
              isActive(item.href)
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
            )}
          >
            <item.icon
              className={classNames(
                isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="h-full bg-white border-r border-gray-200 w-64 p-4 flex flex-col">
      <div className="flex items-center justify-between px-2 py-3">
        <div>
          <div className="text-lg font-semibold text-gray-900">Admin</div>
          <div className="text-xs text-gray-500">Management Console</div>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        <nav className="space-y-6">
          <NavSection title="Main" items={mainNav} />
          <NavSection title="Management" items={managementNav} />
          <NavSection title="Settings" items={settingsNav} />
        </nav>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 text-gray-500" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;