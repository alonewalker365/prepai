import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Send, BookOpen, Tag, Calendar, Trophy,
  CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { taskAPI } from '../../api/services';
import { getSocket } from '../../api/socket';
import { Card, CardBody, Badge, Button, Textarea } from '../../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const categoryColor = {
  coding: 'brand', aptitude: 'info', hr: 'success',
  'system-design': 'warning', theory: 'default', communication: 'success',
};

// Status display config
const STATUS_CONFIG = {
  under_review: {
    icon: Loader2,
    spin: true,
    label: 'Under Review',
    sublabel: 'Your answer is waiting for admin review.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    badge: 'warning',
  },
  completed: {
    icon: CheckCircle,
    spin: false,
    label: 'Accepted ✅',
    sublabel: 'Admin accepted your answer. Points awarded!',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    badge: 'success',
  },
  rejected: {
    icon: XCircle,
    spin: false,
    label: 'Needs Revision ❌',
    sublabel: 'Admin reviewed and sent feedback. Read it below.',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    badge: 'danger',
  },
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [justReviewed, setJustReviewed] = useState(null); // real-time review event

  // Load task + submission
  useEffect(() => {
    taskAPI.getById(id)
      .then((r) => {
        setTask(r.data.data);
        if (r.data.data.submission) setSubmission(r.data.data.submission);
      })
      .catch(() => { toast.error('Task not found'); navigate('/tasks'); })
      .finally(() => setLoading(false));
  }, [id]);

  // Socket: listen for real-time review result
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (data) => {
      // Only update if this event is about the task we're viewing
      if (data.taskId?.toString() === id || data.taskId === id) {
        setSubmission(prev => prev ? {
          ...prev,
          status: data.status,
          feedback: data.feedback,
          score: data.score,
        } : prev);
        setJustReviewed(data);

        if (data.status === 'completed') {
          toast.success(`✅ Answer accepted! +${data.pointsEarned || 0} points`);
        } else {
          toast.error('❌ Answer needs revision. Check feedback below.');
        }
      }
    };

    socket.on('submission_reviewed', handler);
    return () => socket.off('submission_reviewed', handler);
  }, [id]);

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('Please write your answer before submitting'); return; }
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const { data } = await taskAPI.submit(id, { content: answer.trim(), timeTaken });
      setSubmission(data.data);
      toast.success('Submitted! Waiting for admin review 🕐');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[80, 220, 160].map((h, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" style={{ height: h }} />
        ))}
      </div>
    );
  }
  if (!task) return null;

  const currentSubmission = submission;
  const isSubmitted = !!currentSubmission;
  const statusCfg = currentSubmission ? STATUS_CONFIG[currentSubmission.status] : null;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Tasks
      </button>

      {/* Task card */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display leading-tight">{task.title}</h1>
            <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
              <Badge variant={task.difficulty}>{task.difficulty}</Badge>
              <Badge variant={categoryColor[task.category] || 'default'}>{task.category}</Badge>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {format(new Date(task.scheduledDate), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy size={12} />
              {task.points} points
            </span>
            {task.topic && (
              <span className="flex items-center gap-1.5"><Tag size={12} />{task.topic}</span>
            )}
            {task.deadline && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Clock size={12} />Due {format(new Date(task.deadline), 'MMM d')}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{task.description}</p>

          {task.content && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Problem Statement</p>
              <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">{task.content}</pre>
            </div>
          )}

          {task.resources?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Resources</p>
              {task.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline mb-1">
                  <BookOpen size={12} />{r.title}
                </a>
              ))}
            </div>
          )}

          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Submission area ── */}
      {!isSubmitted ? (
        /* Answer form */
        <Card>
          <CardBody className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">Your Answer</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Write a complete, structured response. Your answer will be reviewed by an admin before being marked as complete.
              </p>
            </div>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={10}
              placeholder={`Write your answer here...

For coding: include your approach, code, and complexity analysis.
For HR/communication: write your structured response.
For aptitude: show your working and final answer.`}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{answer.length} characters</span>
              <Button onClick={handleSubmit} loading={submitting} icon={Send}>
                Submit for Review
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Submitted — show status */
        <div className="space-y-4">
          {/* Status banner */}
          <div className={`rounded-2xl border p-5 ${statusCfg?.bg}`}>
            <div className="flex items-start gap-3">
              <statusCfg.icon
                size={22}
                className={`${statusCfg.color} flex-shrink-0 mt-0.5 ${statusCfg.spin ? 'animate-spin' : ''}`}
              />
              <div className="flex-1">
                <p className={`font-bold text-base ${statusCfg.color}`}>{statusCfg.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{statusCfg.sublabel}</p>

                {/* Score */}
                {currentSubmission.score != null && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Trophy size={14} className="text-amber-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Score: {currentSubmission.score}/100
                    </span>
                  </div>
                )}

                {/* Feedback box */}
                {currentSubmission.feedback && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Admin Feedback
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentSubmission.feedback}
                    </p>
                  </div>
                )}

                {/* Points earned */}
                {currentSubmission.status === 'completed' && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle size={14} />
                    +{task.points} points added to your account
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3">
                  Submitted {format(new Date(currentSubmission.submittedAt || currentSubmission.createdAt), 'MMM d, h:mm a')}
                  {currentSubmission.reviewedAt && (
                    <> · Reviewed {format(new Date(currentSubmission.reviewedAt), 'MMM d, h:mm a')}</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Show submitted answer */}
          {currentSubmission.content && (
            <Card>
              <CardBody className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Your Submitted Answer</p>
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {currentSubmission.content}
                </pre>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
