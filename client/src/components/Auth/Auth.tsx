import React, { useState } from 'react';
import './Auth.css';
export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="logo-emoji">📌</span>
          <h2>Padlet</h2>
          <p>לוח שיתופי חכם</p>
        </div>

        <div className="tabs">
          <button 
            className={isLogin ? 'tab active' : 'tab'} 
            onClick={() => setIsLogin(true)}
          >
            כניסה
          </button>
          <button 
            className={!isLogin ? 'tab active' : 'tab'} 
            onClick={() => setIsLogin(false)}
          >
            הרשמה
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field">
            <label>שם משתמש</label>
            <input type="text" placeholder="הכנס שם משתמש" />
          </div>
          <div className="input-field">
            <label>סיסמה</label>
            <input type="password" placeholder="הכנס סיסמה" />
          </div>
          <button type="submit" className="btn-submit">
            {isLogin ? 'כניסה' : 'הרשמה'}
          </button>
        </form>
      </div>
    </div>
  );
};