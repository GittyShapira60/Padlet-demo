import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from './shared/layout/AppHeader/AppHeader';
import styles from './App.module.css';

export interface AppOutletContext {
  setHeaderCenterSlot: (slot: ReactNode) => void;
  setHeaderBackground: (background: string | null) => void;
  setHeaderActionSlot: (slot: ReactNode) => void;
}

function App() {
  const navigate = useNavigate();
  const [headerCenterSlot, setHeaderCenterSlot] = useState<ReactNode>(null);
  const [headerBackground, setHeaderBackground] = useState<string | null>(null);
  const [headerActionSlot, setHeaderActionSlot] = useState<ReactNode>(null);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className={styles.app}>
      <AppHeader
        centerSlot={headerCenterSlot}
        background={headerBackground}
        actionSlot={headerActionSlot}
        onLogoClick={handleLogoClick}
      />
      <main className={styles.main}>
        <Outlet
          context={
            { setHeaderCenterSlot, setHeaderBackground, setHeaderActionSlot } satisfies AppOutletContext
          }
        />
      </main>
    </div>
  );
}

export default App;
