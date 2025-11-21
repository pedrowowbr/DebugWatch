import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminView from './components/AdminView';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    if (showAdminView) {
      return (
        <div>
          <button
            onClick={() => setShowAdminView(false)}
            className="view-toggle-btn"
            title="Voltar para visão pessoal"
          >
            👤 Minha Visão
          </button>
          <AdminView />
        </div>
      );
    }
    return (
      <div>
        {user?.is_admin && (
          <button
            onClick={() => setShowAdminView(true)}
            className="view-toggle-btn"
            title="Ver visão admin (todos os clientes)"
          >
            👑 Visão Admin
          </button>
        )}
        <Dashboard />
      </div>
    );
  }

  return showRegister ? (
    <Register switchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login switchToRegister={() => setShowRegister(true)} />
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
