import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { RoleProvider } from '@/context/RoleContext';
import { LearningAuthProvider } from '@/features/learning/context/LearningAuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LearningAuthProvider>
      <RoleProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RoleProvider>
    </LearningAuthProvider>
  </React.StrictMode>,
)
