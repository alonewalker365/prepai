import { useState, useEffect, useCallback, useRef } from 'react';

// ─── useDebounce ──────────────────────────────────────────────────────────────
// Delays updating a value until after the user stops typing
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────
// Persistent state synced to localStorage
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ─── useApi ───────────────────────────────────────────────────────────────────
// Generic async API call hook with loading/error/data state
export function useApi(apiFn, immediate = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn(...args);
      if (isMounted.current) {
        setData(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || err.message || 'An error occurred');
      }
      throw err;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [apiFn]);

  useEffect(() => {
    if (immediate) execute();
  }, []);

  return { data, loading, error, execute, setData };
}

// ─── usePagination ────────────────────────────────────────────────────────────
// Pagination state management
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage(p => p + 1), []);
  const prevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const goToPage = useCallback((p) => setPage(p), []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, nextPage, prevPage, goToPage, reset };
}

// ─── useCountdown ─────────────────────────────────────────────────────────────
// Countdown timer that triggers a callback at zero
export function useCountdown(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback((seconds = initialSeconds) => {
    setRunning(false);
    setTimeLeft(seconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onExpire?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, onExpire]);

  const formatted = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

  return { timeLeft, formatted, running, start, pause, reset };
}

// ─── useOutsideClick ─────────────────────────────────────────────────────────
// Detect clicks outside a ref element
export function useOutsideClick(callback) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);

  return ref;
}

// ─── useWindowSize ────────────────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return { ...size, isMobile: size.width < 768, isTablet: size.width < 1024 };
}
