import React, { useEffect, useMemo, useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

function useReducedMotionFlag() {
  return useMemo(() => {
    if (typeof window === 'undefined') return true;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    return Boolean(media?.matches);
  }, []);
}

export default function HeroStory({ onPrimaryCta, onSecondaryCta }) {
  const reducedMotion = useReducedMotionFlag();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const blobX = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const blobRotate = useTransform(scrollYProgress, [0, 1], [0, 14]);

  const maskSize = useTransform(scrollYProgress, [0, 1], [92, 160]);
  const maskX = useTransform(scrollYProgress, [0, 1], [30, 70]);
  const maskY = useTransform(scrollYProgress, [0, 1], [18, 62]);
  const maskPosition = useMotionTemplate`${maskX}% ${maskY}%`;
  const maskSizeStr = useMotionTemplate`${maskSize}% ${maskSize}%`;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), {
    stiffness: 140,
    damping: 18,
  });

  useEffect(() => {
    if (reducedMotion) return;

    const onMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      pointerX.set(x);
      pointerY.set(y);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [pointerX, pointerY, reducedMotion]);

  return (
    <section
      ref={heroRef}
      id="top"
      data-easytag="id3-react/src/components/Home/sections/HeroStory/index.jsx"
      className="homeSection"
    >
      <div className="homeContainer homeGrid2" data-testid="home-hero">
        <div>
          <div className="homeEyebrow">От идеи до продакшена — в одном чате</div>

          <h1 className="homeTitle" data-testid="hero-title">
            easyappz — создавайте веб‑приложения
            <br />
            без рутины и контекста
          </h1>

          <p className="homeSubTitle">
            Вы описываете задачу словами. Сервис собирает фронтенд, бэкенд, базу данных, автотесты,
            превью и логи — как цельный продукт.
          </p>

          <div className="homeActions">
            <a
              href="#"
              className="homeButton homeButtonPrimary"
              data-testid="cta-primary"
              onClick={onPrimaryCta}
            >
              Перейти к сервису
              <span aria-hidden="true">→</span>
            </a>

            <button
              type="button"
              className="homeButton"
              data-testid="cta-secondary"
              onClick={onSecondaryCta}
            >
              Смотреть возможности
            </button>
          </div>

          <div style={{ marginTop: 22, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
            Современный стек: React + Python. Минималистично. Надёжно. Прозрачно.
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Multi-layer aura */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: -26, pointerEvents: 'none' }}>
            <motion.div
              style={{
                position: 'absolute',
                inset: '-25% -20% auto -25%',
                height: '60%',
                borderRadius: 999,
                filter: 'blur(26px)',
                background:
                  'radial-gradient(closest-side, rgba(90,140,255,0.55), rgba(0,0,0,0))',
                y: reducedMotion ? 0 : blobY1,
                rotate: reducedMotion ? 0 : blobRotate,
                mixBlendMode: 'screen',
                willChange: 'transform',
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                inset: 'auto -30% -25% auto',
                width: '70%',
                height: '70%',
                borderRadius: 999,
                filter: 'blur(30px)',
                background:
                  'radial-gradient(closest-side, rgba(178,110,255,0.45), rgba(0,0,0,0))',
                x: reducedMotion ? 0 : blobX,
                y: reducedMotion ? 0 : blobY2,
                rotate: reducedMotion ? 0 : blobRotate,
                mixBlendMode: 'screen',
                willChange: 'transform',
              }}
            />
          </div>

          {/* Masked grid reveal (mask moves with scroll) */}
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: 28,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
              WebkitMaskImage:
                'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 62%)',
              maskImage:
                'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 62%)',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: reducedMotion ? '50% 40%' : maskPosition,
              maskPosition: reducedMotion ? '50% 40%' : maskPosition,
              WebkitMaskSize: reducedMotion ? '120% 120%' : maskSizeStr,
              maskSize: reducedMotion ? '120% 120%' : maskSizeStr,
              opacity: 0.9,
              pointerEvents: 'none',
            }}
          />

          {/* "Device" mock with 3D depth */}
          <motion.div
            className="deviceFrame"
            style={{
              transformStyle: 'preserve-3d',
              perspective: 900,
              rotateX: reducedMotion ? 0 : rotateX,
              rotateY: reducedMotion ? 0 : rotateY,
              willChange: 'transform',
            }}
          >
            <div className="deviceInner">
              <div className="deviceTopBar">
                <div className="deviceDots" aria-hidden="true">
                  <span className="deviceDot" />
                  <span className="deviceDot" />
                  <span className="deviceDot" />
                </div>
                <div className="deviceChip">Превью • Тесты • Логи</div>
              </div>

              <div className="deviceBody">
                <div className="deviceLine" />
                <div className="deviceLine deviceLineShort" />

                <div className="deviceBubble">
                  <div className="deviceBubbleItem">
                    <strong>Вы:</strong>
                    <span>«Сделай лендинг и API, добавь превью и автотесты»</span>
                  </div>
                  <div className="deviceBubbleItem">
                    <strong>easyappz:</strong>
                    <span>«Готово. Сборка прошла. Откройте превью и отчёт тестов.»</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12, lineHeight: 1.4 }}>
            Плейсхолдер интерфейса (без реальных изображений)
          </div>
        </div>
      </div>
    </section>
  );
}
