import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div data-easytag="id1-react/src/components/NotFound/index.jsx" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <h1 style={{
        fontSize: '72px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '20px',
      }}>
        404
      </h1>
      
      <p style={{
        fontSize: '24px',
        color: '#666',
        marginBottom: '30px',
        textAlign: 'center',
      }}>
        {t('pageNotFound')}
      </p>
      
      <Link
        to="/"
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#fff',
          backgroundColor: '#0079bf',
          border: 'none',
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        {t('backToHome')}
      </Link>
    </div>
  );
};
