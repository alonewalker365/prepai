// AdminAnalyticsPage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, CheckSquare, BookOpen, Mic2, TrendingUp, BarChart3 } from 'lucide-react';
import { fetchAdminStats } from '../../store';
import { Card, CardBody, StatCard, PageHeader } from '../../components/common/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = { coding: '#6366f1', aptitude: '#06b6d4', hr: '#10b981', 'system-design': '#f59e0b', theory: '#8b5cf6', communication: '#ec4899' };

const Tooltip_ = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-900 dark:text-white mb-0.5">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export function AdminAnalyticsPage() {
  const dispatch = useDispatch();
  const { admin: stats, loading } = useSelector((s) => s.analytics);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  const overview = stats?.overview || {};
  const { dailyTrend = [], categoryBreakdown = [], difficultyBreakdown = [] } = stats?.charts || {};
  const topPerformers = stats?.topPerformers || [];

  const pieData = categoryBreakdown.map(c => ({ name: c._id, value: c.count }));
  const diffData = difficultyBreakdown.map(d => ({ name: d._id, count: d.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Platform-wide engagement and performance metrics" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={overview.totalUsers || 0} icon={Users} color="brand" subtitle={`${overview.activeUsers || 0} active this week`} />
        <StatCard label="Month Submissions" value={overview.monthSubmissions || 0} icon={CheckSquare} color="emerald" subtitle={`${overview.todaySubmissions || 0} today`} />
        <StatCard label="Published Courses" value={overview.totalCourses || 0} icon={BookOpen} color="sky" />
        <StatCard label="Interview Sessions" value={overview.interviewSessions || 0} icon={Mic2} color="amber" subtitle="This month" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Daily Submission Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyTrend} barSize={32}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<Tooltip_ />} />
                  <Bar dataKey="count" name="Submissions" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">By Category</h2>
          </div>
          <CardBody>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#8b5cf6'} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-sm text-slate-400">No data yet</div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Difficulty distribution */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Tasks by Difficulty</h2>
          </div>
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={diffData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<Tooltip_ />} />
                <Bar dataKey="count" name="Tasks" radius={[6,6,0,0]}>
                  {diffData.map((e, i) => (
                    <Cell key={i} fill={e.name === 'easy' ? '#10b981' : e.name === 'medium' ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top performers */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Top 5 Performers</h2>
          </div>
          <CardBody className="p-0">
            {topPerformers.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">{u.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{u.totalPoints}pts</p>
                  <p className="text-xs text-slate-400">🔥{u.streak}d</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
