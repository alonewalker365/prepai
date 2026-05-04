import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, CheckSquare, BookOpen, TrendingUp, Mic2,
  Code2, Users, FileText, Settings, LogOut, Sun, Moon,
  Trophy, Megaphone, BarChart3, ChevronLeft, ChevronRight,
  Zap, GraduationCap, Brain, MessageSquare, Terminal,
} from 'lucide-react';
import { logout, toggleDarkMode, collapseSidebar } from '../../store';
import { NotificationBell } from '../common/Modal';
import toast from 'react-hot-toast';

const studentNav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'         },
  { to: '/tasks',      icon: CheckSquare,     label: 'Daily Tasks'       },
  { divider: true, label: 'Practice Modules' },
  { to: '/aptitude',   icon: Brain,           label: 'Aptitude Quizzes'  },
  { to: '/problems',   icon: Terminal,        label: 'Coding Problems'   },
  { to: '/hr',         icon: MessageSquare,   label: 'HR Practice'       },
  { to: '/interview',  icon: Mic2,            label: 'AI Mock Interview' },
  { divider: true, label: 'Learning' },
  { to: '/courses',    icon: BookOpen,        label: 'Courses'           },
  { to: '/coding',     icon: Code2,           label: 'Question Bank'     },
  { to: '/progress',   icon: TrendingUp,      label: 'My Progress'       },
  { to: '/leaderboard',icon: Trophy,          label: 'Leaderboard'       },
  { to: '/profile',    icon: Settings,        label: 'Profile'           },
];

const adminNav = [
  { to: '/admin',                  icon: LayoutDashboard, label: 'Dashboard'        },
  { divider: true, label: 'Content' },
  { to: '/admin/tasks',            icon: CheckSquare,     label: 'Daily Tasks'      },
  { to: '/admin/aptitude',         icon: Brain,           label: 'Aptitude Quizzes' },
  { to: '/admin/coding',           icon: Terminal,        label: 'Coding Problems'  },
  { to: '/admin/hr',               icon: MessageSquare,   label: 'HR Questions'     },
  { to: '/admin/courses',          icon: BookOpen,        label: 'Courses'          },
  { divider: true, label: 'Management' },
  { to: '/admin/submissions',      icon: FileText,        label: 'Submissions'      },
  { to: '/admin/users',            icon: Users,           label: 'Users'            },
  { to: '/admin/announcements',    icon: Megaphone,       label: 'Announcements'    },
  { to: '/admin/analytics',        icon: BarChart3,       label: 'Analytics'        },
];

export default function DashboardLayout({ isAdmin }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { darkMode, sidebarCollapsed } = useSelector((s) => s.ui);
  const navItems  = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>

        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-slate-200 dark:border-slate-800 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-display font-bold text-slate-900 dark:text-white text-lg tracking-tight">PrepWise</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item, idx) => {
              if (item.divider) {
                return sidebarCollapsed ? (
                  <li key={idx} className="my-2 border-t border-slate-100 dark:border-slate-800" />
                ) : (
                  <li key={idx} className="pt-3 pb-1 px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.label}</p>
                  </li>
                );
              }
              const { to, icon: Icon, label } = item;
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/dashboard' || to === '/admin'}
                    title={sidebarCollapsed ? label : undefined}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon size={17} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: user + collapse */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                  : <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            title="Logout">
            <LogOut size={15} />
            {!sidebarCollapsed && 'Logout'}
          </button>
          <button onClick={() => dispatch(collapseSidebar())}
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {isAdmin
                ? '⚙️ Admin Panel'
                : `🔥 Streak: ${user?.streak || 0} days · ${user?.totalPoints || 0} pts`
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <NotificationBell />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
