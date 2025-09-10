import React, { useState, useEffect, useRef } from 'react';

const ProfileModal = ({ currentUsername, onSave, onClose, darkMode, forceAction }) => {
  const [name, setName] = useState(currentUsername || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    // --- Modal Overlay ---
    <div className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${darkMode ? 'bg-black bg-opacity-75' : 'bg-gray-900 bg-opacity-75'}`}>
      
      {/* --- Modal Content --- */}
      <div className={`rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 scale-100 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-900'}`}>
        
        {/* --- Modal Header --- */}
        <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold">{currentUsername ? 'Edit Your Name' : 'Welcome! Set Your Name'}</h3>
          {!currentUsername && <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This name will be used across the application.</p>}
        </div>
        
        {/* --- Modal Body --- */}
        <div className="p-6 space-y-4">
          <label htmlFor="usernameInput" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Display Name
          </label>
          <input
            id="usernameInput"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Enter your name..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white placeholder-gray-400'}`}
          />
        </div>
        
        {/* --- Modal Footer --- */}
        <div className={`px-5 py-4 flex ${forceAction ? 'justify-end' : 'justify-between'} items-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {!forceAction && (
            <button 
              onClick={onClose} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-900' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'}`}
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSave} 
            disabled={!name.trim()} 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Name
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;