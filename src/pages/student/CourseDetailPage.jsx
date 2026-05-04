import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, PlayCircle, Clock, Users, Star, BookOpen, Lock } from 'lucide-react';
import { courseAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, ProgressBar, PageHeader } from '../../components/common/UI';
import toast from 'react-hot-toast';

const categoryGradient = {
  dsa: 'from-brand-500 to-brand-700', 'web-dev': 'from-sky-500 to-sky-700',
  'system-design': 'from-purple-500 to-purple-700', aptitude: 'from-amber-500 to-amber-700',
  'soft-skills': 'from-emerald-500 to-emerald-700', 'interview-prep': 'from-red-500 to-red-700',
};
const categoryEmoji = { dsa: '⚡', 'web-dev': '🌐', 'system-design': '🏗️', aptitude: '🧮', 'soft-skills': '💬', 'interview-prep': '🎯' };

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState([0]);

  useEffect(() => {
    courseAPI.getById(id)
      .then((r) => setData(r.data.data))
      .catch(() => { toast.error('Course not found'); navigate('/courses'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await courseAPI.enroll(id);
      toast.success('Enrolled successfully! 🎉');
      setData((d) => ({ ...d, userProgress: { completionPercentage: 0, completedLessons: [], enrolledAt: new Date() } }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const markLesson = async (lessonId) => {
    if (!data.userProgress) return;
    const completed = data.userProgress.completedLessons || [];
    if (completed.includes(lessonId)) return;
    const newCompleted = [...completed, lessonId];
    const total = data.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 1;
    const pct = Math.round((newCompleted.length / total) * 100);

    try {
      await courseAPI.updateProgress(id, { lessonId, completionPercentage: pct });
      setData((d) => ({
        ...d,
        userProgress: { ...d.userProgress, completedLessons: newCompleted, completionPercentage: pct },
      }));
      toast.success('Lesson completed!');
    } catch {}
  };

  const toggleModule = (idx) => {
    setOpenModules((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-5">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        {[1,2].map(i => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }
  if (!data) return null;

  const { userProgress } = data;
  const isEnrolled = Boolean(userProgress);
  const completedLessons = userProgress?.completedLessons || [];
  const totalLessons = data.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
        <ArrowLeft size={14} /> Back to Courses
      </Link>

      {/* Hero banner */}
      <div className={`h-44 bg-gradient-to-br ${categoryGradient[data.category] || 'from-brand-500 to-brand-700'} rounded-2xl flex items-center justify-center`}>
        <span className="text-7xl">{categoryEmoji[data.category] || '📚'}</span>
      </div>

      {/* Title + enrollment */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="brand" className="capitalize">{data.category}</Badge>
            <Badge variant={data.level === 'beginner' ? 'success' : data.level === 'advanced' ? 'danger' : 'warning'} className="capitalize">
              {data.level}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{data.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{data.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><BookOpen size={12} /> {totalLessons} lessons</span>
            <span className="flex items-center gap-1"><Users size={12} /> {data.enrolledCount || 0} enrolled</span>
            {data.rating > 0 && <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {data.rating}</span>}
            {data.totalDuration > 0 && <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(data.totalDuration / 60)}h total</span>}
          </div>
        </div>

        {!isEnrolled ? (
          <Button onClick={handleEnroll} loading={enrolling} size="lg" className="flex-shrink-0">
            Enroll Free
          </Button>
        ) : (
          <div className="flex-shrink-0 text-center">
            <Badge variant="success" className="mb-2">✓ Enrolled</Badge>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userProgress.completionPercentage || 0}% done</p>
          </div>
        )}
      </div>

      {/* Progress bar (if enrolled) */}
      {isEnrolled && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-semibold text-slate-900 dark:text-white">Your Progress</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{completedLessons.length}/{totalLessons} lessons</span>
            </div>
            <ProgressBar value={userProgress.completionPercentage || 0} max={100} showLabel />
          </CardBody>
        </Card>
      )}

      {/* Modules */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Course Content</h2>
        {(data.modules || []).map((mod, modIdx) => {
          const isOpen = openModules.includes(modIdx);
          const modCompleted = (mod.lessons || []).filter((l) => completedLessons.includes(l._id)).length;
          return (
            <Card key={mod._id || modIdx}>
              <button
                onClick={() => toggleModule(modIdx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${modCompleted === (mod.lessons?.length || 0) && mod.lessons?.length > 0 ? 'bg-emerald-500 text-white' : 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400'}`}>
                    {modCompleted === (mod.lessons?.length || 0) && mod.lessons?.length > 0 ? '✓' : modIdx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{mod.title}</p>
                    <p className="text-xs text-slate-400">{modCompleted}/{mod.lessons?.length || 0} lessons done</p>
                  </div>
                </div>
                <span className="text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800">
                  {(mod.lessons || []).map((lesson, lessonIdx) => {
                    const isDone = completedLessons.includes(lesson._id);
                    const canAccess = isEnrolled || lesson.isPreview;
                    return (
                      <div
                        key={lesson._id || lessonIdx}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        <button
                          onClick={() => canAccess && isEnrolled && markLesson(lesson._id)}
                          disabled={!isEnrolled}
                          className="flex-shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle size={18} className="text-emerald-500" />
                          ) : (
                            <Circle size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-400 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                            {lesson.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lesson.isPreview && <Badge variant="brand">Preview</Badge>}
                          {lesson.duration > 0 && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={10} /> {lesson.duration}m
                            </span>
                          )}
                          {!canAccess && <Lock size={12} className="text-slate-300 dark:text-slate-600" />}
                          {canAccess && <PlayCircle size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
