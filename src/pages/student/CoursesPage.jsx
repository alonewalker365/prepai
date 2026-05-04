import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Clock, Users, Star } from 'lucide-react';
import { courseAPI } from '../../api/services';
import { Card, CardBody, Badge, PageHeader, EmptyState, ProgressBar } from '../../components/common/UI';

const CATEGORIES = ['dsa', 'web-dev', 'system-design', 'aptitude', 'soft-skills', 'interview-prep'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const categoryEmoji = { dsa: '⚡', 'web-dev': '🌐', 'system-design': '🏗️', aptitude: '🧮', 'soft-skills': '💬', 'interview-prep': '🎯' };
const categoryGradient = {
  dsa: 'from-brand-500 to-brand-700',
  'web-dev': 'from-sky-500 to-sky-700',
  'system-design': 'from-purple-500 to-purple-700',
  aptitude: 'from-amber-500 to-amber-700',
  'soft-skills': 'from-emerald-500 to-emerald-700',
  'interview-prep': 'from-red-500 to-red-700',
};
const levelVariant = { beginner: 'success', intermediate: 'warning', advanced: 'danger' };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    setLoading(true);
    courseAPI.getAll({ search, category, level })
      .then((r) => {
        const data = r.data.data.courses || [];
        setCourses(data);
        // Build progress map
        const map = {};
        data.forEach((c) => { if (c.userProgress) map[c._id] = c.userProgress; });
        setUserProgress(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, level]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Courses"
        subtitle="Structured learning paths curated for placement success"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!category ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c === category ? '' : c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${c === category ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
            {categoryEmoji[c]} {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Try different search terms or category filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const progress = userProgress[course._id];
            return (
              <Link key={course._id} to={`/courses/${course._id}`}>
                <Card hover className="flex flex-col h-full overflow-hidden">
                  {/* Thumbnail */}
                  <div className={`h-36 bg-gradient-to-br ${categoryGradient[course.category] || 'from-brand-500 to-brand-700'} flex items-center justify-center`}>
                    <span className="text-5xl">{categoryEmoji[course.category] || '📚'}</span>
                  </div>

                  <CardBody className="flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{course.title}</h3>
                      <Badge variant={levelVariant[course.level] || 'default'} className="flex-shrink-0 capitalize">{course.level}</Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {course.totalLessons || 0} lessons</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {course.enrolledCount || 0}</span>
                      {course.rating > 0 && (
                        <span className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {course.rating}</span>
                      )}
                      {course.totalDuration > 0 && (
                        <span className="flex items-center gap-1"><Clock size={11} /> {Math.round(course.totalDuration / 60)}h</span>
                      )}
                    </div>

                    {/* Progress if enrolled */}
                    {progress && (
                      <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500 dark:text-slate-400">Your progress</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400">{progress.completionPercentage || 0}%</span>
                        </div>
                        <ProgressBar value={progress.completionPercentage || 0} max={100} />
                      </div>
                    )}

                    {!progress && (
                      <div className="mt-auto pt-2">
                        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Enroll for free →</span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
