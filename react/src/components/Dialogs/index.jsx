import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDialogs } from '../../api/dialogs';
import Layout from '../Layout';
import './dialogs.css';

const Dialogs = () => {
  const [dialogs, setDialogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDialogs();
  }, []);

  const loadDialogs = async () => {
    try {
      setLoading(true);
      const data = await getDialogs();
      setDialogs(data);
    } catch (error) {
      console.error('Failed to load dialogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClick = (dialogId) => {
    navigate(`/dialogs/${dialogId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays < 7) return `${diffDays} дн`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <Layout>
      <div className="dialogs-page" data-easytag="id9-src/components/Dialogs/index.jsx">
        <div className="dialogs-header">
          <h1>Сообщения</h1>
        </div>
        
        {loading ? (
          <div className="dialogs-loading">Загрузка...</div>
        ) : dialogs.length === 0 ? (
          <div className="dialogs-empty">
            <p>У вас пока нет диалогов</p>
            <p className="dialogs-empty-hint">Найдите пользователей в поиске и начните общение</p>
          </div>
        ) : (
          <div className="dialogs-list">
            {dialogs.map((dialog) => (
              <div
                key={dialog.id}
                className="dialog-item"
                onClick={() => handleDialogClick(dialog.id)}
                data-testid="dialog-item"
              >
                <div className="dialog-avatar">
                  <div className="dialog-avatar-placeholder">
                    {dialog.participant.first_name.charAt(0)}{dialog.participant.last_name.charAt(0)}
                  </div>
                </div>
                <div className="dialog-content">
                  <div className="dialog-top">
                    <div className="dialog-name">
                      {dialog.participant.first_name} {dialog.participant.last_name}
                    </div>
                    {dialog.last_message && (
                      <div className="dialog-time">
                        {formatTime(dialog.last_message.created_at)}
                      </div>
                    )}
                  </div>
                  <div className="dialog-message">
                    {dialog.last_message ? dialog.last_message.text : 'Нет сообщений'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dialogs;
