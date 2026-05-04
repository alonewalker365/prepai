import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)          => api.post('/auth/register', data),
  login:          (data)          => api.post('/auth/login', data),
  getMe:          ()              => api.get('/auth/me'),
  updateProfile:  (data)          => api.put('/auth/me', data),
  forgotPassword: (email)         => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, pass)   => api.put(`/auth/reset-password/${token}`, { password: pass }),
  changePassword: (data)          => api.put('/auth/change-password', data),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const taskAPI = {
  getToday: ()           => api.get('/tasks/today'),
  getAll:   (params)     => api.get('/tasks', { params }),
  getById:  (id)         => api.get(`/tasks/${id}`),
  create:   (data)       => api.post('/tasks', data),
  update:   (id, data)   => api.put(`/tasks/${id}`, data),
  delete:   (id)         => api.delete(`/tasks/${id}`),
  submit:   (id, data)   => api.post(`/tasks/${id}/submit`, data),
};

// ─── Submissions ──────────────────────────────────────────────────────────────
export const submissionAPI = {
  getAll:   (params)           => api.get('/submissions', { params }),
  getById:  (id)               => api.get(`/submissions/${id}`),
  // action: 'accept' | 'reject', feedback required, score optional
  review:   (id, data)         => api.put(`/submissions/${id}/review`, data),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:        (params) => api.get('/notifications', { params }),
  getUnreadCount: ()      => api.get('/notifications/unread-count'),
  markRead:      (id)     => api.put(`/notifications/${id}/read`),
  markAllRead:   ()       => api.put('/notifications/mark-all-read'),
  delete:        (id)     => api.delete(`/notifications/${id}`),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courseAPI = {
  getAll:          (params)       => api.get('/courses', { params }),
  getById:         (id)           => api.get(`/courses/${id}`),
  create:          (data)         => api.post('/courses', data),
  update:          (id, data)     => api.put(`/courses/${id}`, data),
  delete:          (id)           => api.delete(`/courses/${id}`),
  enroll:          (id)           => api.post(`/courses/${id}/enroll`),
  updateProgress:  (id, data)     => api.put(`/courses/${id}/progress`, data),
};

// ─── Users (admin) ────────────────────────────────────────────────────────────
export const userAPI = {
  getAll:       (params)          => api.get('/users', { params }),
  getById:      (id)              => api.get(`/users/${id}`),
  toggleStatus: (id, isActive)    => api.put(`/users/${id}/status`, { isActive }),
};

// ─── Interview ────────────────────────────────────────────────────────────────
export const interviewAPI = {
  generateQuestions: (data)   => api.post('/interview/generate-questions', data),
  evaluate:          (data)   => api.post('/interview/evaluate', data),
  getRoadmap:        (data)   => api.post('/interview/roadmap', data),
  getSessions:       (params) => api.get('/interview/sessions', { params }),
  createSession:     (data)   => api.post('/interview/sessions', data),
  updateSession:     (id, data) => api.put(`/interview/sessions/${id}`, data),
};

// ─── Coding ───────────────────────────────────────────────────────────────────
export const codingAPI = {
  getAll:     (params) => api.get('/coding', { params }),
  getById:    (id)     => api.get(`/coding/${id}`),
  bookmark:   (id)     => api.post(`/coding/${id}/bookmark`),
  markSolved: (id)     => api.post(`/coding/${id}/solve`),
  create:     (data)   => api.post('/coding', data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard:   () => api.get('/analytics/dashboard'),
  getMyAnalytics: () => api.get('/analytics/me'),
  getLeaderboard: (params) => api.get('/analytics/leaderboard', { params }),
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcementAPI = {
  getAll:  ()     => api.get('/announcements'),
  create:  (data) => api.post('/announcements', data),
  delete:  (id)   => api.delete(`/announcements/${id}`),
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const quizAPI = {
  getAll:  ()             => api.get('/quiz'),
  getById: (id)           => api.get(`/quiz/${id}`),
  submit:  (id, answers)  => api.post(`/quiz/${id}/submit`, { answers }),
  create:  (data)         => api.post('/quiz', data),
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressAPI = {
  getMe: () => api.get('/progress/me'),
};

// ─── Aptitude Quiz ────────────────────────────────────────────────────────────
export const aptitudeAPI = {
  getAll:          (params)        => api.get('/aptitude', { params }),
  getById:         (id)            => api.get(`/aptitude/${id}`),
  start:           (id)            => api.post(`/aptitude/${id}/start`),
  submit:          (data)          => api.post('/aptitude/submit', data),
  getMyAttempts:   ()              => api.get('/aptitude/my-attempts'),
  // Admin
  create:          (data)          => api.post('/aptitude', data),
  update:          (id, data)      => api.put(`/aptitude/${id}`, data),
  delete:          (id)            => api.delete(`/aptitude/${id}`),
  getAllAttempts:   (params)        => api.get('/aptitude/admin/attempts', { params }),
  getAttemptDetail:(id)            => api.get(`/aptitude/admin/attempts/${id}`),
};

// ─── Coding Problems ──────────────────────────────────────────────────────────
export const problemAPI = {
  getAll:          (params)        => api.get('/problems', { params }),
  getById:         (id)            => api.get(`/problems/${id}`),
  run:             (id, data)      => api.post(`/problems/${id}/run`, data),
  submit:          (id, data)      => api.post(`/problems/${id}/submit`, data),
  getMySubmissions:(id)            => api.get(`/problems/${id}/my-submissions`),
  // Admin
  create:          (data)          => api.post('/problems', data),
  update:          (id, data)      => api.put(`/problems/${id}`, data),
  delete:          (id)            => api.delete(`/problems/${id}`),
  getAllSubmissions:(params)        => api.get('/problems/admin/all-submissions', { params }),
};

// ─── HR Tasks ─────────────────────────────────────────────────────────────────
export const hrAPI = {
  getAll:          (params)        => api.get('/hr', { params }),
  getById:         (id)            => api.get(`/hr/${id}`),
  submit:          (id, data)      => api.post(`/hr/${id}/submit`, data),
  // Admin
  create:          (data)          => api.post('/hr', data),
  update:          (id, data)      => api.put(`/hr/${id}`, data),
  delete:          (id)            => api.delete(`/hr/${id}`),
  getAllSubmissions:(params)        => api.get('/hr/admin/submissions', { params }),
  review:          (id, data)      => api.put(`/hr/admin/submissions/${id}/review`, data),
};
