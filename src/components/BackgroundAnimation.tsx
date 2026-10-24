import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Lightbulb, Trash2, Footprints, MoreHorizontal } from 'lucide-react';

const icons = [
  { Icon: Droplets, color: 'text-blue-400' },
  { Icon: Lightbulb, color: 'text-yellow-400' },
  { Icon: Trash2, color: 'text-red-400' },
  { Icon: Footprints, color: 'text-emerald-400' },
];

export default function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#fdfdfd] dark:bg-slate-950 transition-colors duration-500">
      {/* City Skyline Layer */}
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.1] mix-blend-multiply dark:mix-blend-overlay grayscale"
        style={{ 
          backgroundImage: `url('/src/assets/images/city_skyline_faded_1792847565684.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom'
        }}
      />

      {/* Decorative Green/Blue Shape from Image */}
      <div className="absolute top-0 right-0 w-[45%] h-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path d="M40,0 L100,0 L100,100 L0,100 Z" fill="url(#grad1)" opacity="0.9" />
        </svg>
      </div>

      {/* Floating Symbols */}
      {Array.from({ length: 20 }).map((_, i) => {
        const { Icon, color } = icons[i % icons.length];
        const delay = i * 0.5;
        const duration = 20 + Math.random() * 20;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              opacity: [0, 0.2, 0.2, 0],
              y: -200,
              rotate: 360
            }}
            transition={{ 
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
            className={`absolute ${color}`}
          >
            <Icon size={24 + Math.random() * 24} />
          </motion.div>
        );
      })}

      {/* Triple Dots on bottom right as seen in image */}
      <div className="absolute bottom-10 right-10 opacity-60 text-white">
        <MoreHorizontal size={40} />
      </div>
    </div>
  );
}
