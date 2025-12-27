import React, { useState, useEffect, useRef } from 'react';
import { getAttachments, uploadAttachment, deleteAttachment } from '../../api/attachments';
import toast from 'react-hot-toast';

export const Attachments = ({ cardId }) => {
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAttachments();
  }, [cardId]);

  const loadAttachments = async () => {
    try {
      const data = await getAttachments(cardId);
      setAttachments(data.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)));
    } catch (error) {
      console.error('Error loading attachments:', error);
      toast.error('Ошибка загрузки вложений');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadAttachment(cardId, file, file.name);
      toast.success('Файл загружен');
      loadAttachments();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Удалить это вложение?')) return;

    try {
      await deleteAttachment(attachmentId);
      toast.success('Вложение удалено');
      loadAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Ошибка удаления вложения');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="card-modal-section" data-easytag="id1-react/src/components/CardModal/Attachments.jsx">
      <h3 className="card-modal-section-title">Вложения</h3>

      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          data-testid="file-input"
        />
        <button
          className="btn-upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          data-testid="upload-btn"
        >
          {isUploading ? '📤 Загрузка...' : '📎 Загрузить файл'}
        </button>
      </div>

      <div className="attachments-list">
        {attachments.length === 0 ? (
          <div className="no-attachments">Нет вложений</div>
        ) : (
          attachments.map(attachment => (
            <div key={attachment.id} className="attachment" data-testid={`attachment-${attachment.id}`}>
              <div className="attachment-info">
                <div className="attachment-icon">📄</div>
                <div className="attachment-details">
                  <div className="attachment-name">{attachment.filename}</div>
                  <div className="attachment-meta">
                    <span>{new Date(attachment.uploaded_at).toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
              <div className="attachment-actions">
                <a
                  href={attachment.file}
                  download={attachment.filename}
                  className="attachment-download"
                  data-testid={`download-${attachment.id}`}
                >
                  ⬇️
                </a>
                <button
                  className="attachment-delete"
                  onClick={() => handleDelete(attachment.id)}
                  data-testid={`delete-attachment-${attachment.id}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .upload-section {
          margin-bottom: 20px;
        }

        .btn-upload {
          background: #0079bf;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-upload:hover:not(:disabled) {
          background: #026aa7;
        }

        .btn-upload:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .attachments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-attachments {
          text-align: center;
          color: #999;
          padding: 24px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .attachment {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
        }

        .attachment-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .attachment-icon {
          font-size: 24px;
        }

        .attachment-details {
          flex: 1;
        }

        .attachment-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .attachment-meta {
          font-size: 12px;
          color: #999;
        }

        .attachment-actions {
          display: flex;
          gap: 8px;
        }

        .attachment-download {
          background: #e3f2fd;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 16px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .attachment-download:hover {
          background: #bbdefb;
        }

        .attachment-delete {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .attachment-delete:hover {
          background: #ffebee;
        }
      `}</style>
    </div>
  );
};
