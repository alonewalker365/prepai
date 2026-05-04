import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, CheckSquare, ChevronRight, Calendar, Filter } from 'lucide-react';
import { fetchTasks } from '../../store';
import { Card, CardBody, Badge, PageHeader, EmptyState, Skeleton } from '../../components/common/UI';
import { format } from 'date-fns';

const CATEGORIES = ['coding', 'aptitude', 'hr', 'system-design', 'theory', 'communication'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const categoryColor = {
  coding: 'brand', aptitude: 'info', hr: 'success',
  'system-design': 'warning', theory: 'default', communication: 'success',
};

const STATUS_LABEL = {
  pending:      'Pending',
  under_review: '⏳ Under Review',
  completed:    '✅ Accepted',
  rejected:     '❌ Rejected',
};

const statusStyle = {
  pending:      'text-slate-400 bg-slate-100 dark:bg-slate-800',
  under_review: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
  completed:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected:     'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
};

export default function DailyTasksPage() {
  const dispatch = useDispatch();
  const { list, pagination, loading } = useSelector((s) => s.tasks);
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '', date: '' });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchTasks({ ...filters, page, limit: 15 }));
  }, [filters, page, dispatch]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', difficulty: '', search: '', date: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.search || filters.date;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Daily Tasks"
        subtitle="Browse the complete task archive — filter by date, category, or difficulty"
      />

      {/* Search + filter bar */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFilters || hasActiveFilters ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
            >
              <Filter size={14} />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 bg-brand-600 rounded-full" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <select
                value={filters.category}
                onChange={(e) => setFilter('category', e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilter('difficulty', e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilter('date', e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap">
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results count */}
      {pagination && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {list.length} of {pagination.total} tasks
        </p>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {loading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : list.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="Try adjusting your search or filter criteria."
            action={hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
                Clear filters
              </button>
            )}
          />
        ) : (
          list.map((task) => (
            <Link key={task._id} to={`/tasks/${task._id}`}>
              <Card hover className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColor[task.category] === 'brand' ? 'bg-brand-50 dark:bg-brand-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <CheckSquare size={16} className={categoryColor[task.category] === 'brand' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {task.isFeatured && <span className="text-amber-500 text-xs">⭐</span>}
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={categoryColor[task.category] || 'default'}>{task.category}</Badge>
                      <Badge variant={task.difficulty}>{task.difficulty}</Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={11} />
                        {format(new Date(task.scheduledDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{task.points}pts</span>
                    {task.userStatus && (
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap ${statusStyle[task.userStatus] || statusStyle.pending}`}>
                        {STATUS_LABEL[task.userStatus] || 'Pending'}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:border-brand-400 transition-colors"
          >
            ←
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).slice(
            Math.max(0, page - 3), Math.min(pagination.pages, page + 2)
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:border-brand-400 transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
