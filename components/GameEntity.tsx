import React from 'react';
import { Cloud, Zap, Star, Bird, Candy } from 'lucide-react';
import { Entity } from '../types';

interface GameEntityProps {
  entity: Entity;
}

const GameEntity: React.FC<GameEntityProps> = ({ entity }) => {
  const getIcon = () => {
    switch (entity.type) {
      case 'cloud':
        return <Cloud size={entity.width} className="text-white/60 fill-white/40" />;
      case 'bird':
        return <Bird size={entity.width} className="text-red-500 fill-red-200" />;
      case 'star':
        return <Star size={entity.width} className="text-yellow-400 fill-yellow-200 animate-pulse" />;
      case 'candy':
        return <Candy size={entity.width} className="text-pink-500 fill-pink-200 animate-bounce" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute z-10"
      style={{
        transform: `translate(${entity.x}px, ${entity.y}px)`,
        width: entity.width,
        height: entity.height,
        transition: 'none',
      }}
    >
      {getIcon()}
    </div>
  );
};

export default GameEntity;