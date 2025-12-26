import React from 'react';
import './topNav.css';

export default function TopNav({ items, onNavigate }) {
  return (
    <header data-easytag="id2-react/src/components/Home/sections/TopNav/index.jsx" className="topNav">
      <div className="topNavInner">
        <a
          className="topNavBrand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('top');
          }}
        >
          <span className="topNavDot" aria-hidden="true" />
          <span className="topNavName">easyappz</span>
        </a>

        <nav className="topNavLinks" aria-label="Навигация">
          {items?.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-testid={item.testId}
              className="topNavLink"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          className="topNavCta"
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          Открыть сервис
        </a>
      </div>
    </header>
  );
}
