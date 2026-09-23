import React from 'react';
import { Shield, Users } from 'lucide-react';

export default function PathSelection({ onSelectPath }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 font-pixel">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl text-yellow-400 mb-6 drop-shadow-md">ESCOLHA SUA JORNADA</h1>
        <p className="text-sm text-white max-w-2xl mx-auto leading-loose">
          DOIS CAMINHOS, UM SÓ OBJETIVO: COMBATER A VIOLÊNCIA E CONSTRUIR UM FUTURO MELHOR.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        
        {/* Female Path */}
        <div 
          onClick={() => onSelectPath('F')}
          className="flex-1 bg-gradient-to-b from-purple-900 to-black border-4 border-purple-500 rounded-xl p-8 cursor-pointer transform hover:-translate-y-4 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mb-6 border-4 border-white group-hover:scale-110 transition-transform">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl text-purple-300 mb-4 font-bold">JORNADA DA AUTONOMIA</h2>
            <p className="text-xs text-purple-100 leading-relaxed mb-8">
              Jogue com as heroínas e aprenda a fortalecer sua rede de apoio, reconhecer seus direitos e se empoderar contra o machismo.
            </p>
            <button className="bg-purple-600 text-white px-8 py-3 border-b-4 border-purple-800 group-hover:bg-purple-500 font-bold">
              ESCOLHER MENINAS
            </button>
          </div>
        </div>

        {/* Male Path */}
        <div 
          onClick={() => onSelectPath('M')}
          className="flex-1 bg-gradient-to-b from-blue-900 to-black border-4 border-blue-500 rounded-xl p-8 cursor-pointer transform hover:-translate-y-4 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6 border-4 border-white group-hover:scale-110 transition-transform">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl text-blue-300 mb-4 font-bold">JORNADA DOS ALIADOS</h2>
            <p className="text-xs text-blue-100 leading-relaxed mb-8">
              Jogue com o Zeca e seus amigos. Aprenda a não reproduzir machismo, intervir em agressões e proteger as mulheres.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 border-b-4 border-blue-800 group-hover:bg-blue-500 font-bold">
              ESCOLHER MENINOS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
