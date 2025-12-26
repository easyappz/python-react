import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDialog } from '../../api/dialogs';
import { createMessage } from '../../api/messages';
import { useAuth } from '../../context/AuthContext';
import Layout from '../Layout';
import Message from '../Message';
import './chat.css';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dialog, setDialog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadDialog();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDialog = async () => {
    try {
      setLoading(true);
      const data = await getDialog(id);
      setDialog(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load dialog:', error);
      navigate('/dialogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      const newMessage = await createMessage(id, messageText.trim());
      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="chat-loading">Загрузка...</div>
      </Layout>
    );
  }

  if (!dialog) {
    return null;
  }

  return (
    <Layout>
      <div className="chat-page" data-easytag="id10-src/components/Chat/index.jsx">
        <div className="chat-header">
          <button className="chat-back" onClick={() => navigate('/dialogs')}>
            ←
          </button>
          <div className="chat-header-info">
            <div className="chat-header-avatar">
              <div className="chat-header-avatar-placeholder">
                {dialog.participant.first_name.charAt(0)}{dialog.participant.last_name.charAt(0)}
              </div>
            </div>
            <div
              className="chat-header-name"
              onClick={() => navigate(`/profile/${dialog.participant.id}`)}
            >
              {dialog.participant.first_name} {dialog.participant.last_name}
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <p>Начните общение</p>
            </div>
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isOwn={message.sender.id === user.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Напишите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            data-testid="message-input"
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!messageText.trim() || sending}
            data-testid="send-button"
          >
            ➤
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Chat;
