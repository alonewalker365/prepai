import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckSquare, Flame, Trophy, BookOpen, Mic2, ArrowRight, Clock, Target, Star } from 'lucide-react';
import { fetchTodayTasks, fetchMyAnalytics } from '../../store';
import { Card, CardBody, StatCard, Badge, Button, ProgressBar, SectionHeader, SkeletonCard, EmptyState } from '../../components/common/UI';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { getSocket } from '../../api/socket';
import toast from 'react-hot-toast';

const categoryColor = {
  coding: 'brand',
  aptitude: 'info',
  hr: 'success',
  'system-design': 'warning',
  theory: 'default',
  communication: 'success',
};

const statusStyles = {
  pending:      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  under_review: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected:     'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABEL = {
  pending: 'Pending',
  under_review: '⏳ Under Review',
  completed: '✅ Accepted',
  rejected: '❌ Rejected',
};

function TaskRow({ task }) {
  const dotColor = {
    pending: 'bg-slate-300 dark:bg-slate-600',
    under_review: 'bg-amber-400',
    completed: 'bg-emerald-500',
    rejected: 'bg-red-500',
  }[task.userStatus] || 'bg-slate-300';

  return (
    <Link
      to={`/tasks/${task._id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={categoryColor[task.category] || 'default'}>{task.category}</Badge>
          <Badge variant={task.difficulty}>{task.difficulty}</Badge>
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap ${statusStyles[task.userStatus] || statusStyles.pending}`}>
        {STATUS_LABEL[task.userStatus] || 'Pending'}
      </span>
    </Link>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-900 dark:text-white mb-0.5">{label}</p>
      <p className="text-brand-600 dark:text-brand-400">{payload[0]?.value} tasks</p>
    </div>
  );
};

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { today, loading: tasksLoading } = useSelector((s) => s.tasks);
  const { mine: analytics, loading: analyticsLoading } = useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchTodayTasks());
    dispatch(fetchMyAnalytics());
  }, [dispatch]);

  // Real-time: when admin reviews a submission, refresh today's tasks
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data) => {
      dispatch(fetchTodayTasks()); // refresh to reflect new status
      dispatch(fetchMyAnalytics());
    };
    socket.on('submission_reviewed', handler);
    return () => socket.off('submission_reviewed', handler);
  }, [dispatch]);

  const completedToday = today.filter(t => t.userStatus === 'completed').length;
  const underReviewToday = today.filter(t => t.userStatus === 'under_review').length;
  const totalToday = today.length;

  const chartData = analytics?.weeklyActivity?.slice(-14).map(d => ({
    date: format(parseISO(d._id), 'MMM d'),
    tasks: d.count,
  })) || [];

  const courseProgress = analytics?.progress?.coursesEnrolled?.slice(0, 3) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {format(new Date(), 'EEEE, MMMM d')} · {completedToday}/{totalToday} tasks done today
          </p>
        </div>
        <Link to="/tasks">
          <Button variant="primary" size="sm" icon={ArrowRight}>View All Tasks</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current Streak" value={`${user?.streak || 0}d`} icon={Flame} color="amber" subtitle="Keep it going!" />
        <StatCard label="Tasks Completed" value={analytics?.progress?.totalTasksCompleted || 0} icon={CheckSquare} color="emerald" />
        <StatCard label="Total Points" value={user?.totalPoints || 0} icon={Trophy} color="brand" />
        <StatCard label="Courses Enrolled" value={courseProgress.length} icon={BookOpen} color="sky" />
      </div>

      {/* Today's Tasks + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's tasks */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Today's Tasks</h2>
                <div className="flex items-center gap-2 mt-1">
                  <ProgressBar value={completedToday} max={totalToday || 1} className="w-24" />
                  <span className="text-xs text-slate-500">{completedToday}/{totalToday} done</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={completedToday === totalToday && totalToday > 0 ? 'success' : 'default'}>
                  {completedToday === totalToday && totalToday > 0 ? '🎉 All accepted!' : `${completedToday} accepted`}
                </Badge>
                {underReviewToday > 0 && (
                  <Badge variant="warning">⏳ {underReviewToday} pending review</Badge>
                )}
              </div>
            </div>
            <CardBody className="p-2">
              {tasksLoading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                </div>
              ) : today.length === 0 ? (
                <EmptyState icon={CheckSquare} title="No tasks today" description="Check back later or browse the task archive." />
              ) : (
                <div className="space-y-1">
                  {today.map(task => <TaskRow key={task._id} task={task} />)}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Activity chart */}
        <div>
          <Card className="h-full">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Activity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last 14 days</p>
            </div>
            <CardBody>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2} fill="url(#actGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-sm text-slate-400">No activity yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Quick actions + Course progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <Card className="p-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/interview', icon: Mic2, label: 'Start Mock Interview', color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-400' },
              { to: '/coding', icon: Target, label: 'Practice Coding', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
              { to: '/courses', icon: BookOpen, label: 'Continue Learning', color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400' },
              { to: '/leaderboard', icon: Trophy, label: 'View Leaderboard', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                <div className={`p-2 rounded-lg ${color}`}><Icon size={16} /></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{label}</span>
                <ArrowRight size={14} className="ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Course progress */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Course Progress</h2>
              <Link to="/courses" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">View all</Link>
            </div>
            <CardBody>
              {courseProgress.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No courses enrolled"
                  description="Start a course to track your progress here."
                  action={<Link to="/courses"><Button size="sm">Browse Courses</Button></Link>}
                />
              ) : (
                <div className="space-y-5">
                  {courseProgress.map((c) => (
                    <div key={c.course?._id}>
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/courses/${c.course?._id}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                          {c.course?.title || 'Course'}
                        </Link>
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{c.completionPercentage}%</span>
                      </div>
                      <ProgressBar value={c.completionPercentage} max={100} />
                      <p className="text-xs text-slate-400 mt-1">{c.completedLessons?.length || 0} lessons completed</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      {analytics?.recentSubmissions?.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Recent Submissions</h2>
          </div>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics.recentSubmissions.slice(0, 5).map((sub) => (
                <div key={sub._id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckSquare size={14} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{sub.task?.title}</p>
                    <p className="text-xs text-slate-400">{format(new Date(sub.submittedAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <Badge variant={sub.status === 'completed' ? 'success' : 'warning'}>{sub.status}</Badge>
                  {sub.score && <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{sub.score}pts</span>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
