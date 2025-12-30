import React, { useState, useEffect } from 'react';
import { updateSettings } from '../../api/settings';

const SettingsForm = ({ settings, onSettingsUpdate, currentLanguage, onLanguageChange }) => {
  const [formData, setFormData] = useState({
    tax_rate: '',
    currency: 'RUB',
    language: 'ru',
    default_period: 'month'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        tax_rate: settings.tax_rate || '',
        currency: settings.currency || 'RUB',
        language: settings.language || 'ru',
        default_period: settings.default_period || 'month'
      });
    }
  }, [settings]);

  const translations = {
    ru: {
      title: 'Настройки',
      taxRate: 'Налоговая ставка (%)',
      currency: 'Валюта',
      language: 'Язык',
      defaultPeriod: 'Период по умолчанию',
      save: 'Сохранить настройки',
      saving: 'Сохранение...',
      success: 'Настройки успешно сохранены',
      error: 'Ошибка при сохранении настроек',
      periods: {
        day: 'День',
        week: 'Неделя',
        month: 'Месяц',
        quarter: 'Квартал',
        year: 'Год'
      },
      languages: {
        ru: 'Русский',
        en: 'English'
      },
      currencies: {
        RUB: 'Российский рубль (₽)',
        USD: 'Доллар США ($)',
        EUR: 'Евро (€)'
      }
    },
    en: {
      title: 'Settings',
      taxRate: 'Tax Rate (%)',
      currency: 'Currency',
      language: 'Language',
      defaultPeriod: 'Default Period',
      save: 'Save Settings',
      saving: 'Saving...',
      success: 'Settings saved successfully',
      error: 'Error saving settings',
      periods: {
        day: 'Day',
        week: 'Week',
        month: 'Month',
        quarter: 'Quarter',
        year: 'Year'
      },
      languages: {
        ru: 'Русский',
        en: 'English'
      },
      currencies: {
        RUB: 'Russian Ruble (₽)',
        USD: 'US Dollar ($)',
        EUR: 'Euro (€)'
      }
    }
  };

  const t = translations[currentLanguage];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    const taxRate = parseFloat(formData.tax_rate);
    if (formData.tax_rate && (isNaN(taxRate) || taxRate < 0 || taxRate > 100)) {
      setError('Tax rate must be between 0 and 100');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : null
      };

      await updateSettings(dataToSend);
      setSuccess(true);
      
      if (formData.language !== currentLanguage) {
        onLanguageChange(formData.language);
      }
      
      if (onSettingsUpdate) {
        onSettingsUpdate();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card">
      <h2 className="profile-section-title">{t.title}</h2>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="tax_rate" className="form-label">{t.taxRate}</label>
          <input
            type="number"
            id="tax_rate"
            name="tax_rate"
            value={formData.tax_rate}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            className="form-input"
            placeholder="0-100"
            data-testid="settings-tax-rate"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency" className="form-label">{t.currency}</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="form-select"
            data-testid="settings-currency"
          >
            <option value="RUB">{t.currencies.RUB}</option>
            <option value="USD">{t.currencies.USD}</option>
            <option value="EUR">{t.currencies.EUR}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language" className="form-label">{t.language}</label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="form-select"
            data-testid="settings-language"
          >
            <option value="ru">{t.languages.ru}</option>
            <option value="en">{t.languages.en}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="default_period" className="form-label">{t.defaultPeriod}</label>
          <select
            id="default_period"
            name="default_period"
            value={formData.default_period}
            onChange={handleChange}
            className="form-select"
            data-testid="settings-default-period"
          >
            <option value="day">{t.periods.day}</option>
            <option value="week">{t.periods.week}</option>
            <option value="month">{t.periods.month}</option>
            <option value="quarter">{t.periods.quarter}</option>
            <option value="year">{t.periods.year}</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{t.success}</div>}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          data-testid="settings-save-btn"
        >
          {loading ? t.saving : t.save}
        </button>
      </form>
    </div>
  );
};

export default SettingsForm;
