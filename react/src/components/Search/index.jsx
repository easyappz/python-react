import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import UserCard from '../UserCard';
import { getMembers } from '../../api/members';
import { createDialog } from '../../api/dialogs';
import './search.css';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMembers(searchQuery);
      setUsers(data);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleWriteClick = async (userId) => {
    try {
      const dialog = await createDialog(userId);
      navigate(`/dialogs/${dialog.id}`);
    } catch (err) {
      console.error('Ошибка при создании диалога:', err);
      setError('Не удалось создать диалог');
    }
  };

  return (
    <Layout>
      <div className="search-page" data-easytag="id7-src/components/Search/index.jsx">
        <div className="search-header">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.294 13.364l3.821 3.82-0.93 0.93-3.82-3.821c-1.114 0.872-2.515 1.393-4.041 1.393-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5c3.59 0 6.5 2.91 6.5 6.5 0 1.526-0.521 2.927-1.393 4.041l-0.137 0.137zM9.324 14.186c2.713 0 4.912-2.199 4.912-4.912s-2.199-4.912-4.912-4.912c-2.713 0-4.912 2.199-4.912 4.912s2.199 4.912 4.912 4.912z" fill="#656565"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск людей"
              value={searchQuery}
              onChange={handleSearchChange}
              data-testid="search-input"
            />
          </div>
        </div>

        <div className="search-content">
          {error && <div className="search-error">{error}</div>}
          
          {loading ? (
            <div className="search-loading">Загрузка...</div>
          ) : (
            <div className="search-results">
              {users.length === 0 && searchQuery && !loading ? (
                <div className="search-empty">Ничего не найдено</div>
              ) : (
                users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onCardClick={handleUserClick}
                    onWriteClick={handleWriteClick}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;