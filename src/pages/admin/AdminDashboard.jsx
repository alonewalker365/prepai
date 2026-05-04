import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, BookOpen, Mic2, ArrowRight, TrendingUp, Medal, Clock } from 'lucide-react';
import { fetchAdminStats } from '../../store';
import { Card, CardBody, StatCard, Badge, Button, SkeletonCard, SectionHeader } from '../../components/common/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getSocket } from '../../api/socket';
import { submissionAPI } from '../../api/services';

const PIE_COLORS = { coding: '#6366f1', aptitude: '#06b6d4', hr: '#10b981', 'system-design': '#f59e0b', theory: '#8b5cf6', communication: '#ec4899' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium mb-0.5 text-slate-900 dark:text-white">{label}</p>
      <p className="text-brand-600 dark:text-brand-400">{payload[0]?.value} submissions</p>
    </div>
  );
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { admin: stats, loading } = useSelector((s) => s.analytics);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  // Load pending submission count
  useEffect(() => {
    submissionAPI.getAll({ status: 'under_review', limit: 1 })
      .then(({ data }) => setPendingCount(data.data.pagination?.total || 0))
      .catch(() => {});
  }, []);

  // Real-time: bump count when new submission arrives
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (notif) => {
      if (notif.type === 'new_submission') setPendingCount(c => c + 1);
    };
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const { dailyTrend = [], categoryBreakdown = [], difficultyBreakdown = [] } = stats?.charts || {};
  const topPerformers = stats?.topPerformers || [];

  const pieData = categoryBreakdown.map(c => ({ name: c._id, value: c.count }));
  const diffData = difficultyBreakdown.map(d => ({ name: d._id, count: d.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform overview and activity metrics</p>
        </div>
        <Link to="/admin/tasks/new"><Button icon={CheckSquare} size="sm">Create Task</Button></Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={overview.totalUsers || 0} icon={Users} color="brand" subtitle={`${overview.activeUsers || 0} active this week`} />
        <Link to="/admin/submissions" className="block">
          <div className={`relative ${(overview.pendingReviews || pendingCount) > 0 ? 'ring-2 ring-amber-400 dark:ring-amber-500 rounded-xl' : ''}`}>
            <StatCard
              label="Pending Reviews"
              value={overview.pendingReviews ?? pendingCount}
              icon={Clock}
              color="amber"
              subtitle="Awaiting your decision"
            />
            {(overview.pendingReviews || pendingCount) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                Action needed
              </span>
            )}
          </div>
        </Link>
        <StatCard label="Published Courses" value={overview.totalCourses || 0} icon={BookOpen} color="sky" />
        <StatCard label="Interview Sessions" value={overview.interviewSessions || 0} icon={Mic2} color="emerald" subtitle="This month" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily trend */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Daily Submissions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last 7 days activity</p>
            </div>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyTrend} barSize={28}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* Category pie */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">By Category</h2>
          </div>
          <CardBody>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#8b5cf6'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Top performers + Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top performers */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Top Performers</h2>
              <Link to="/admin/users" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">View all users</Link>
            </div>
            <CardBody className="p-0">
              {topPerformers.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">No learner data yet</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topPerformers.map((u, i) => (
                    <div key={u._id} className="flex items-center gap-4 px-5 py-3">
                      <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-400'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {u.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{u.totalPoints} pts</p>
                        <p className="text-xs text-slate-400">🔥 {u.streak}d streak</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick admin links */}
        <Card className="p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {/* Pending Review — special highlighted link */}
            <Link to="/admin/submissions" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors group">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex-1">Review Submissions</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </Link>

            {[
              { to: '/admin/tasks/new',      label: 'Create New Task',    icon: CheckSquare },
              { to: '/admin/users',          label: 'Manage Users',       icon: Users       },
              { to: '/admin/announcements',  label: 'Post Announcement',  icon: Medal       },
              { to: '/admin/analytics',      label: 'Full Analytics',     icon: TrendingUp  },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30">
                  <Icon size={14} className="text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{label}</span>
                <ArrowRight size={13} className="ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
