
'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement;
      setHover(
        !!target.closest('a, button, [role="button"]')
      );
    };

    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <div
        className={`fixed left-0 top-0 rounded-full border border-[#171510] transition-[width,height,background-color,opacity] duration-300 ease-out ${
          hover
            ? 'h-10 w-10 bg-[#d6c9a7]/40'
            : 'h-5 w-5 bg-[#d6c9a7]/80'
        } ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#171510]" />
      </div>
    </div>
  );
}
