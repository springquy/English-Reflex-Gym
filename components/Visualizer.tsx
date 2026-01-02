
import React from 'react';

export const Visualizer: React.FC = () => {
  return (
    <div className="flex gap-2 items-end h-12">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="w-2 bg-indigo-500 rounded-full wave-bar"
          style={{ 
            animationDelay: `${i * 0.15}s`,
            height: `${20 + Math.random() * 60}%`
          }}
        ></div>
      ))}
    </div>
  );
};
