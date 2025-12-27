import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Header } from '../Header';
import './styles.css';

export const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="notfound-page" data-easytag="id1-react/src/components/NotFound/index.jsx">
      <Header />
      <div className="notfound-container">
        <div className="notfound-content">
          <h1 className="notfound-code" data-testid="error-code">404</h1>
          <h2 className="notfound-title" data-testid="error-title">{t('pageNotFound')}</h2>
          <p className="notfound-description" data-testid="error-description">
            {t('language') === 'ru'
              ? 'Страница, которую вы ищете, не существует или была перемещена.'
              : 'The page you are looking for does not exist or has been moved.'}
          </p>
          <Link to="/" className="notfound-button" data-testid="back-home">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};
