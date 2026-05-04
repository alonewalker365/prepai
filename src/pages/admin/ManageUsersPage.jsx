import { useState, useEffect, useCallback } from 'react';
import { Search, Users, UserCheck, UserX, Eye } from 'lucide-react';
import { userAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState, StatCard } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params = { search, role: 'student', page, limit: LIMIT };
    if (statusFilter !== '') params.isActive = statusFilter;
    userAPI.getAll(params)
      .then((r) => { setUsers(r.data.data.users || []); setTotal(r.data.data.pagination?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id, isActive, name) => {
    try {
      await userAPI.toggleStatus(id, !isActive);
      setUsers((u) => u.map((user) => user._id === id ? { ...user, isActive: !isActive } : user));
      toast.success(`${name} ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user status'); }
  };

  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Manage Users"
        subtitle={`${total} students registered on the platform`}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Students" value={total} icon={Users} color="brand" />
        <StatCard label="Active" value={activeCount} icon={UserCheck} color="emerald" />
        <StatCard label="Inactive" value={users.length - activeCount} icon={UserX} color="red" />
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Users</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </CardBody>
      </Card>

      {/* Users table */}
      <Card>
        <CardBody className="p-0">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="flex-1">User</span>
            <span className="hidden sm:block w-20 text-center">Points</span>
            <span className="hidden md:block w-16 text-center">Streak</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-24 text-center">Actions</span>
          </div>

          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="py-12"><EmptyState icon={Users} title="No users found" description="Try adjusting your search" /></div>
          ) : (
            users.map((u) => (
              <div key={u._id} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${u.isActive ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  {u.preferredRole && <p className="text-xs text-slate-400 mt-0.5">{u.preferredRole}</p>}
                </div>
                <div className="hidden sm:block w-20 text-center">
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{u.totalPoints}</span>
                  <p className="text-xs text-slate-400">pts</p>
                </div>
                <div className="hidden md:block w-16 text-center">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">🔥{u.streak}</span>
                </div>
                <div className="w-20 text-center">
                  <Badge variant={u.isActive ? 'success' : 'danger'}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="w-24 flex items-center justify-center gap-1">
                  <button
                    onClick={() => toggleStatus(u._id, u.isActive, u.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex justify-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40">←</button>
          <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}
