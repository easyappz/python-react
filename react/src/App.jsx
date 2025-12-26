import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import './App.css';

import { Home } from './components/Home';

const RedirectRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  return user ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes([
        '/',
        '/login',
        '/register',
        '/profile',
        '/profile/:id',
        '/search',
        '/dialogs',
        '/dialogs/:id'
      ]);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<RedirectRoute />} />
      <Route path="/login" element={<Home />} />
      <Route path="/register" element={<Home />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/dialogs"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/dialogs/:id"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
