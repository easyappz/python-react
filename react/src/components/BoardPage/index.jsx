import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import { Column } from '../Column';
import { AddColumn } from '../AddColumn';
import { InviteModal } from '../InviteModal';
import { getBoard } from '../../api/boards';
import { getColumns, createColumn } from '../../api/columns';
import { moveCard } from '../../api/cards';
import toast from 'react-hot-toast';
import './styles.css';

export const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    loadBoardData();
  }, [id]);

  const loadBoardData = async () => {
    setIsLoading(true);
    try {
      const [boardData, columnsData] = await Promise.all([
        getBoard(id),
        getColumns(id)
      ]);
      setBoard(boardData);
      setColumns(columnsData.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error('Error loading board:', error);
      toast.error('Ошибка загрузки доски');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddColumn = async (title) => {
    try {
      const position = columns.length;
      await createColumn({
        board: parseInt(id),
        title,
        position
      });
      await loadBoardData();
      toast.success('Колонка создана');
    } catch (error) {
      console.error('Error creating column:', error);
      toast.error('Ошибка создания колонки');
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumnId = parseInt(source.droppableId.replace('column-', ''));
    const destColumnId = parseInt(destination.droppableId.replace('column-', ''));
    const cardId = parseInt(draggableId.replace('card-', ''));

    try {
      await moveCard(cardId, {
        column: destColumnId,
        position: destination.index
      });
      await loadBoardData();
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Ошибка перемещения карточки');
    }
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleInviteSuccess = () => {
    loadBoardData();
  };

  if (isLoading) {
    return (
      <div className="board-loading" data-easytag="id1-react/src/components/BoardPage/index.jsx">
        Загрузка доски...
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div
      className="board-page"
      style={{ backgroundColor: board.background_color || '#0079bf' }}
      data-easytag="id2-react/src/components/BoardPage/index.jsx"
      data-testid="board-page"
    >
      <div className="board-header">
        <div className="board-header-left">
          <button
            className="board-back-btn"
            onClick={() => navigate('/')}
            data-testid="back-to-dashboard-btn"
          >
            ← Назад
          </button>
          <h1 className="board-title" data-testid="board-title">{board.title}</h1>
        </div>
        <div className="board-header-right">
          <input
            type="text"
            className="board-search"
            placeholder="Поиск по карточкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-cards-input"
          />
          <button
            className="board-invite-btn"
            onClick={handleInvite}
            data-testid="invite-btn"
          >
            👥 Пригласить
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onRefresh={loadBoardData}
            />
          ))}
          <AddColumn onAdd={handleAddColumn} />
        </div>
      </DragDropContext>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        board={board}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
};
