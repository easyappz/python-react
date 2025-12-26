import React, { useMemo } from 'react';
import TopNav from './sections/TopNav/index.jsx';
import HeroStory from './sections/HeroStory/index.jsx';
import StoryChapters from './sections/StoryChapters/index.jsx';
import FeaturesGrid from './sections/FeaturesGrid/index.jsx';
import FooterContacts from './sections/FooterContacts/index.jsx';
import { useLenisScroll } from './utils/useLenisScroll.jsx';
import './home.css';

export const Home = () => {
  const { scrollToId } = useLenisScroll();

  const navItems = useMemo(
    () => [
      { id: 'how-it-works', label: 'Как это работает', testId: 'nav-how' },
      { id: 'features', label: 'Возможности', testId: 'nav-features' },
    ],
    []
  );

  return (
    <div data-easytag="id1-react/src/components/Home/index.jsx" className="homeRoot">
      <TopNav items={navItems} onNavigate={scrollToId} />

      <main className="homeMain">
        <HeroStory onPrimaryCta={(e) => e.preventDefault()} onSecondaryCta={() => scrollToId('features')} />
        <StoryChapters />
        <FeaturesGrid />
        <FooterContacts />
      </main>
    </div>
  );
};
