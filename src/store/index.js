import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, taskAPI, courseAPI, analyticsAPI, interviewAPI, codingAPI, announcementAPI } from '../api/services';
import { connectSocket, disconnectSocket } from '../api/socket';

// ─── AUTH SLICE ───────────────────────────────────────────────────────────────
const storedUser = localStorage.getItem('prepwise_user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(creds);
    localStorage.setItem('prepwise_token', data.data.token);
    localStorage.setItem('prepwise_user', JSON.stringify(data.data));
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('prepwise_token', data.data.token);
    localStorage.setItem('prepwise_user', JSON.stringify(data.data));
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getMe();
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.updateProfile(profileData);
    localStorage.setItem('prepwise_user', JSON.stringify(data.data));
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: initialUser, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('prepwise_token');
      localStorage.removeItem('prepwise_user');
      disconnectSocket();
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    const pending = (s) => { s.loading = true; s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };
    b.addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        connectSocket(a.payload.token);
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        connectSocket(a.payload.token);
      })
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.user = { ...s.user, ...a.payload }; });
  },
});
export const { logout, clearError } = authSlice.actions;

// ─── TASKS SLICE ──────────────────────────────────────────────────────────────
export const fetchTodayTasks = createAsyncThunk('tasks/fetchToday', async (_, { rejectWithValue }) => {
  try { const { data } = await taskAPI.getToday(); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await taskAPI.getAll(params); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const submitTask = createAsyncThunk('tasks/submit', async ({ id, formData }, { rejectWithValue }) => {
  try { const { data } = await taskAPI.submit(id, formData); return { taskId: id, submission: data.data }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { today: [], list: [], pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTodayTasks.pending, (s) => { s.loading = true; })
      .addCase(fetchTodayTasks.fulfilled, (s, a) => { s.loading = false; s.today = a.payload; })
      .addCase(fetchTodayTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchTasks.pending, (s) => { s.loading = true; })
      .addCase(fetchTasks.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.tasks; s.pagination = a.payload.pagination; })
      .addCase(fetchTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(submitTask.fulfilled, (s, a) => {
        const idx = s.today.findIndex(t => t._id === a.payload.taskId);
        if (idx !== -1) s.today[idx].userStatus = 'submitted';
      });
  },
});

// ─── COURSES SLICE ────────────────────────────────────────────────────────────
export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await courseAPI.getAll(params); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCourses.pending, (s) => { s.loading = true; })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.courses; s.pagination = a.payload.pagination; })
      .addCase(fetchCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

// ─── ANALYTICS SLICE ──────────────────────────────────────────────────────────
export const fetchMyAnalytics = createAsyncThunk('analytics/fetchMine', async (_, { rejectWithValue }) => {
  try { const { data } = await analyticsAPI.getMyAnalytics(); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAdminStats = createAsyncThunk('analytics/fetchAdmin', async (_, { rejectWithValue }) => {
  try { const { data } = await analyticsAPI.getDashboard(); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { mine: null, admin: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyAnalytics.pending, (s) => { s.loading = true; })
      .addCase(fetchMyAnalytics.fulfilled, (s, a) => { s.loading = false; s.mine = a.payload; })
      .addCase(fetchAdminStats.fulfilled, (s, a) => { s.admin = a.payload; });
  },
});

// ─── UI SLICE (theme, sidebar) ─────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('prepwise_theme') === 'dark',
    sidebarOpen: true,
    sidebarCollapsed: false,
  },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('prepwise_theme', state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    collapseSidebar(state) { state.sidebarCollapsed = !state.sidebarCollapsed; },
  },
});
export const { toggleDarkMode, toggleSidebar, collapseSidebar } = uiSlice.actions;

// ─── STORE ────────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    tasks: tasksSlice.reducer,
    courses: coursesSlice.reducer,
    analytics: analyticsSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export default store;
