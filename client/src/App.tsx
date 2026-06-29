import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from './shared/layout/AppHeader/AppHeader';
import { resolveBackgroundStyle } from './shared/constants/background-colors';
import styles from './App.module.css';

export interface AppOutletContext {
  setHeaderCenterSlot: (slot: ReactNode) => void;
  setHeaderBackground: (background: string | null) => void;
}

function App() {
  const navigate = useNavigate();
  const [headerCenterSlot, setHeaderCenterSlot] = useState<ReactNode>(null);
  const [headerBackground, setHeaderBackground] = useState<string | null>(null);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div
      className={styles.app}
      style={headerBackground ? { ...resolveBackgroundStyle(headerBackground), backgroundAttachment: 'fixed' } : undefined}
    >
      <AppHeader
        centerSlot={headerCenterSlot}
        background={headerBackground}
        onLogoClick={handleLogoClick}
      />
      <main className={styles.main}>
        <Outlet
          context={
            { setHeaderCenterSlot, setHeaderBackground } satisfies AppOutletContext
          }
        />
      </main>
    </div>
  );
}

export default App;
