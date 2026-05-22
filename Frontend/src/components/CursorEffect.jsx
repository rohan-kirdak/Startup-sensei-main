import React, { useState, useEffect, useRef } from 'react';

const CursorEffect = () => {
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const [trailParticles, setTrailParticles] = useState([]);
  const [touchWaves, setTouchWaves] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Check if the device has a mouse/pointer interface
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (isMobile) {
      // Touch feedback handler for mobile viewports
      const onTouchStart = (e) => {
        const touch = e.touches[0];
        const newWave = {
          id: Date.now() + Math.random(),
          x: touch.clientX,
          y: touch.clientY
        };
        setTouchWaves(prev => [...prev.slice(-5), newWave]); // Limit to max 5 concurrent waves
      };

      window.addEventListener('touchstart', onTouchStart, { passive: true });
      return () => {
        window.removeEventListener('touchstart', onTouchStart);
      };
    }

    // Desktop mouse effect logic
    const cursorDot = cursorDotRef.current;
    const cursorOutline = cursorOutlineRef.current;

    let posX = 0, posY = 0;
    let mouseX = -100, mouseY = -100;
    let lastTrailX = 0, lastTrailY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }

      // Trail particle throttle: spawn every 25 pixels traveled to create magical embers
      const distance = Math.hypot(mouseX - lastTrailX, mouseY - lastTrailY);
      if (distance > 25) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: mouseX,
          y: mouseY,
          size: Math.random() * 4 + 2, // 2px to 6px
        };
        setTrailParticles(prev => [...prev.slice(-15), newParticle]); // Limit to 15 particles max
        lastTrailX = mouseX;
        lastTrailY = mouseY;
      }
    };

    const updateOutline = () => {
      // Linear interpolation lag factor: slower/smoother when hovering
      const lag = isHovered ? 0.08 : 0.15;
      posX += (mouseX - posX) * lag;
      posY += (mouseY - posY) * lag;

      if (cursorOutline) {
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
      }

      requestAnimationFrame(updateOutline);
    };

    const onMouseDown = () => {
      setIsClicking(true);
    };

    const onMouseUp = () => {
      setIsClicking(false);
    };

    // Global Hover Delegation listener for interactive elements
    const onMouseOver = (e) => {
      if (!e.target) return;
      const interactive = e.target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer, .glass-hover, .hud-card-hover');
      setIsHovered(!!interactive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);

    const animId = requestAnimationFrame(updateOutline);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animId);
    };
  }, [isHovered]);

  const removeTrailParticle = (id) => {
    setTrailParticles(prev => prev.filter(p => p.id !== id));
  };

  const removeTouchWave = (id) => {
    setTouchWaves(prev => prev.filter(w => w.id !== id));
  };

  // If mobile touch device, only render touch tap wave overlays
  if (window.matchMedia("(pointer: coarse)").matches) {
    return (
      <>
        {touchWaves.map(wave => (
          <span
            key={wave.id}
            className="fixed pointer-events-none z-[9999] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-400 bg-teal-400/10 animate-touch-wave"
            style={{ left: `${wave.x}px`, top: `${wave.y}px` }}
            onAnimationEnd={() => removeTouchWave(wave.id)}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {/* 1. Original tiny active center dot */}
      <div 
        ref={cursorDotRef}
        className={`fixed pointer-events-none z-[9999] rounded-full mix-blend-screen transition-all duration-100 ease-out shadow-[0_0_8px_#14b8a6] ${
          isHovered 
            ? 'h-4 w-4 bg-teal-300 opacity-60' 
            : isClicking 
              ? 'h-1.5 w-1.5 bg-violet-400 scale-75' 
              : 'h-2.5 w-2.5 bg-teal-400'
        } -translate-x-1/2 -translate-y-1/2`}
        style={{ left: '-20px', top: '-20px' }}
      />

      {/* 2. Original smooth lagged tracking outline */}
      <div 
        ref={cursorOutlineRef}
        className={`fixed pointer-events-none z-[9998] rounded-full mix-blend-screen transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovered
            ? 'h-16 w-16 border-2 border-teal-400 bg-teal-500/10 shadow-[0_0_25px_rgba(20,184,166,0.3)] scale-110'
            : isClicking
              ? 'h-8 w-8 border border-violet-400 bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
              : 'h-11 w-11 border border-violet-500/40 bg-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
        }`}
        style={{ left: '-50px', top: '-50px' }}
      />
      
      {/* 3. Original gorgeous trailing sparkles/embers */}
      {trailParticles.map(particle => (
        <span 
          key={particle.id}
          className="fixed pointer-events-none z-[9997] rounded-full bg-gradient-to-r from-teal-400/50 to-violet-400/40 animate-cursor-sparkle"
          style={{ 
            left: `${particle.x}px`, 
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
          onAnimationEnd={() => removeTrailParticle(particle.id)}
        />
      ))}
    </>
  );
};

export default CursorEffect;
