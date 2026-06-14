import { Outlet } from 'react-router-dom';
import AppHeader from './shared/layout/AppHeader/AppHeader';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
