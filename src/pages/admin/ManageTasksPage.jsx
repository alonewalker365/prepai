// ManageTasksPage.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit, Trash2, CheckSquare, Star } from 'lucide-react';
import { fetchTasks } from '../../store';
import { taskAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState } from '../../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function ManageTasksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((s) => s.tasks);

  useEffect(() => { dispatch(fetchTasks({ limit: 50 })); }, [dispatch]);

  const deleteTask = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      dispatch(fetchTasks({ limit: 50 }));
    } catch { toast.error('Delete failed'); }
  };

  const categoryColor = { coding: 'brand', aptitude: 'info', hr: 'success', 'system-design': 'warning', theory: 'default', communication: 'success' };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Manage Tasks"
        subtitle="Create, edit, and schedule daily tasks for learners"
        action={<Link to="/admin/tasks/new"><Button icon={Plus}>New Task</Button></Link>}
      />

      <Card>
        <CardBody className="p-0">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <span className="flex-1">Task</span>
            <span className="hidden sm:block w-24 text-center">Date</span>
            <span className="hidden md:block w-20 text-center">Points</span>
            <span className="w-24 text-center">Submissions</span>
            <span className="w-20 text-center">Actions</span>
          </div>

          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-800">
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse hidden sm:block" />
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse hidden md:block" />
              </div>
            ))
          ) : list.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CheckSquare}
                title="No tasks yet"
                description="Create your first task to get learners started."
                action={<Link to="/admin/tasks/new"><Button>Create First Task</Button></Link>}
              />
            </div>
          ) : (
            list.map((task) => (
              <div key={task._id} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {task.isFeatured && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{task.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={categoryColor[task.category] || 'default'}>{task.category}</Badge>
                    <Badge variant={task.difficulty}>{task.difficulty}</Badge>
                    {!task.isPublished && <Badge variant="default">Draft</Badge>}
                  </div>
                </div>
                <div className="hidden sm:block w-24 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(task.scheduledDate), 'MMM d, yyyy')}</span>
                </div>
                <div className="hidden md:block w-20 text-center">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{task.points}pts</span>
                </div>
                <div className="w-24 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{task.submissionCount || 0} submissions</span>
                </div>
                <div className="w-20 flex items-center justify-center gap-1">
                  <button
                    onClick={() => navigate(`/admin/tasks/${task._id}/edit`)}
                    className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteTask(task._id, task.title)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ManageTasksPage;
