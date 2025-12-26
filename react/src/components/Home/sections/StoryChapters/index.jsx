import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function StoryChapters() {
  const shellRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: shellRef,
    offset: ['start start', 'end end'],
  });

  const railX = useTransform(scrollYProgress, [0, 1], ['0%', '-38%']);
  const driftY = useTransform(scrollYProgress, [0, 1], [0, -22]);
  const tilt = useTransform(scrollYProgress, [0, 1], [0, -3]);

  const chapters = useMemo(
    () => [
      {
        idx: '01',
        title: 'Идея',
        text: 'Вы пишете цель. Мы уточняем детали и фиксируем требования — без документов и митингов.',
      },
      {
        idx: '02',
        title: 'Чат → код',
        text: 'Из диалога рождается приложение: компоненты React, API на Python, модели и миграции.',
      },
      {
        idx: '03',
        title: 'Превью и тесты',
        text: 'Каждое изменение сразу видно. Автотесты проверяют ключевые сценарии, чтобы не ломать продукт.',
      },
      {
        idx: '04',
        title: 'Деплой и наблюдаемость',
        text: 'Логи и прозрачность сборки помогают быстро находить проблемы — ещё до пользователей.',
      },
    ],
    []
  );

  return (
    <section
      id="how-it-works"
      data-easytag="id4-react/src/components/Home/sections/StoryChapters/index.jsx"
      className="homeSection"
      data-testid="how-it-works"
    >
      <div className="homeContainer">
        <div className="homeDivider" />
      </div>

      <div className="homeContainer" style={{ marginTop: 22 }}>
        <div ref={shellRef} className="chaptersShell">
          <div className="chaptersSticky">
            <div className="chaptersFrame">
              <div className="chaptersHeader">
                <h2>Как это работает</h2>
                <p>
                  Киношный скролл: внутри — «псевдо‑пин» (sticky) и горизонтальный дрейф карточек.
                  Параллакс добавляет глубину и ощущение «продуктового» интерактива.
                </p>
              </div>

              <div className="chaptersRail">
                <motion.div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
                    gap: 14,
                    x: railX,
                    y: driftY,
                    rotate: tilt,
                    willChange: 'transform',
                  }}
                >
                  {chapters.map((c) => (
                    <div key={c.idx} className="chapterCard">
                      <div className="chapterMeta">
                        <div className="chapterIndex">{c.idx}</div>
                        <div className="chapterTitle">{c.title}</div>
                      </div>
                      <p className="chapterText">{c.text}</p>
                    </div>
                  ))}
                </motion.div>

                <div className="chapterRow" style={{ marginTop: 14 }}>
                  <div className="chapterCard">
                    <div className="chapterTitle">Контроль качества</div>
                    <p className="chapterText">
                      Автотесты — это не «потом», а часть процесса: вы видите, что работает, ещё до деплоя.
                    </p>
                  </div>
                  <div className="chapterCard">
                    <div className="chapterTitle">Быстрый цикл</div>
                    <p className="chapterText">
                      Правка → превью → тесты → готово. Меньше ожиданий, больше результата.
                    </p>
                  </div>
                  <div className="chapterCard">
                    <div className="chapterTitle">Прозрачность</div>
                    <p className="chapterText">
                      Логи и структура проекта всегда под рукой — без «магии», только понятная инженерия.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
