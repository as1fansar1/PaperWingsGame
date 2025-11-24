import React from 'react';
import { GameStatus } from '../types';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface HUDProps {
  status: GameStatus;
  score: number;
  highScore: number;
  onStart: () => void;
  onRestart: () => void;
}

const HUD: React.FC<HUDProps> = ({ status, score, highScore, onStart, onRestart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col items-center justify-center p-4">
      {/* Score Top Right */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
         <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 text-white font-bold text-xl shadow-lg flex items-center gap-2">
            <Trophy size={20} className="text-yellow-300" />
            <span>Score: {Math.floor(score)}</span>
         </div>
         <div className="text-white/80 text-sm font-semibold drop-shadow-md">
            High Score: {highScore}
         </div>
      </div>

      {/* Start Screen */}
      {status === 'idle' && (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-md w-full border-4 border-sky-200 transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-5xl font-black text-sky-500 mb-2 tracking-tight">Paper Wings</h1>
          <p className="text-slate-500 mb-8 font-medium">Glide through the clouds. Collect stars. Avoid the birds.</p>
          
          <div className="flex flex-col gap-4 text-left bg-sky-50 p-4 rounded-xl mb-8 text-sm text-slate-600">
             <div className="flex items-center gap-3">
                <span className="bg-white border border-slate-300 px-2 py-1 rounded shadow-sm font-bold text-xs">↑</span>
                <span>Fly Up / Climb</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="bg-white border border-slate-300 px-2 py-1 rounded shadow-sm font-bold text-xs">↓</span>
                <span>Dive Down</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="bg-white border border-slate-300 px-2 py-1 rounded shadow-sm font-bold text-xs">← →</span>
                <span>Control Speed</span>
             </div>
          </div>

          <button
            onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Play fill="currentColor" /> Take Flight
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {status === 'game-over' && (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl text-center pointer-events-auto max-w-md w-full border-4 border-red-200 animate-bounce-in">
          <h2 className="text-4xl font-black text-red-500 mb-2">Crashed!</h2>
          <p className="text-slate-500 mb-6 font-medium">Your paper plane has grounded.</p>
          
          <div className="bg-slate-100 rounded-2xl p-6 mb-8 flex flex-col gap-2">
             <span className="text-slate-500 text-sm uppercase tracking-wider font-bold">Final Score</span>
             <span className="text-5xl font-black text-slate-800">{Math.floor(score)}</span>
             {score >= highScore && score > 0 && (
                <span className="text-yellow-500 font-bold text-sm bg-yellow-100 px-3 py-1 rounded-full self-center mt-2">New High Score!</span>
             )}
          </div>

          <button
            onClick={onRestart}
            className="w-full py-4 bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw /> Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default HUD;