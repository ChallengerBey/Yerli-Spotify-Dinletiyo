
import React from 'react';

const InfoBox: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 border border-red-900/30 rounded-2xl p-6 mb-10 flex gap-4 items-start">
      <div className="bg-zinc-800 p-2 rounded-full border border-zinc-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1">Beraber Dinle Özelliği</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Arkadaşlarının yanındaki <span className="text-red-500 font-bold">"Beraber Dinle"</span> butonuna tıklayarak onlarla aynı anda müzik dinleyebilirsin.
        </p>
      </div>
    </div>
  );
};

export default InfoBox;
