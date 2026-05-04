import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TrendingUp, CheckSquare, Trophy, Flame, BookOpen, Star, Target } from 'lucide-react';
import { fetchMyAnalytics } from '../../store';
import { Card, CardBody, StatCard, Badge, PageHeader, ProgressBar, SectionHeader, EmptyState } from '../../components/common/UI';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { format, parseISO } from 'date-fns';

const CATEGORY_LABELS = { coding: '💻 Coding', aptitude: '🧮 Aptitude', hr: '💬 HR', 'system-design': '🏗️ System Design', theory: '📖 Theory', communication: '🗣️ Communication' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-900 dark:text-white mb-0.5">{label}</p>
      <p className="text-brand-600 dark:text-brand-400">{payload[0]?.value} tasks</p>
    </div>
  );
};

export default function ProgressPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { mine: analytics, loading } = useSelector((s) => s.analytics);

  useEffect(() => { dispatch(fetchMyAnalytics()); }, [dispatch]);

  const chartData = analytics?.weeklyActivity?.slice(-21).map((d) => ({
    date: format(parseISO(d._id), 'MMM d'),
    tasks: d.count,
  })) || [];

  const categoryData = analytics?.categoryPerformance?.map((c) => ({
    category: CATEGORY_LABELS[c._id] || c._id,
    completed: c.completed,
    total: c.total,
    rate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
  })) || [];

  const radarData = categoryData.map((c) => ({ subject: c.category.split(' ')[1] || c.category, rate: c.rate }));
  const enrolledCourses = analytics?.progress?.coursesEnrolled || [];
  const recentSubs = analytics?.recentSubmissions || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Progress" subtitle="Track your learning journey, streaks, and performance across all categories" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Completed" value={analytics?.progress?.totalTasksCompleted || 0} icon={CheckSquare} color="emerald" />
        <StatCard label="Current Streak" value={`${user?.streak || 0} days`} icon={Flame} color="amber" />
        <StatCard label="Total Points" value={user?.totalPoints || 0} icon={Trophy} color="brand" />
        <StatCard label="Courses Enrolled" value={enrolledCourses.length} icon={BookOpen} color="sky" />
      </div>

      {/* Activity chart */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Activity — Last 21 Days</h2>
        </div>
        <CardBody>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="actGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2.5} fill="url(#actGrad2)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <EmptyState icon={TrendingUp} title="No activity yet" description="Complete some tasks to see your progress chart" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Category breakdown + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category performance */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Performance by Category</h2>
          </div>
          <CardBody className="space-y-4">
            {categoryData.length === 0 ? (
              <EmptyState icon={Target} title="No data yet" description="Submit tasks to see category performance" />
            ) : (
              categoryData.map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{c.completed}/{c.total}</span>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{c.rate}%</span>
                    </div>
                  </div>
                  <ProgressBar value={c.completed} max={c.total || 1} color={c.rate >= 80 ? 'emerald' : c.rate >= 50 ? 'brand' : 'amber'} />
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Skill radar */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Skill Radar</h2>
          </div>
          <CardBody>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Radar name="Completion %" dataKey="rate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <EmptyState icon={Star} title="No data yet" description="Complete tasks across categories" />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Course progress */}
      {enrolledCourses.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Course Progress</h2>
            <Link to="/courses" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">View all</Link>
          </div>
          <CardBody className="space-y-5">
            {enrolledCourses.map((e) => (
              <div key={e.course?._id}>
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/courses/${e.course?._id}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {e.course?.title || 'Course'}
                  </Link>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{e.completionPercentage || 0}%</span>
                </div>
                <ProgressBar value={e.completionPercentage || 0} max={100} />
                <p className="text-xs text-slate-400 mt-1">{e.completedLessons?.length || 0} lessons completed</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Badges Earned</h2>
          </div>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span>{badge.icon || '🏅'}</span>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{badge.name}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent submissions */}
      {recentSubs.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Recent Submissions</h2>
          </div>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentSubs.slice(0, 8).map((sub) => (
                <div key={sub._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{sub.task?.title}</p>
                    <p className="text-xs text-slate-400">{format(new Date(sub.submittedAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <Badge variant={sub.status === 'completed' ? 'success' : sub.status === 'submitted' ? 'warning' : 'default'}>
                    {sub.status}
                  </Badge>
                  {sub.score && <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{sub.score}pts</span>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
