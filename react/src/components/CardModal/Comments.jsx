import React, { useState, useEffect, useContext } from 'react';
import { getComments, createComment, deleteComment } from '../../api/comments';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Comments = ({ cardId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, [cardId]);

  const loadComments = async () => {
    try {
      const data = await getComments(cardId);
      setComments(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Ошибка загрузки комментариев');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Введите текст комментария');
      return;
    }

    try {
      await createComment({
        card: cardId,
        text: newComment.trim()
      });
      toast.success('Комментарий добавлен');
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Ошибка добавления комментария');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить этот комментарий?')) return;

    try {
      await deleteComment(commentId);
      toast.success('Комментарий удален');
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Ошибка удаления комментария');
    }
  };

  return (
    <div className="card-modal-section" data-easytag="id1-react/src/components/CardModal/Comments.jsx">
      <h3 className="card-modal-section-title">Комментарии</h3>

      <div className="add-comment">
        <textarea
          className="comment-textarea"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите комментарий..."
          rows={3}
          data-testid="comment-textarea"
        />
        <button
          className="btn-save"
          onClick={handleAddComment}
          data-testid="add-comment-btn"
        >
          Добавить комментарий
        </button>
      </div>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">Пока нет комментариев</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment" data-testid={`comment-${comment.id}`}>
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-avatar">👤</span>
                  <span className="author-name">Пользователь #{comment.author}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>
                {user && user.id === comment.author && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDeleteComment(comment.id)}
                    data-testid={`delete-comment-${comment.id}`}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="comment-text">{comment.text}</div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .add-comment {
          margin-bottom: 24px;
        }

        .comment-textarea {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 8px;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #0079bf;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-comments {
          text-align: center;
          color: #999;
          padding: 24px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .comment {
          background: #f5f5f5;
          border-radius: 4px;
          padding: 12px;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .comment-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .author-avatar {
          font-size: 20px;
        }

        .author-name {
          font-weight: 600;
          color: #333;
        }

        .comment-date {
          color: #999;
          font-size: 12px;
        }

        .comment-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .comment-delete:hover {
          background: #ffebee;
        }

        .comment-text {
          color: #333;
          white-space: pre-wrap;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
