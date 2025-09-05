import React, { useState } from 'react';
import { Users, Shuffle, Plus, X, Clock, UserCheck } from 'lucide-react';

const App = () => {
  const [participants, setParticipants] = useState(['Алексей', 'Мария', 'Дмитрий', 'Елена']);
  const [newParticipant, setNewParticipant] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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
  };

  const selectRandomLeader = () => {
    if (participants.length === 0) return;
    
    setIsSpinning(true);
    setSelectedLeader('');
    
    let counter = 0;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setSelectedLeader(participants[randomIndex]);
      counter++;
      
      if (counter >= 10) {
        clearInterval(spinInterval);
        
        setTimeout(() => {
          const finalIndex = Math.floor(Math.random() * participants.length);
          const leader = participants[finalIndex];
          setSelectedLeader(leader);
          setIsSpinning(false);
          
          const now = new Date();
          const historyEntry = {
            leader,
            date: now.toLocaleDateString('ru-RU'),
            time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          };
          setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
        }, 500);
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addParticipant();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Рандомайзер дейли</h1>
          <p className="text-gray-600">Выберите ведущего для сегодняшнего дейли</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Участники команды
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Имя участника"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addParticipant}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
              >
                <span className="text-gray-800">{participant}</span>
                <button
                  onClick={() => removeParticipant(participant)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {participants.length === 0 && (
            <p className="text-gray-500 text-center py-4">Добавьте участников команды</p>
          )}
        </div>

        <div className="text-center mb-8">
          <button
            onClick={selectRandomLeader}
            disabled={participants.length === 0 || isSpinning}
            className={`px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all transform ${
              participants.length === 0 || isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center">
              <Shuffle className={`w-6 h-6 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Выбираем...' : 'Выбрать ведущего'}
            </div>
          </button>

          {selectedLeader && !isSpinning && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-200 animate-pulse">
              <div className="flex items-center justify-center mb-2">
                <UserCheck className="w-8 h-8 text-green-600 mr-2" />
                <h3 className="text-2xl font-bold text-gray-800">Ведущий дейли сегодня:</h3>
              </div>
              <p className="text-4xl font-bold text-green-700">{selectedLeader}</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="border-t pt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <Clock className="w-5 h-5 mr-2" />
              История выборов ({history.length})
            </button>
            
            {showHistory && (
              <div className="space-y-2">
                {history.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg text-sm">
                    <span className="font-medium">{entry.leader}</span>
                    <span className="text-gray-500">{entry.date} в {entry.time}</span>
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

export default App;
