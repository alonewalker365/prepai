import { useState, useRef, useEffect } from 'react';
import { Mic2, Send, RefreshCw, CheckCircle, ChevronRight, Star, MessageSquare, Code2, Brain, Users, Lightbulb, Clock, BarChart3, ArrowLeft } from 'lucide-react';
import { interviewAPI } from '../../api/services';
import { Card, CardBody, Button, Badge, PageHeader } from '../../components/common/UI';
import toast from 'react-hot-toast';

const SESSION_TYPES = [
  { id: 'hr', label: 'HR Interview', icon: Users, color: 'sky', description: 'Behavioral & culture fit questions' },
  { id: 'technical', label: 'Technical', icon: Brain, color: 'brand', description: 'CS fundamentals & system concepts' },
  { id: 'coding', label: 'Coding Round', icon: Code2, color: 'emerald', description: 'DSA & problem solving' },
  { id: 'behavioral', label: 'Behavioral', icon: MessageSquare, color: 'amber', description: 'STAR method scenarios' },
  { id: 'system-design', label: 'System Design', icon: BarChart3, color: 'red', description: 'Architecture & scalability' },
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const ScoreRing = ({ score, size = 80 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="14" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
};

function FeedbackCard({ feedback }) {
  if (!feedback) return null;
  const verdictColors = {
    'Excellent': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Good': 'text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400',
    'Average': 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
    'Needs Improvement': 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Feedback</h3>
        <div className="flex items-center gap-3">
          <ScoreRing score={feedback.score || 0} />
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${verdictColors[feedback.verdict] || verdictColors['Average']}`}>
            {feedback.verdict}
          </span>
        </div>
      </div>

      {feedback.strengths?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">✓ Strengths</p>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.weaknesses?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">✗ Areas to improve</p>
          <ul className="space-y-1">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvementTips?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">💡 Tips</p>
          <ul className="space-y-1">
            {feedback.improvementTips.map((t, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <Lightbulb size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.modelAnswer && (
        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Model Answer</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{feedback.modelAnswer}</p>
        </div>
      )}
    </div>
  );
}

export default function AIInterviewPage() {
  const [phase, setPhase] = useState('select'); // select | session | history
  const [selectedType, setSelectedType] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [sessionResults, setSessionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const answerRef = useRef(null);

  useEffect(() => {
    if (phase === 'session' && !feedback) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, feedback]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startSession = async () => {
    if (!selectedType) { toast.error('Select an interview type'); return; }
    setLoading(true);
    try {
      const [{ data: qData }, { data: sData }] = await Promise.all([
        interviewAPI.generateQuestions({ type: selectedType.id, difficulty, count: 5 }),
        interviewAPI.createSession({ type: selectedType.id }),
      ]);
      setQuestions(qData.data.questions);
      setSessionId(sData.data._id);
      setCurrentQ(0);
      setFeedback(null);
      setAnswer('');
      setSessionResults([]);
      setTimer(0);
      setPhase('session');
    } catch {
      toast.error('Failed to generate questions. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!answer.trim()) { toast.error('Please write your answer'); return; }
    setEvaluating(true);
    clearInterval(timerRef.current);
    try {
      const { data } = await interviewAPI.evaluate({
        question: questions[currentQ].question,
        answer,
        type: selectedType.id,
      });
      setFeedback(data.data);
      setSessionResults(prev => [...prev, {
        question: questions[currentQ].question,
        answer,
        aiFeedback: JSON.stringify(data.data),
        score: data.data.score,
        improvementTips: data.data.improvementTips,
      }]);
    } catch {
      toast.error('Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(c => c + 1);
      setAnswer('');
      setFeedback(null);
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    if (sessionId && sessionResults.length > 0) {
      const avgScore = Math.round(sessionResults.reduce((a, r) => a + (r.score || 0), 0) / sessionResults.length);
      try {
        await interviewAPI.updateSession(sessionId, {
          questions: sessionResults,
          overallScore: avgScore,
          duration: timer,
          status: 'completed',
        });
      } catch {}
    }
    setPhase('complete');
  };

  const avgScore = sessionResults.length > 0
    ? Math.round(sessionResults.reduce((a, r) => a + (r.score || 0), 0) / sessionResults.length)
    : 0;

  // PHASE: SELECT
  if (phase === 'select') {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <PageHeader
          title="AI Mock Interview"
          subtitle="Practice with AI-powered questions and get real-time feedback on your answers"
        />

        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Interview Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SESSION_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType?.id === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-100 dark:bg-brand-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Icon size={16} className={isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>{type.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize
                  ${difficulty === d
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                  }`}
              >{d}</button>
            ))}
          </div>
        </div>

        <Button onClick={startSession} loading={loading} size="lg" icon={Mic2}>
          Start Interview Session
        </Button>
      </div>
    );
  }

  // PHASE: COMPLETE
  if (phase === 'complete') {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Session Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">You answered {sessionResults.length} questions</p>
        </div>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <ScoreRing score={avgScore} size={100} />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">Overall Score</p>
          </div>
          <div className="text-center space-y-3">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessionResults.length}</p>
              <p className="text-xs text-slate-500">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedType?.label}</p>
              <p className="text-xs text-slate-500">Type</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => { setPhase('select'); setSelectedType(null); }} icon={ArrowLeft}>
            New Session
          </Button>
          <Button onClick={() => setPhase('select')}>Try Another Type</Button>
        </div>
      </div>
    );
  }

  // PHASE: SESSION
  const q = questions[currentQ];
  const progress = ((currentQ + (feedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase('select')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white font-display">{selectedType?.label}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Question {currentQ + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!feedback && (
            <div className="flex items-center gap-1.5 text-sm font-mono text-slate-500 dark:text-slate-400">
              <Clock size={14} />
              {formatTime(timer)}
            </div>
          )}
          <Badge variant={difficulty === 'easy' ? 'easy' : difficulty === 'hard' ? 'hard' : 'medium'}>
            {difficulty}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <Card>
        <CardBody className="p-6">
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-3">Question {currentQ + 1}</p>
          <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed">{q?.question}</p>
          {q?.tips?.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Hint</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{q.tips[0]}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Answer */}
      {!feedback ? (
        <Card>
          <CardBody className="p-5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">Your Answer</label>
            <textarea
              ref={answerRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={7}
              placeholder="Write your answer here. Be detailed and structured..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent leading-relaxed"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400">{answer.length} characters</span>
              <Button onClick={evaluateAnswer} loading={evaluating} icon={Send}>
                Submit & Get Feedback
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-5">
            <FeedbackCard feedback={feedback} />
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={nextQuestion} icon={ChevronRight}>
                {currentQ + 1 < questions.length ? 'Next Question' : 'Finish Session'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
