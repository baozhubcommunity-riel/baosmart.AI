import React, { useEffect, useState, useRef } from 'react';

export type AvatarState = 'idle' | 'thinking' | 'error' | 'success' | 'sleeping' | 'surprised' | 'winking';

interface AIAvatarProps {
  state: AvatarState;
  size?: number;
}

const AIAvatar: React.FC<AIAvatarProps> = ({ state, size = 40 }) => {
  const [blink, setBlink] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Random blink logic (only when eyes are open)
  useEffect(() => {
    if (state === 'sleeping' || state === 'error') return;

    const scheduleBlink = () => {
      const nextBlinkTime = Math.random() * 3000 + 2000; // 2-5 seconds
      setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 150); // Blink duration
      }, nextBlinkTime);
    };

    const timer = scheduleBlink();
    return () => clearTimeout(timer as any);
  }, [state]);

  // Mouse Tracking Logic
  useEffect(() => {
    if (state !== 'idle' && state !== 'success') {
      setPupilPos({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center normalized (-1 to 1)
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      
      // Limit movement range (max 6px movement)
      const limit = 6; 
      setPupilPos({
        x: Math.max(-limit, Math.min(limit, dx * limit)),
        y: Math.max(-limit, Math.min(limit, dy * limit))
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  // Color mapping
  const colors = {
    idle: 'text-indigo-600 bg-indigo-100',
    thinking: 'text-purple-600 bg-purple-100',
    error: 'text-red-600 bg-red-100',
    success: 'text-green-600 bg-green-100',
    sleeping: 'text-blue-500 bg-blue-50',
    surprised: 'text-orange-500 bg-orange-100',
    winking: 'text-pink-500 bg-pink-100',
  };

  const currentStateColor = colors[state] || colors.idle;

  const baseClasses = `relative flex items-center justify-center rounded-2xl transition-all duration-500 ${currentStateColor} shadow-sm cursor-pointer select-none overflow-hidden`;

  return (
    <div 
      ref={containerRef}
      className={baseClasses} 
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Face Container (SVG) */}
      <svg
        viewBox="0 0 100 100"
        className="w-3/4 h-3/4 transition-transform duration-300"
        style={{ 
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
        fill="currentColor"
      >
        {/* EYES GROUP */}
        <g className="transition-all duration-300" style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }}>
          {state === 'error' ? (
            // Error Eyes (> <)
            <>
              <path d="M20,35 L40,55 M20,55 L40,35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              <path d="M60,35 L80,55 M60,55 L80,35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            </>
          ) : state === 'sleeping' ? (
            // Sleeping Eyes (Closed curves)
            <>
              <path d="M20,50 Q30,60 40,50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M60,50 Q70,60 80,50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
              {/* Zzz Animation */}
              <g className="animate-bounce opacity-0" style={{ animation: 'fade-in-up 2s infinite' }}>
                 <text x="75" y="25" fontSize="15" fill="currentColor" style={{ animationDelay: '0s' }}>z</text>
                 <text x="85" y="15" fontSize="10" fill="currentColor" style={{ animationDelay: '0.5s' }}>z</text>
              </g>
            </>
          ) : state === 'winking' ? (
             // Wink (Left open, Right closed)
             <>
               <ellipse cx="30" cy="45" rx="10" ry="12" />
               <path d="M60,45 Q70,55 80,45" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
             </>
          ) : state === 'surprised' ? (
            // Surprised (Wide eyes)
             <>
              <circle cx="30" cy="45" r="14" />
              <circle cx="70" cy="45" r="14" />
              <circle cx="30" cy="45" r="5" fill="white" />
              <circle cx="70" cy="45" r="5" fill="white" />
             </>
          ) : (
            // Normal Eyes (Idle/Thinking/Success)
            <>
              {/* Left Eye */}
              <ellipse 
                cx={state === 'thinking' ? 30 : 30} 
                cy="45" 
                rx={blink ? 12 : 10} 
                ry={blink ? 1 : 12} 
                className={`transition-all duration-100 ${state === 'thinking' ? 'animate-pulse' : ''}`}
              />
              {/* Right Eye */}
              <ellipse 
                cx={state === 'thinking' ? 70 : 70} 
                cy="45" 
                rx={blink ? 12 : 10} 
                ry={blink ? 1 : 12} 
                className={`transition-all duration-100 ${state === 'thinking' ? 'animate-pulse' : ''}`}
              />
            </>
          )}
        </g>

        {/* MOUTH GROUP */}
        <g className="transition-all duration-500" style={{ transform: `translate(${pupilPos.x * 0.5}px, ${pupilPos.y * 0.5}px)` }}>
          {state === 'thinking' ? (
            // Thinking Mouth (Small Circle/O)
            <circle cx="50" cy="75" r="6" />
          ) : state === 'error' ? (
            // Error Mouth (Wavy)
             <path d="M30,75 Q50,65 70,75" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : state === 'success' || state === 'winking' ? (
            // Happy/Wink Mouth (Big Smile)
            <path d="M25,70 Q50,90 75,70" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
          ) : state === 'surprised' ? (
            // Surprised Mouth (Open O)
            <ellipse cx="50" cy="75" rx="8" ry="10" stroke="currentColor" strokeWidth="4" fill="none" />
          ) : (
            // Idle Mouth (Small Smile)
            <path d="M35,75 Q50,82 65,75" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* ACCESSORIES / PARTICLES */}
        {state === 'thinking' && (
          <g className="animate-spin origin-center text-purple-400 opacity-50">
             <circle cx="50" cy="10" r="3" />
             <circle cx="90" cy="50" r="3" />
             <circle cx="50" cy="90" r="3" />
             <circle cx="10" cy="50" r="3" />
          </g>
        )}
      </svg>

      {/* Status Indicator Dot */}
      <span className={`absolute -top-1 -right-1 flex h-3 w-3`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
             state === 'idle' ? 'bg-green-400' : 
             state === 'thinking' ? 'bg-purple-400' : 
             state === 'error' ? 'bg-red-400' : 
             state === 'sleeping' ? 'bg-blue-400' : 'bg-blue-400'
        }`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${
             state === 'idle' ? 'bg-green-500' : 
             state === 'thinking' ? 'bg-purple-500' : 
             state === 'error' ? 'bg-red-500' : 
             state === 'sleeping' ? 'bg-blue-500' : 'bg-blue-500'
        }`}></span>
      </span>
    </div>
  );
};

export default AIAvatar;