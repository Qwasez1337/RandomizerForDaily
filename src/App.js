import React, { useState } from 'react';
import { Users, Shuffle, Plus, X, Clock, UserCheck, RotateCcw, Target } from 'lucide-react';

const FairnessCycleTest = () => {
  const allParticipants = ['Голубев Владимир', 'Полозков Андрей', 'Климкович Лилия', 'Красноперов Кирилл', 'Макаренкова Ольга', 'Мельников Алексей', 'Никулин Антон', 'Хорошунов Юрий', 'Шишков Александр'];
  
  const [participants, setParticipants] = useState([...allParticipants]);
  const [newParticipant, setNewParticipant] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Состояние цикла справедливости
  const [availableInCycle, setAvailableInCycle] = useState([...allParticipants]);
  const [currentCycle, setCurrentCycle] = useState(1);

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (name) => {
    setParticipants(participants.filter(p => p !== name));
    if (selectedLeader === name) {
      setSelectedLeader('');
    }
    // Обновляем доступных в цикле
    setAvailableInCycle(prev => prev.filter(p => p !== name));
  };

  const restoreAllParticipants = () => {
    setParticipants([...allParticipants]);
    setSelectedLeader('');
    setAvailableInCycle([...allParticipants]);
  };
  
  const toggleParticipantInCycle = (participant) => {
    setAvailableInCycle(prev => {
      if (prev.includes(participant)) {
        // Убираем из цикла
        return prev.filter(p => p !== participant);
      } else {
        // Добавляем в цикл
        return [...prev, participant];
      }
    });
  };

  // Криптографически стойкий рандом
  const cryptoRandom = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  };

  // Fisher-Yates shuffle для максимальной случайности
  const shuffleAndSelect = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(cryptoRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled[0];
  };

  const selectRandomLeader = () => {
    if (participants.length === 0) return;
    
    // Логика цикла: выбираем только из доступных в текущем цикле
    const currentAvailable = availableInCycle.filter(p => participants.includes(p));
    
    // Если в цикле никого не осталось - новый цикл
    if (currentAvailable.length === 0) {
      // Начинаем новый цикл со всеми участниками
      setAvailableInCycle([...participants]);
      setCurrentCycle(prev => prev + 1);
      
      // Выбираем из нового полного списка без анимации (мгновенно)
      const leader = shuffleAndSelect(participants);
      setSelectedLeader(leader);
      
      // Убираем выбранного из нового цикла
      setAvailableInCycle(participants.filter(p => p !== leader));
      
      // Добавляем в историю
      const now = new Date();
      const historyEntry = {
        leader,
        date: now.toLocaleDateString('ru-RU'),
        time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        cycle: currentCycle + 1
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      return;
    }
    
    setIsSpinning(true);
    setSelectedLeader('');
    
    // Простая анимация с несколькими случайными показами
    let counter = 0;
    const spinInterval = setInterval(() => {
      // Показываем случайных участников для эффекта (из доступных)
      const tempIndex = Math.floor(cryptoRandom() * currentAvailable.length);
      setSelectedLeader(currentAvailable[tempIndex]);
      counter++;
      
      if (counter >= 6) {
        clearInterval(spinInterval);
        
        setTimeout(() => {
          // Финальный выбор из доступных в цикле
          const leader = shuffleAndSelect(currentAvailable);
          setSelectedLeader(leader);
          setIsSpinning(false);
          
          // Убираем выбранного из доступных в цикле
          setAvailableInCycle(prev => prev.filter(p => p !== leader));
          
          const now = new Date();
          const historyEntry = {
            leader,
            date: now.toLocaleDateString('ru-RU'),
            time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            cycle: currentCycle
          };
          setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
        }, 300);
      }
    }, 150);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addParticipant();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Заголовок */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Рандомайзер дейли</h1>
          <p className="text-sm text-gray-600">Выберите ведущего для сегодняшнего дейли</p>
        </div>

        {/* Секция участников */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Участники команды ({participants.length})
            </h2>
            <button
              onClick={restoreAllParticipants}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Восстановить
            </button>
          </div>
          
          {/* Компактный инпут */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Имя участника"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={addParticipant}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Сетка участников с кликабельной подсветкой */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {participants.map((participant, index) => {
              const isAvailableInCycle = availableInCycle.includes(participant);
              return (
                <div
                  key={index}
                  onClick={() => toggleParticipantInCycle(participant)}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isAvailableInCycle 
                      ? 'bg-green-100 border-2 border-green-300 hover:bg-green-200' 
                      : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center pointer-events-none">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      isAvailableInCycle ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-800">{participant}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeParticipant(participant);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {participants.length === 0 && (
            <p className="text-gray-500 text-center py-3 text-sm">Добавьте участников команды</p>
          )}
          
          {participants.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700 text-center">
                💡 Кликните на участника чтобы включить/исключить из списка выбора
              </p>
            </div>
          )}
        </div>

        {/* Кнопка выбора */}
        <div className="text-center mb-5">
          <button
            onClick={selectRandomLeader}
            disabled={participants.length === 0 || isSpinning}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-all transform ${
              participants.length === 0 || isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center">
              <Shuffle className={`w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Выбираем...' : 'Выбрать ведущего'}
            </div>
          </button>

          {/* Компактный результат */}
          {selectedLeader && !isSpinning && (
            <div className="mt-5 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-center mb-1">
                <UserCheck className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Ведущий дейли сегодня:</h3>
              </div>
              <p className="text-2xl font-bold text-green-700">{selectedLeader}</p>
            </div>
          )}
        </div>

        {/* Компактная история с циклами */}
        {history.length > 0 && (
          <div className="border-t pt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-3 text-sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              История выборов ({history.length})
            </button>
            
            {showHistory && (
              <div className="space-y-1">
                {history.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md text-xs">
                    <div className="flex items-center">
                      <span className="font-medium">{entry.leader}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        entry.cycle === 1 ? 'bg-blue-100 text-blue-800' :
                        entry.cycle === 2 ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        Ц{entry.cycle}
                      </span>
                    </div>
                    <div className="text-gray-500">{entry.date} в {entry.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FairnessCycleTest;