import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Calculator, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function DataTutorial({ onFinish }) {
  const [step, setStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (step === 1) {
      setTimeout(() => setAnimateBars(true), 300);
    } else {
      setAnimateBars(false);
    }
  }, [step]);

  const handleAnswer = (isCorrect) => {
    if (showFeedback) return;
    setSelectedAnswer(isCorrect);
    setShowFeedback(true);
  };

  const nextStep = () => {
    if (step === 2) {
      onFinish();
    } else {
      setStep(s => s + 1);
      setShowFeedback(false);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-800 border-4 border-amber-500 shadow-[8px_8px_0_0_rgba(245,158,11,0.5)] flex flex-col min-h-[500px]">
        
        {/* Header */}
        <div className="bg-black border-b-4 border-amber-500 p-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-pixel text-yellow-400">
            {step === 0 && "TUTORIAL: ENTENDENDO OS DADOS"}
            {step === 1 && "A ESCALA DO PROBLEMA"}
            {step === 2 && "MATEMÁTICA DA REALIDADE"}
          </h2>
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 0 ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="text-center max-w-2xl animate-fade-in">
              <BarChart3 className="w-24 h-24 mx-auto text-amber-500 mb-6" />
              <h3 className="text-3xl font-bold mb-6">A Matemática Salva Vidas</h3>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                Antes de iniciar sua jornada pelo mapa, precisamos entender o cenário em que estamos pisando. 
                Os números não são apenas dígitos em uma lousa; eles representam vidas reais.
                <br /><br />
                Vamos analisar dados reais divulgados pelo <strong>Fórum Brasileiro de Segurança Pública</strong> 
                para compreender a urgência de combatermos a violência contra a mulher.
              </p>
              <button 
                onClick={nextStep}
                className="bg-amber-600 hover:bg-amber-500 text-white font-pixel px-8 py-4 border-b-4 border-amber-800 active:translate-y-1 active:border-b-0 transition-all flex items-center mx-auto"
              >
                ACESSAR DADOS <ArrowRight className="ml-2" />
              </button>
            </div>
          )}

          {/* STEP 1: GRÁFICOS DE BARRAS */}
          {step === 1 && (
            <div className="w-full">
              <p className="text-center text-slate-300 mb-8 font-semibold">
                Observe o crescimento das denúncias. Note a grande diferença de escala entre os tipos de violência.
              </p>
              
              {/* Custom CSS Bar Chart */}
              <div className="flex flex-col space-y-6 w-full max-w-3xl mx-auto bg-slate-900 p-6 rounded-lg border-2 border-slate-700">
                
                {/* Bar 1 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-red-400">Ameaças</span>
                    <span className="text-slate-400">778.921 registros</span>
                  </div>
                  <div className="w-full bg-slate-800 h-8 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full transition-all duration-1000 ease-out flex items-center px-2"
                      style={{ width: animateBars ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>

                {/* Bar 2 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-orange-400">Agressões Físicas</span>
                    <span className="text-slate-400">258.941 registros</span>
                  </div>
                  <div className="w-full bg-slate-800 h-8 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-1000 ease-out delay-300"
                      style={{ width: animateBars ? '33%' : '0%' }}
                    ></div>
                  </div>
                </div>

                {/* Bar 3 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-yellow-400">Stalking (Perseguição)</span>
                    <span className="text-slate-400">77.083 registros</span>
                  </div>
                  <div className="w-full bg-slate-800 h-8 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full transition-all duration-1000 ease-out delay-500"
                      style={{ width: animateBars ? '10%' : '0%' }}
                    ></div>
                  </div>
                </div>

              </div>

              <div className="mt-10 flex justify-center">
                <button 
                  onClick={nextStep}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-pixel px-8 py-4 border-b-4 border-amber-800 active:translate-y-1 active:border-b-0 transition-all flex items-center"
                >
                  PRÓXIMO <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MATH CHALLENGE */}
          {step === 2 && (
            <div className="w-full flex flex-col md:flex-row gap-8 items-start">
              
              {/* Data Panel */}
              <div className="flex-1 bg-slate-900 p-6 rounded-lg border-2 border-slate-700 w-full">
                <div className="flex items-center space-x-3 mb-6 border-b border-slate-700 pb-4">
                  <PieChart className="text-purple-400 w-8 h-8" />
                  <h3 className="text-xl font-bold text-purple-400">Quem comete o feminicídio?</h3>
                </div>
                
                <ul className="space-y-4 text-lg mb-6">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center"><div className="w-4 h-4 bg-purple-600 rounded mr-3"></div> Parceiro Íntimo:</span>
                    <span className="font-bold font-mono text-purple-400">63,0%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center"><div className="w-4 h-4 bg-purple-500 rounded mr-3"></div> Ex-parceiro:</span>
                    <span className="font-bold font-mono text-purple-400">21,2%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center"><div className="w-4 h-4 bg-purple-400 rounded mr-3"></div> Familiar:</span>
                    <span className="font-bold font-mono text-purple-400">8,7%</span>
                  </li>
                  <li className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center"><div className="w-4 h-4 bg-slate-600 rounded mr-3"></div> Outros / Desconhecidos:</span>
                    <span className="font-mono">7,1%</span>
                  </li>
                </ul>

                <div className="bg-black/50 p-4 rounded text-sm text-slate-300 italic border-l-4 border-purple-500">
                  "Esses dados comprovam que o lugar mais perigoso para uma mulher em situação de violência é a própria casa."
                </div>
              </div>

              {/* Quiz Panel */}
              <div className="flex-1 bg-slate-800 p-6 border-4 border-amber-500 rounded-lg w-full relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-pixel px-4 py-2 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" /> DESAFIO MATEMÁTICO
                </div>
                
                <p className="mt-6 mb-6 text-lg font-medium leading-relaxed">
                  Somando a porcentagem de <strong>parceiros íntimos</strong>, <strong>ex-parceiros</strong> e <strong>familiares</strong>, 
                  qual é a porcentagem total de vítimas mortas por pessoas do seu próprio círculo de convívio?
                </p>

                <div className="space-y-3">
                  {[
                    { label: 'A) 74,2%', correct: false },
                    { label: 'B) 84,2%', correct: false },
                    { label: 'C) 92,9%', correct: true },
                    { label: 'D) 100%', correct: false },
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option.correct)}
                      disabled={showFeedback}
                      className={`w-full p-4 border-2 rounded-lg text-left font-bold transition-all
                        ${!showFeedback ? 'border-slate-600 hover:border-amber-400 hover:bg-slate-700 bg-slate-900' : ''}
                        ${showFeedback && option.correct ? 'border-green-500 bg-green-900/50 text-green-400' : ''}
                        ${showFeedback && !option.correct && selectedAnswer === option.correct ? 'border-red-500 bg-red-900/50 text-red-400' : ''}
                        ${showFeedback && !option.correct && selectedAnswer !== option.correct ? 'border-slate-700 opacity-50 bg-slate-900' : ''}
                      `}
                    >
                      {option.label}
                      {showFeedback && option.correct && <CheckCircle2 className="inline-block float-right" />}
                      {showFeedback && !option.correct && selectedAnswer === option.correct && <XCircle className="inline-block float-right" />}
                    </button>
                  ))}
                </div>

                {showFeedback && (
                  <div className={`mt-6 p-4 rounded border-2 ${selectedAnswer ? 'border-green-500 bg-green-900/30' : 'border-red-500 bg-red-900/30'}`}>
                    <p className="font-bold mb-2 flex items-center">
                      {selectedAnswer ? <span className="text-green-400 flex items-center"><CheckCircle2 className="mr-2" /> Correto!</span> : <span className="text-red-400 flex items-center"><XCircle className="mr-2" /> Incorreto!</span>}
                    </p>
                    <p className="text-sm mb-4">
                      <strong>Cálculo:</strong> 63,0 + 21,2 + 8,7 = <strong>92,9%</strong>. Quase 93% dos agressores são conhecidos da vítima. Isso destrói o mito de que o perigo está apenas "em becos escuros com desconhecidos".
                    </p>
                    {selectedAnswer ? (
                      <button 
                        onClick={nextStep}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-pixel py-3 rounded flex justify-center items-center"
                      >
                        INICIAR TRILHA <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowFeedback(false);
                          setSelectedAnswer(null);
                        }}
                        className="w-full bg-slate-600 hover:bg-slate-500 text-white font-pixel py-3 rounded"
                      >
                        TENTAR NOVAMENTE
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
