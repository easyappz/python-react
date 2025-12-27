import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getBoards } from '../../api/boards';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../Header';
import { BoardCard } from '../BoardCard';
import { CreateBoardModal } from '../CreateBoardModal';
import './styles.css';

export const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredBoards(filtered);
    } else {
      setFilteredBoards(boards);
    }
  }, [searchQuery, boards]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await getBoards();
      setBoards(data);
      setFilteredBoards(data);
    } catch (error) {
      toast.error('Ошибка при загрузке досок');
    } finally {
      setLoading(false);
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const handleBoardCreated = (newBoard) => {
    setBoards(prev => [...prev, newBoard]);
    setIsModalOpen(false);
    toast.success('Доска успешно создана');
  };

  const handleBoardDeleted = (boardId) => {
    setBoards(prev => prev.filter(board => board.id !== boardId));
    toast.success('Доска удалена');
  };

  return (
    <div className="dashboard-container" data-easytag="id1-react/src/components/Dashboard/index.jsx">
      <Header />
      
      <div className="dashboard-header">
        <h1 className="dashboard-title">Мои доски</h1>
        <div className="dashboard-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск досок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-boards-input"
          />
          <button
            className="create-board-btn"
            onClick={() => setIsModalOpen(true)}
            data-testid="create-board-button"
          >
            + Создать доску
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-spinner" data-testid="loading-spinner">
            Загрузка досок...
          </div>
        ) : filteredBoards.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            <div className="empty-state-icon">📋</div>
            <h2 className="empty-state-title">
              {searchQuery ? 'Доски не найдены' : 'У вас пока нет досок'}
            </h2>
            <p className="empty-state-description">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : 'Создайте свою первую доску, чтобы начать работу'}
            </p>
            {!searchQuery && (
              <button
                className="create-board-btn"
                onClick={() => setIsModalOpen(true)}
              >
                + Создать доску
              </button>
            )}
          </div>
        ) : (
          <div className="boards-grid" data-testid="boards-grid">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => handleBoardClick(board.id)}
                onDelete={handleBoardDeleted}
                isOwner={board.owner === user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateBoardModal
          onClose={() => setIsModalOpen(false)}
          onBoardCreated={handleBoardCreated}
        />
      )}
    </div>
  );
};
