import React, { useState, useEffect, useRef } from 'react';
import { FiEdit3, FiLogOut } from 'react-icons/fi';

const UserProfile = ({ username, onEdit, onLogout, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- User Avatar and Name Button (Corrected Focus Ring) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${darkMode ? 'focus:ring-offset-gray-800' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
          {getInitial(username)}
        </div>
        <span className={`hidden md:inline font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {username}
        </span>
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div 
          className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-lg p-2 z-50 transition-all duration-150 ease-out
            ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'}`}
        >
          {/* --- User Info Header in Dropdown --- */}
          <div className={`px-3 py-2 border-b mb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
             <p className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{username}</p>
             <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Standard User</p>
          </div>
          
          {/* --- Menu Actions --- */}
          <div className="space-y-1">
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiEdit3 className="mr-3 h-4 w-4" /> Edit Name
            </button>
            <button
              onClick={onLogout}
              className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${darkMode ? 'text-red-400 hover:bg-red-500 hover:text-white' : 'text-red-600 hover:bg-red-500 hover:text-white'}`}
            >
              <FiLogOut className="mr-3 h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;