import { Link, useLocation } from 'react-router-dom';
import {
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Add User', href: '/admin/users/new', icon: PlusIcon },
  { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
  { name: 'Pending Approvals', href: '/admin/approvals/pending', icon: ClockIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={handleNavigation}
            className={classNames(
              isActive
                ? 'bg-indigo-800 text-white'
                : 'text-indigo-100 hover:bg-indigo-600',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            <item.icon
              className={classNames(
                isActive ? 'text-gray-300' : 'text-indigo-300 group-hover:text-gray-300',
                'mr-3 flex-shrink-0 h-6 w-6'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default Sidebar;