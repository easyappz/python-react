import React from 'react';
import { useParams } from 'react-router-dom';

export const Board = () => {
  const { id } = useParams();

  return (
    <div data-easytag="id1-react/src/components/Board/index.jsx" style={{
      minHeight: '100vh',
      backgroundColor: '#0079bf',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#fff',
          marginBottom: '20px',
        }}>
          Доска #{id}
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
        }}>
          <div style={{
            minWidth: '280px',
            backgroundColor: '#ebecf0',
            borderRadius: '8px',
            padding: '10px',
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '10px',
            }}>
              Колонка
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
