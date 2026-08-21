import React, { useState, useEffect, useRef } from 'react';
import { obstacles } from './GameData';

export default function BattleArena({ selectedCharacter, obstacleIndex, onVictory, onDefeat, isModal }) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [accumulatedPoints, setAccumulatedPoints] = useState(0);
  
  // Start with empty chat, the enemy sends the first message in useEffect
  const [messages, setMessages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stageCleared, setStageCleared] = useState(false);
  
  const chatEndRef = useRef(null);
  
  const currentObstacle = obstacles[obstacleIndex];
  const currentDialogue = currentObstacle?.dialogues[currentDialogueIndex];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, showOptions]);

  const triggerEnemyMessage = (text) => {
    setShowOptions(false);
    
    // Simulates typing...
    setTimeout(() => {
      setMessages(prev => [...prev, { text, sender: 'enemy' }]);
      setShowOptions(true);
    }, 1500);
  };

  // Initial trigger for the first message of an obstacle
  useEffect(() => {
    if (!gameOver && !stageCleared && currentObstacle && currentDialogue) {
      if (currentDialogueIndex === 0 && messages.length === 0) {
        triggerEnemyMessage(currentDialogue.enemyMessage);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obstacleIndex, currentDialogueIndex, gameOver, stageCleared]);

  const handleOptionClick = (option) => {
    setShowOptions(false);
    
    // Add player message
    setMessages(prev => [...prev, { text: option.text, sender: 'player' }]);
    
    // Process consequence
    setTimeout(() => {
      if (option.isCorrect) {
        setMessages(prev => [...prev, { text: `[SISTEMA]: ${option.feedback}`, sender: 'system_success' }]);
        setAccumulatedPoints(prev => prev + option.damage); // Using damage as points for simplicity
      } else {
        setMessages(prev => [...prev, { text: `[SISTEMA]: ${option.feedback}`, sender: 'system_error' }]);
        const newHp = Math.max(0, playerHp - option.damage);
        setPlayerHp(newHp);
        
        if (newHp === 0) {
          setGameOver(true);
          setMessages(prev => [...prev, { text: 'Sua autoestima zerou. O ciclo de abuso venceu desta vez. Busque ajuda e tente novamente.', sender: 'system_error' }]);
          return;
        }
      }

      // Next dialogue or next enemy
      setTimeout(() => {
        if (currentDialogueIndex + 1 < currentObstacle.dialogues.length) {
          setCurrentDialogueIndex(prev => prev + 1);
          triggerEnemyMessage(currentObstacle.dialogues[currentDialogueIndex + 1].enemyMessage);
        } else {
          // Defeated current obstacle
          setMessages(prev => [...prev, { text: `${currentObstacle.name.toUpperCase()} FOI BLOQUEADO!`, sender: 'system_success' }]);
          setStageCleared(true);
        }
      }, 2000);
      
    }, 1000);
  };

  const handleFinishStage = () => {
    if (onVictory) {
      // Add bonus points based on remaining HP
      onVictory(accumulatedPoints + playerHp);
    }
  };

  return (
    <div className={`flex items-center justify-center font-pixel h-full w-full`}>
      {/* Smartphone Frame */}
      <div className="w-full max-w-md h-full max-h-[90vh] bg-black border-[12px] border-slate-800 rounded-[3rem] relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>

        {/* Header - Chat App */}
        <div className="bg-[#075e54] text-white p-4 pt-8 flex items-center shadow-md z-10">
          <div className="w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-white flex-shrink-0 mr-3">
             <img 
               src={currentObstacle?.image || '/logo.png'} 
               alt="Enemy" 
               className="w-full h-full object-cover"
               style={{ imageRendering: 'pixelated' }}
             />
          </div>
          <div className="flex-1">
             <h3 className="text-[10px] md:text-xs font-bold truncate">
               {stageCleared ? 'VITÓRIA NA FASE' : gameOver ? 'FIM DE JOGO' : currentObstacle?.name}
             </h3>
             <p className="text-[8px] text-green-200">
               {stageCleared || gameOver ? 'Offline' : 'online'}
             </p>
          </div>
          
          {/* Player HP Indicator */}
          <div className="text-right">
             <p className="text-[8px] mb-1">AUTOESTIMA</p>
             <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full transition-all" style={{ width: `${(playerHp/100)*100}%`}}></div>
             </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#ece5dd] p-4 overflow-y-auto bg-[url('/bg-login.png')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-white/80"></div>
          
          <div className="relative z-10 flex flex-col gap-4">
            
            {/* Initial System Message */}
            {!stageCleared && !gameOver && (
              <div className="mx-auto bg-[#dcf8c6] px-4 py-2 rounded-lg text-[8px] md:text-[10px] text-slate-700 text-center max-w-[80%] shadow-sm border border-[#c4e5b3]">
                {new Date().toLocaleDateString()} - Você encontrou um novo obstáculo. Não deixe que afetem sua autonomia.
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'system_success' || msg.sender === 'system_error' ? (
                  <div className={`mx-auto px-4 py-2 rounded-lg text-[8px] md:text-[10px] text-white text-center max-w-[90%] shadow-sm border-2 ${msg.sender === 'system_success' ? 'bg-green-600 border-green-800' : 'bg-red-600 border-red-800'}`}>
                    {msg.text}
                  </div>
                ) : (
                  <div className="flex flex-col max-w-[85%]">
                    <div 
                      className={`p-3 text-[10px] md:text-[11px] leading-loose shadow-sm relative ${
                        msg.sender === 'player' 
                          ? 'bg-[#dcf8c6] text-slate-800 rounded-l-xl rounded-br-xl rounded-tr-sm border-b-2 border-r-2 border-[#b5db9d]' 
                          : 'bg-white text-slate-800 rounded-r-xl rounded-bl-xl rounded-tl-sm border-b-2 border-l-2 border-slate-300'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area / Options */}
        <div className="bg-[#f0f0f0] border-t border-slate-300 min-h-[120px] flex flex-col p-2">
           
           {stageCleared ? (
             <div className="flex-1 flex flex-col items-center justify-center p-4">
               <p className="text-green-600 text-[10px] text-center mb-4 leading-loose">Obstáculo superado! Você ganhou pontos bônus por sua autoestima restante.</p>
               <button onClick={handleFinishStage} className="w-full bg-green-600 text-white p-3 text-[10px] hover:bg-green-700 transition-colors rounded-xl">
                 VOLTAR AO MAPA
               </button>
             </div>
           ) : gameOver ? (
             <div className="flex-1 flex flex-col items-center justify-center p-4">
               <button onClick={onDefeat} className="w-full bg-red-600 text-white p-3 text-[10px] hover:bg-red-700 transition-colors rounded-xl">
                 FECHAR
               </button>
             </div>
           ) : showOptions && currentDialogue ? (
             <div className="flex-1 flex flex-col gap-2 p-1 overflow-y-auto">
               <p className="text-[8px] text-slate-500 mb-1 text-center">ESCOLHA SUA RESPOSTA:</p>
               {currentDialogue.options.map((opt, idx) => (
                 <button 
                   key={idx}
                   onClick={() => handleOptionClick(opt)}
                   className="text-left w-full bg-white p-3 rounded-lg border-2 border-slate-300 text-[9px] md:text-[10px] leading-relaxed hover:bg-[#dcf8c6] hover:border-green-500 transition-all text-slate-700 flex items-center justify-between group"
                 >
                   <span>{opt.text}</span>
                   <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">►</span>
                 </button>
               ))}
             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 animate-pulse">Aguardando mensagem...</span>
             </div>
           )}

        </div>

      </div>
    </div>
  );
}
