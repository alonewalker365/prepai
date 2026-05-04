import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './store';
import { connectSocket } from './api/socket';
import { NotFoundPage } from './components/common/PageStates';

// Layouts
import PublicLayout    from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public
import LandingPage       from './pages/public/LandingPage';
import LoginPage         from './pages/public/LoginPage';
import SignupPage        from './pages/public/SignupPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage  from './pages/public/ResetPasswordPage';

// Student
import StudentDashboard   from './pages/student/StudentDashboard';
import DailyTasksPage     from './pages/student/DailyTasksPage';
import TaskDetailPage     from './pages/student/TaskDetailPage';
import CoursesPage        from './pages/student/CoursesPage';
import CourseDetailPage   from './pages/student/CourseDetailPage';
import ProgressPage       from './pages/student/ProgressPage';
import AIInterviewPage    from './pages/student/AIInterviewPage';
import CodingPracticePage from './pages/student/CodingPracticePage';
import ProfilePage        from './pages/student/ProfilePage';
import LeaderboardPage    from './pages/student/LeaderboardPage';
import QuizPage           from './pages/student/QuizPage';
// NEW
import AptitudeQuizPage   from './pages/student/AptitudeQuizPage';
import CodingProblemPage  from './pages/student/CodingProblemPage';
import HRPracticePage     from './pages/student/HRPracticePage';

// Admin
import AdminDashboard        from './pages/admin/AdminDashboard';
import ManageTasksPage       from './pages/admin/ManageTasksPage';
import TaskFormPage          from './pages/admin/TaskFormPage';
import ManageCoursesPage     from './pages/admin/ManageCoursesPage';
import ManageUsersPage       from './pages/admin/ManageUsersPage';
import ManageSubmissionsPage from './pages/admin/ManageSubmissionsPage';
import AnnouncementsPage     from './pages/admin/AnnouncementsPage';
import AdminAnalyticsPage    from './pages/admin/AdminAnalyticsPage';
// NEW
import AdminAptitudeQuizPage from './pages/admin/AdminAptitudeQuizPage';
import AdminCodingPage       from './pages/admin/AdminCodingPage';
import AdminHRPage           from './pages/admin/AdminHRPage';

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

export default function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((s) => s.ui);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    const token = localStorage.getItem('prepwise_token');
    if (token) { dispatch(fetchMe()); connectSocket(token); }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontSize: '13px', fontWeight: '500', borderRadius: '12px', padding: '12px 16px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* ── Public ── */}
        <Route element={<PublicLayout />}>
          <Route path="/"                      element={<LandingPage />} />
          <Route path="/login"                 element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup"                element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Student ── */}
        <Route element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard"    element={<StudentDashboard />} />
          <Route path="/tasks"        element={<DailyTasksPage />} />
          <Route path="/tasks/:id"    element={<TaskDetailPage />} />
          <Route path="/courses"      element={<CoursesPage />} />
          <Route path="/courses/:id"  element={<CourseDetailPage />} />
          <Route path="/progress"     element={<ProgressPage />} />
          <Route path="/interview"    element={<AIInterviewPage />} />
          <Route path="/coding"       element={<CodingPracticePage />} />
          <Route path="/quiz/:id"     element={<QuizPage />} />
          <Route path="/leaderboard"  element={<LeaderboardPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          {/* NEW MODULE ROUTES */}
          <Route path="/aptitude"     element={<AptitudeQuizPage />} />
          <Route path="/problems"     element={<CodingProblemPage />} />
          <Route path="/hr"           element={<HRPracticePage />} />
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout isAdmin /></ProtectedRoute>}>
          <Route path="/admin"                  element={<AdminDashboard />} />
          <Route path="/admin/tasks"            element={<ManageTasksPage />} />
          <Route path="/admin/tasks/new"        element={<TaskFormPage />} />
          <Route path="/admin/tasks/:id/edit"   element={<TaskFormPage />} />
          <Route path="/admin/courses"          element={<ManageCoursesPage />} />
          <Route path="/admin/users"            element={<ManageUsersPage />} />
          <Route path="/admin/submissions"      element={<ManageSubmissionsPage />} />
          <Route path="/admin/announcements"    element={<AnnouncementsPage />} />
          <Route path="/admin/analytics"        element={<AdminAnalyticsPage />} />
          {/* NEW ADMIN MODULE ROUTES */}
          <Route path="/admin/aptitude"         element={<AdminAptitudeQuizPage />} />
          <Route path="/admin/coding"           element={<AdminCodingPage />} />
          <Route path="/admin/hr"               element={<AdminHRPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
