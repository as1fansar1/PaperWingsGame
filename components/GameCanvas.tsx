import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, GameStatus, Entity, EntityType } from '../types';
import Plane from './Plane';
import GameEntity from './GameEntity';
import HUD from './HUD';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GRAVITY,
  LIFT,
  MAX_SPEED,
  PLANE_HEIGHT,
  PLANE_WIDTH,
  SPAWN_RATE_CLOUDS,
  SPAWN_RATE_OBSTACLES,
  SPAWN_RATE_STARS,
  SPAWN_RATE_CANDY,
  INVINCIBILITY_DURATION,
  WORLD_SPEED,
  FRICTION
} from '../constants';

const GameCanvas: React.FC = () => {
  // Use a ref for the container to handle responsive scaling
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Refs for high-frequency updates to avoid React render lag
  // We mirror these to state for rendering frames, but calculate using refs
  const planeRef = useRef({
    x: 100,
    y: CANVAS_HEIGHT / 2,
    width: PLANE_WIDTH,
    height: PLANE_HEIGHT,
    dx: 0,
    dy: 0,
    rotation: 0,
    invincible: false,
  });
  
  const invincibleUntilRef = useRef(0);
  
  const entitiesRef = useRef<Entity[]>([]);
  const requestRef = useRef<number>();
  const scoreRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // Helper to force render
  const [, setTick] = useState(0);

  const spawnEntity = () => {
    const r = Math.random();
    let type: EntityType | null = null;
    let y = 0;
    let width = 0;
    let height = 0;
    let speed = WORLD_SPEED;

    if (r < SPAWN_RATE_OBSTACLES) {
      type = 'bird';
      width = 40;
      height = 40;
      y = Math.random() * (CANVAS_HEIGHT - height);
      speed = WORLD_SPEED + 2 + Math.random() * 2; // Birds are faster
    } else if (r < SPAWN_RATE_OBSTACLES + SPAWN_RATE_CANDY) {
      type = 'candy';
      width = 44; // Increased size by ~20%
      height = 44;
      y = Math.random() * (CANVAS_HEIGHT - height);
    } else if (r < SPAWN_RATE_OBSTACLES + SPAWN_RATE_CANDY + SPAWN_RATE_STARS) {
      type = 'star';
      width = 30;
      height = 30;
      y = Math.random() * (CANVAS_HEIGHT - height);
    } else if (r < SPAWN_RATE_OBSTACLES + SPAWN_RATE_CANDY + SPAWN_RATE_STARS + SPAWN_RATE_CLOUDS) {
      type = 'cloud';
      width = 80 + Math.random() * 100;
      height = 50 + Math.random() * 40;
      y = Math.random() * (CANVAS_HEIGHT - height);
      speed = WORLD_SPEED * (0.5 + Math.random() * 0.5); // Parallax effect
    }

    if (type) {
      entitiesRef.current.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: CANVAS_WIDTH + 50, // Spawn just offscreen
        y,
        width,
        height,
        speed,
      });
    }
  };

  const checkCollision = (rect1: any, rect2: any) => {
    // Shrink hitboxes slightly for forgiving gameplay
    const padding = 10;
    return (
      rect1.x < rect2.x + rect2.width - padding &&
      rect1.x + rect1.width > rect2.x + padding &&
      rect1.y < rect2.y + rect2.height - padding &&
      rect1.y + rect1.height > rect2.y + padding
    );
  };

  const gameOver = useCallback(() => {
    setStatus('game-over');
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('paperWingsHighScore', String(Math.floor(scoreRef.current)));
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, [highScore]);

  const updatePhysics = () => {
    const plane = planeRef.current;
    const now = Date.now();

    // Check invincibility
    if (now < invincibleUntilRef.current) {
      plane.invincible = true;
    } else {
      plane.invincible = false;
    }

    // Apply Gravity
    plane.dy += GRAVITY;

    // Input Handling
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has(' ')) {
        plane.dy += LIFT * 0.1; // Gradual lift
    }
    if (keysPressed.current.has('ArrowDown')) {
        plane.dy += 0.5; // Dive
    }
    
    // Horizontal Movement
    if (keysPressed.current.has('ArrowLeft')) {
        plane.dx -= 0.5;
    } else if (keysPressed.current.has('ArrowRight')) {
        plane.dx += 0.5;
    } else {
        plane.dx *= FRICTION; // Slow down horizontal movement if no key pressed
    }

    // Cap velocity
    plane.dy = Math.max(Math.min(plane.dy, MAX_SPEED), -MAX_SPEED);
    plane.dx = Math.max(Math.min(plane.dx, MAX_SPEED), -MAX_SPEED);

    // Apply Velocity
    plane.y += plane.dy;
    plane.x += plane.dx;

    // Rotation based on velocity (Increased multiplier for visual effect at lower speeds)
    plane.rotation = plane.dy * 4;

    // Boundaries
    if (plane.y > CANVAS_HEIGHT - plane.height) {
        plane.y = CANVAS_HEIGHT - plane.height;
        plane.dy = 0; // Just slide on the ground, don't crash
    }
    if (plane.y < 0) {
        plane.y = 0;
        plane.dy = 0;
    }
    if (plane.x < 0) plane.x = 0;
    if (plane.x > CANVAS_WIDTH - plane.width) plane.x = CANVAS_WIDTH - plane.width;

    // Entity Management
    spawnEntity();
    
    entitiesRef.current.forEach(entity => {
      entity.x -= entity.speed;
    });

    // Remove off-screen entities
    entitiesRef.current = entitiesRef.current.filter(e => e.x > -200);

    // Collision Detection
    entitiesRef.current.forEach(entity => {
        if (checkCollision(plane, entity)) {
            if (entity.type === 'bird') {
                if (!plane.invincible) {
                  gameOver();
                }
                // If invincible, fly through (no action)
            } else if (entity.type === 'star') {
                scoreRef.current += 20;
                entity.x = -9999; // Remove entity
            } else if (entity.type === 'candy') {
                invincibleUntilRef.current = Date.now() + INVINCIBILITY_DURATION;
                scoreRef.current += 5;
                entity.x = -9999; // Remove entity
            }
        }
    });

    // Score based on survival
    scoreRef.current += 0.05;
    setScore(scoreRef.current);
  };

  const gameLoop = useCallback(() => {
    if (status === 'playing') {
      updatePhysics();
      setTick(prev => prev + 1); // Trigger render
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  }, [status, gameOver]);

  // Start/Restart Logic
  const startGame = () => {
    planeRef.current = {
      x: 100,
      y: CANVAS_HEIGHT / 3,
      width: PLANE_WIDTH,
      height: PLANE_HEIGHT,
      dx: 0,
      dy: 0,
      rotation: 0,
      invincible: false,
    };
    invincibleUntilRef.current = 0;
    entitiesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setStatus('playing');
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Loop
  useEffect(() => {
    if (status === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, gameLoop]);

  // Load High Score
  useEffect(() => {
      const stored = localStorage.getItem('paperWingsHighScore');
      if (stored) setHighScore(parseInt(stored));
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Game Container - Scaled to fit screen but maintain aspect ratio logic */}
        <div 
            ref={containerRef}
            className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 shadow-2xl"
            style={{
                width: '100%',
                height: '100%',
                maxWidth: '1000px', // Matches CANVAS_WIDTH roughly for logic
                maxHeight: '600px',
                aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
            }}
        >
            {/* ViewBox Scaling Wrapper:  We render everything in virtual coordinates (1000x600) and let CSS scale it */}
            <div 
                className="absolute top-0 left-0 w-full h-full"
                style={{
                    position: 'relative',
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: `scale(${
                        containerRef.current 
                        ? Math.min(
                            containerRef.current.clientWidth / CANVAS_WIDTH, 
                            containerRef.current.clientHeight / CANVAS_HEIGHT
                          ) 
                        : 1
                    })`,
                    transformOrigin: 'top left'
                }}
            >
                {/* Background Decoration (Sun) */}
                <div className="absolute top-10 right-20 w-32 h-32 bg-yellow-200 rounded-full blur-2xl opacity-50"></div>

                <Plane data={planeRef.current} />
                
                {entitiesRef.current.map(entity => (
                    <GameEntity key={entity.id} entity={entity} />
                ))}
            </div>

             <HUD 
                status={status} 
                score={score} 
                highScore={highScore}
                onStart={startGame}
                onRestart={startGame}
            />
        </div>
    </div>
  );
};

export default GameCanvas;