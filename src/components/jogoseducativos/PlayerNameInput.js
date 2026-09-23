import React, { useState } from 'react';

export default function PlayerNameInput({ onNameSubmit, onShowRanking }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 font-pixel">
      <div className="max-w-md w-full text-center border-4 border-amber-500 bg-black p-8 shadow-[8px_8px_0_0_rgba(245,158,11,0.5)]">
        <h1 className="text-2xl text-yellow-400 mb-6 leading-loose">BEM-VINDO À JORNADA</h1>
        <p className="text-xs text-slate-300 mb-8 leading-loose">
          Antes de escolher seu avatar, como devemos te chamar?
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SEU NOME OU APELIDO"
            maxLength={15}
            className="w-full bg-slate-800 text-white border-2 border-slate-600 p-4 text-center font-pixel text-sm focus:outline-none focus:border-amber-400"
            required
          />
          <button 
            type="submit"
            className="w-full bg-amber-600 text-white py-4 border-b-4 border-amber-800 hover:bg-amber-500 active:border-b-0 active:translate-y-1 transition-all"
          >
            INICIAR
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-slate-700">
          <p className="text-[10px] text-slate-400 mb-4 uppercase">Portal do Professor</p>
          <button 
            type="button"
            onClick={onShowRanking}
            className="w-full bg-slate-800 text-amber-400 py-3 border-2 border-amber-600 hover:bg-slate-700 active:translate-y-1 transition-all text-[10px]"
          >
            ACOMPANHAR RANKING AO VIVO
          </button>
        </div>
      </div>
    </div>
  );
}
