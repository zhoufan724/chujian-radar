import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadSiteConfig } from './config';
import './styles.css';

// 先读运行时配置，再渲染，保证首屏就能决定是「兑换码模式」还是「自带 Key 模式」
loadSiteConfig().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
