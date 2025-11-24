import React from 'react';
import GameCanvas from './components/GameCanvas';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-slate-800 flex items-center justify-center">
      <GameCanvas />
    </div>
  );
};

export default App;