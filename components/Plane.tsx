import React from 'react';
import { Send } from 'lucide-react';
import { Plane as PlaneType } from '../types';

interface PlaneProps {
  data: PlaneType;
}

const Plane: React.FC<PlaneProps> = ({ data }) => {
  return (
    <div
      className="absolute z-20"
      style={{
        transform: `translate(${data.x}px, ${data.y}px) rotate(${data.rotation}deg)`,
        width: data.width,
        height: data.height,
        // Centering the pivot for rotation
        transformOrigin: 'center center',
        transition: 'none', // Critical for smooth game loop updates
      }}
    >
        <Send 
            size={48} 
            strokeWidth={1.5} 
            className={
              data.invincible 
                ? "text-fuchsia-500 fill-yellow-300 drop-shadow-[0_0_15px_rgba(236,72,153,1)] animate-pulse" 
                : "text-white fill-white/20 drop-shadow-lg"
            }
        />
    </div>
  );
};

export default Plane;