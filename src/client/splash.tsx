import './index.css';

import { requestExpandedMode } from '@devvit/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const Splash = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-white dark:bg-gray-900 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Luduria</h1>
      <p className="text-base text-gray-600 dark:text-gray-300">
        Every stay is a bet that the stranger won't walk away.
      </p>
      <button
        className="flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white h-10 px-4 rounded-full cursor-pointer transition-colors hover:bg-[#c23300] dark:hover:bg-orange-700"
        onClick={e => requestExpandedMode(e.nativeEvent, 'game')}
      >
        Tap to Start
      </button>
    </div>
  );
};

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
