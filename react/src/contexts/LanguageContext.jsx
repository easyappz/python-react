import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  ru: {
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выход',
    profile: 'Профиль',
    email: 'Email',
    password: 'Пароль',
    username: 'Имя пользователя',
    passwordConfirm: 'Подтвердите пароль',
    myBoards: 'Мои доски',
    createBoard: 'Создать доску',
    boardName: 'Название доски',
    boardDescription: 'Описание доски',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    pageNotFound: 'Страница не найдена',
    backToHome: 'Вернуться на главную',
  },
  en: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    passwordConfirm: 'Confirm Password',
    myBoards: 'My Boards',
    createBoard: 'Create Board',
    boardName: 'Board Name',
    boardDescription: 'Board Description',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    pageNotFound: 'Page Not Found',
    backToHome: 'Back to Home',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const value = {
    language,
    setLanguage,
    t,
    toggleLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
