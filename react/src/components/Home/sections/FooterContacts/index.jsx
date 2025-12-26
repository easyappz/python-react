import React from 'react';

export default function FooterContacts() {
  return (
    <footer
      data-easytag="id6-react/src/components/Home/sections/FooterContacts/index.jsx"
      className="footerWrap"
      data-testid="footer"
    >
      <div className="homeContainer">
        <div className="footerBox">
          <div className="footerTop">
            <div style={{ maxWidth: 560 }}>
              <h3 className="footerTitle">easyappz</h3>
              <p className="footerText">
                Сервис для создания веб‑приложений полного цикла через чат: фронтенд, бэкенд, база
                данных, превью, автотесты и логи.
              </p>
              <p className="footerText" style={{ marginTop: 10 }}>
                Изображения намеренно заменены плейсхолдерами — дизайн готов к подключению реальных
                материалов.
              </p>
            </div>

            <div className="footerContacts" data-testid="footer-contacts">
              <a className="footerLink" href="#" onClick={(e) => e.preventDefault()}>
                <div>
                  <div style={{ fontWeight: 700 }}>Связаться</div>
                  <span>Контакты будут добавлены</span>
                </div>
                <div aria-hidden="true">→</div>
              </a>
              <a className="footerLink" href="#" onClick={(e) => e.preventDefault()}>
                <div>
                  <div style={{ fontWeight: 700 }}>Документация</div>
                  <span>Скоро</span>
                </div>
                <div aria-hidden="true">→</div>
              </a>
              <a className="footerLink" href="#" onClick={(e) => e.preventDefault()}>
                <div>
                  <div style={{ fontWeight: 700 }}>Статус</div>
                  <span>Скоро</span>
                </div>
                <div aria-hidden="true">→</div>
              </a>
            </div>
          </div>

          <div className="footerBottom">
            <div>© {new Date().getFullYear()} easyappz</div>
            <div>Сделано в минималистичном Apple-like стиле</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
