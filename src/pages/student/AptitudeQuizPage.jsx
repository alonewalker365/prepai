import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  AlertCircle, Trophy, Target, BookOpen, Zap, RotateCcw,
  AlertTriangle, Flag,
} from 'lucide-react';
import { aptitudeAPI } from '../../api/services';
import { Card, CardBody, Badge, Button, PageHeader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';

const TOPIC_META = {
  quantitative:        { label: 'Quantitative', emoji: '🔢', color: 'brand' },
  logical:             { label: 'Logical',       emoji: '🧠', color: 'sky' },
  verbal:              { label: 'Verbal',         emoji: '📖', color: 'emerald' },
  'data-interpretation':{ label: 'Data Interp.',  emoji: '📊', color: 'amber' },
  'general-knowledge': { label: 'GK',             emoji: '🌍', color: 'purple' },
  reasoning:           { label: 'Reasoning',      emoji: '💡', color: 'red' },
  'technical': {label:'Technical', emoji:'💻' , color: 'pink'}
};

// ── Circular timer ────────────────────────────────────────────────────────────
function CircularTimer({ timeLeft, totalTime }) {
  const pct = timeLeft / totalTime;
  const r = 28, circ = 2 * Math.PI * r;
  const color = pct > 0.4 ? '#10b981' : pct > 0.15 ? '#f59e0b' : '#ef4444';
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.5s, stroke 0.5s' }} />
      <text x="36" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{mins}:{secs}</text>
      <text x="36" y="47" textAnchor="middle" fontSize="8" fill="#94a3b8">left</text>
    </svg>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ result, quiz, onRetake, onBack }) {
  const { percentage, score, totalPoints, passed, correctCount, wrongCount, unansweredCount, questions } = result;
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Score card */}
      <Card>
        <CardBody className="p-8 text-center space-y-4">
          <div className="text-6xl">{passed ? '🎉' : '📚'}</div>
          <div>
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">{percentage}%</h2>
            <p className={`text-lg font-semibold mt-1 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {passed ? 'Passed!' : 'Keep Practicing!'}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
            {[
              { label: 'Score',      value: `${score}/${totalPoints}`, color: 'text-brand-600 dark:text-brand-400' },
              { label: '✅ Correct', value: correctCount,              color: 'text-emerald-600 dark:text-emerald-400' },
              { label: '❌ Wrong',   value: wrongCount,                color: 'text-red-600 dark:text-red-400' },
              { label: '⏭ Skipped', value: unansweredCount,           color: 'text-slate-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Passing score: {quiz.passingScore}% · Your score: {percentage}%
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="secondary" icon={RotateCcw} onClick={onRetake}>Try Again</Button>
            <Button onClick={() => setShowReview(r => !r)} icon={BookOpen}>
              {showReview ? 'Hide Review' : 'Review Answers'}
            </Button>
            <Button variant="ghost" icon={ChevronLeft} onClick={onBack}>Back to Quizzes</Button>
          </div>
        </CardBody>
      </Card>

      {/* Answer review */}
      {showReview && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Answer Review</h3>
          {questions.map((q, i) => (
            <Card key={i} className={`border-l-4 ${q.isCorrect ? 'border-l-emerald-500' : q.selectedOption === -1 ? 'border-l-slate-400' : 'border-l-red-500'}`}>
              <CardBody className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  {q.isCorrect
                    ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : q.selectedOption === -1
                    ? <AlertCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    Q{i + 1}. {q.questionText}
                  </p>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${q.isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {q.pointsEarned > 0 ? '+' : ''}{q.pointsEarned}/{q.maxPoints}
                  </span>
                </div>
                <div className="space-y-1.5 pl-6">
                  {q.options.map((opt, oi) => {
                    const isSelected = oi === q.selectedOption;
                    const isCorrect = opt.isCorrect;
                    let cls = 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
                    if (isCorrect) cls = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 font-semibold';
                    if (isSelected && !isCorrect) cls = 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 line-through';
                    return (
                      <div key={oi} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${cls}`}>
                        <span className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-bold border-current">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt.text}
                        {isCorrect && <CheckCircle size={12} className="ml-auto text-emerald-500" />}
                        {isSelected && !isCorrect && <XCircle size={12} className="ml-auto text-red-500" />}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div className="pl-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Explanation</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">{q.explanation}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AptitudeQuizPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('list'); // list | quiz | result
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [questionTimes, setQuestionTimes] = useState({});
  const [qStartTime, setQStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    aptitudeAPI.getAll()
      .then(r => setQuizzes(r.data.data || []))
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'quiz') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startQuiz = async (quiz) => {
    try {
      const { data } = await aptitudeAPI.start(quiz._id);
      setAttemptId(data.data._id);
      setActiveQuiz(quiz);
      setCurrentQ(0);
      setAnswers({});
      setQuestionTimes({});
      const secs = quiz.timeLimit * 60;
      setTimeLeft(secs);
      setTotalTime(secs);
      setQStartTime(Date.now());
      setPhase('quiz');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  const selectAnswer = (optionIdx) => {
    setAnswers(a => ({ ...a, [currentQ]: optionIdx }));
  };

  const goToQuestion = (idx) => {
    // Record time on current question
    const elapsed = Math.round((Date.now() - qStartTime) / 1000);
    setQuestionTimes(qt => ({ ...qt, [currentQ]: (qt[currentQ] || 0) + elapsed }));
    setQStartTime(Date.now());
    setCurrentQ(idx);
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    if (!auto) {
      const unanswered = activeQuiz.questions.length - Object.keys(answers).length;
      if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const elapsed = Math.round((Date.now() - qStartTime) / 1000);
      const finalQTimes = { ...questionTimes, [currentQ]: (questionTimes[currentQ] || 0) + elapsed };

      const answersArr = Object.entries(answers).map(([qi, opt]) => ({
        questionIndex: Number(qi),
        selectedOption: opt,
        timeTaken: finalQTimes[qi] || 0,
      }));

      const { data } = await aptitudeAPI.submit({
        attemptId,
        answers: answersArr,
        timeTaken: totalTime - timeLeft,
      });
      setResult(data.data);
      setPhase('result');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [submitting, activeQuiz, answers, attemptId, timeLeft, totalTime, currentQ, qStartTime, questionTimes]);

  const filteredQuizzes = filter
    ? quizzes.filter(q => q.topic === filter)
    : quizzes;

  // ── PHASE: RESULT ─────────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <ResultScreen
        result={result}
        quiz={activeQuiz}
        onRetake={() => startQuiz(activeQuiz)}
        onBack={() => { setPhase('list'); setActiveQuiz(null); }}
      />
    );
  }

  // ── PHASE: QUIZ ───────────────────────────────────────────────────────────
  if (phase === 'quiz' && activeQuiz) {
    const q = activeQuiz.questions[currentQ];
    const totalQ = activeQuiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{activeQuiz.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{answeredCount}/{totalQ} answered</p>
          </div>
          <CircularTimer timeLeft={timeLeft} totalTime={totalTime} />
          <Button
            variant="danger"
            size="sm"
            icon={Flag}
            loading={submitting}
            onClick={() => handleSubmit(false)}
          >
            Submit
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }} />
        </div>

        {/* Question */}
        <Card>
          <CardBody className="p-6 space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-sm font-bold">
                {currentQ + 1}
              </span>
              <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed flex-1">{q.text}</p>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400">+{q.points}pts</p>
                {q.negativeMark > 0 && <p className="text-xs text-red-500">-{q.negativeMark}pts wrong</p>}
              </div>
            </div>

            <div className="space-y-2.5">
              {q.options.map((opt, oi) => {
                const isSelected = answers[currentQ] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => selectAnswer(oi)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <span className="flex-1">{opt.text}</span>
                    {isSelected && <CheckCircle size={16} className="text-brand-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" icon={ChevronLeft} onClick={() => goToQuestion(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
            Previous
          </Button>

          {/* Question palette */}
          <div className="flex flex-wrap gap-1 max-w-xs justify-center">
            {activeQuiz.questions.map((_, qi) => (
              <button
                key={qi}
                onClick={() => goToQuestion(qi)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  qi === currentQ ? 'bg-brand-600 text-white ring-2 ring-brand-400 ring-offset-1'
                  : answers[qi] !== undefined ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {qi + 1}
              </button>
            ))}
          </div>

          {currentQ < totalQ - 1
            ? <Button icon={ChevronRight} onClick={() => goToQuestion(currentQ + 1)}>Next</Button>
            : <Button onClick={() => handleSubmit(false)} loading={submitting}>Submit Quiz</Button>
          }
        </div>

        {/* Negative marking warning */}
        {activeQuiz.questions.some(q => q.negativeMark > 0) && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Negative marking active.</strong> Wrong answers deduct points. Skip if unsure.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── PHASE: LIST ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Aptitude Quizzes" subtitle="Timed quizzes with instant AI evaluation and detailed answer review" />

      {/* Topic filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!filter ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
          All Topics
        </button>
        {Object.entries(TOPIC_META).map(([key, { label, emoji }]) => (
          <button key={key} onClick={() => setFilter(f => f === key ? '' : key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === key ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState icon={BookOpen} title="No quizzes available" description="Check back later or try a different topic." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map(quiz => {
            const meta = TOPIC_META[quiz.topic] || { label: quiz.topic, emoji: '📋', color: 'default' };
            return (
              <Card key={quiz._id} hover className="flex flex-col">
                <CardBody className="flex flex-col gap-3 flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{meta.emoji}</span>
                        <Badge variant={meta.color}>{meta.label}</Badge>
                        <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{quiz.title}</h3>
                      {quiz.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {quiz.questionCount} Qs</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {quiz.timeLimit}m</span>
                    <span className="flex items-center gap-1"><Target size={11} /> Pass: {quiz.passingScore}%</span>
                  </div>

                  {quiz.myBestScore !== null && (
                    <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${quiz.myBestPercentage >= quiz.passingScore ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                      {quiz.myBestPercentage >= quiz.passingScore ? '✅' : '❌'}
                      Best: {quiz.myBestPercentage}% ({quiz.myBestScore}pts)
                    </div>
                  )}

                  <Button
                    className="mt-auto"
                    variant={quiz.attempted ? 'secondary' : 'primary'}
                    icon={quiz.attempted ? RotateCcw : Zap}
                    onClick={() => startQuiz(quiz)}
                  >
                    {quiz.attempted ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
