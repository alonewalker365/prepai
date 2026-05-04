import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import { quizAPI } from '../../api/services';
import { Card, CardBody, Button, Badge, PageHeader } from '../../components/common/UI';
import toast from 'react-hot-toast';

const ScoreRing = ({ score, size = 96 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="800" fill={color}>{score}%</text>
    </svg>
  );
};

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    quizAPI.getById(id)
      .then((r) => { setQuiz(r.data.data); setTimeLeft((r.data.data.timeLimit || 30) * 60); })
      .catch(() => { toast.error('Quiz not found'); navigate('/courses'); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (phase !== 'quiz') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const answerArray = quiz.questions.map((_, i) => answers[i] || '');
    try {
      const { data } = await quizAPI.submit(id, answerArray);
      setResult(data.data);
      setPhase('result');
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const isTimeLow = timeLeft < 60;

  if (loading) return <div className="max-w-2xl space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>;
  if (!quiz) return null;

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="max-w-xl space-y-5 animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <Card>
          <CardBody className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto">
              <Trophy className="text-brand-600 dark:text-brand-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{quiz.title}</h1>
              {quiz.description && <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{quiz.description}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{quiz.questions?.length}</p>
                <p className="text-xs text-slate-500">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{quiz.timeLimit}m</p>
                <p className="text-xs text-slate-500">Time Limit</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{quiz.passingScore}%</p>
                <p className="text-xs text-slate-500">Pass Score</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>• Each question has one correct answer</p>
              <p>• Timer starts when you click Begin</p>
              <p>• You can navigate between questions</p>
            </div>
            <Button onClick={() => setPhase('quiz')} size="lg" className="w-full">Begin Quiz</Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // RESULT
  if (phase === 'result' && result) {
    const { percentage, passed, score, totalPoints, results } = result;
    return (
      <div className="max-w-2xl space-y-5 animate-fade-in">
        <Card>
          <CardBody className="p-8 text-center space-y-5">
            <div className="flex justify-center"><ScoreRing score={percentage} /></div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{passed ? '🎉 You Passed!' : '😔 Not Quite'}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {score} / {totalPoints} points · {passed ? 'Great job!' : `Need ${quiz.passingScore}% to pass`}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${passed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {passed ? 'Passed' : 'Failed'}
            </div>
          </CardBody>
        </Card>

        {/* Review */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">Review Answers</h2>
          {results?.map((r, i) => (
            <Card key={i} className={`border-l-4 ${r.isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <CardBody className="p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Q{i + 1}. {r.question}</p>
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 flex-shrink-0 ${r.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                    {r.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </span>
                  <div className="text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      Your answer: <span className={`font-medium ${r.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{r.selected || '(not answered)'}</span>
                    </p>
                    {!r.isCorrect && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct: {r.correct}</p>}
                    {r.explanation && <p className="text-xs text-slate-400 mt-1">{r.explanation}</p>}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => { setPhase('intro'); setAnswers({}); setCurrent(0); setTimeLeft(quiz.timeLimit * 60); }} variant="secondary">
            Retake Quiz
          </Button>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  // QUIZ
  const q = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white font-display">{quiz.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Question {current + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-xl ${isTimeLow ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
          <Clock size={14} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <Card>
        <CardBody className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">Question {current + 1}</p>
            <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed">{q.text}</p>
          </div>

          <div className="space-y-2.5">
            {q.options?.map((option, optIdx) => {
              const isSelected = answers[current] === option.text;
              return (
                <button
                  key={optIdx}
                  onClick={() => setAnswers((a) => ({ ...a, [current]: option.text }))}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} icon={ArrowLeft}>
          Previous
        </Button>

        <div className="flex gap-1">
          {quiz.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${i === current ? 'bg-brand-600 text-white' : answers[i] ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>

        {current < quiz.questions.length - 1 ? (
          <Button onClick={() => setCurrent((c) => c + 1)} icon={ArrowRight}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} variant="primary">
            Submit Quiz ({answered}/{quiz.questions.length} answered)
          </Button>
        )}
      </div>
    </div>
  );
}
