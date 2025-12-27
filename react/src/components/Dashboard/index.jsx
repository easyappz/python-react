import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div data-easytag="id1-react/src/components/Dashboard/index.jsx" style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '30px',
        }}>
          {t('myBoards')}
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          <button
            data-testid="create-board-button"
            style={{
              padding: '40px',
              backgroundColor: '#fff',
              border: '2px dashed #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#999';
              e.target.style.color = '#333';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#ccc';
              e.target.style.color = '#666';
            }}
          >
            + {t('createBoard')}
          </button>
        </div>
      </div>
    </div>
  );
};
