import React, { useMemo, useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';

export default function FeaturesGrid() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const drift = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const drift2 = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const hue = useTransform(scrollYProgress, [0, 1], [210, 285]);
  const gradient = useMotionTemplate`radial-gradient(900px 300px at 20% 10%, hsla(${hue}, 95%, 70%, 0.20), rgba(0,0,0,0)), radial-gradient(900px 300px at 80% 0%, hsla(${hue}, 80%, 72%, 0.14), rgba(0,0,0,0))`;

  const features = useMemo(
    () => [
      {
        title: 'Frontend',
        text: 'Компоненты и маршруты на React. Чистая структура и удобное расширение.',
        tag: 'UI/UX',
      },
      {
        title: 'Backend',
        text: 'Python + API: эндпоинты, сериализация, проверки. Готово для развития продукта.',
        tag: 'API',
      },
      {
        title: 'База данных',
        text: 'Модели и миграции. Данные живут в согласованной схеме, без хаоса.',
        tag: 'DB',
      },
      {
        title: 'Автотесты',
        text: 'Стабильные UI-тесты и сценарии. Меньше регрессий — больше скорости.',
        tag: 'QA',
      },
      {
        title: 'Превью',
        text: 'Смотрите результат сразу, без ручных сборок и лишних шагов.',
        tag: 'Preview',
      },
      {
        title: 'Логи',
        text: 'Видно, что происходит: ошибки, запросы и поведение — для быстрого дебага.',
        tag: 'Observability',
      },
    ],
    []
  );

  return (
    <section
      id="features"
      ref={ref}
      data-easytag="id5-react/src/components/Home/sections/FeaturesGrid/index.jsx"
      className="homeSection"
      data-testid="features"
    >
      <div className="homeContainer">
        <div className="featuresHeader">
          <div>
            <h2>Возможности</h2>
            <p>
              Вся цепочка разработки — от интерфейса до инфраструктурных деталей — в одном месте.
              Сбалансировано между минимализмом и мощью.
            </p>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          style={{
            height: 1,
            marginTop: 18,
            background: gradient,
            borderRadius: 999,
            filter: 'blur(0px)',
          }}
        />

        <div className="featuresGrid" data-testid="features-list">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              className="featureCard"
              style={{
                y: idx % 2 === 0 ? drift : drift2,
                willChange: 'transform',
              }}
            >
              <h3 className="featureTitle">{f.title}</h3>
              <p className="featureText">{f.text}</p>
              <div className="featureTag">{f.tag}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
