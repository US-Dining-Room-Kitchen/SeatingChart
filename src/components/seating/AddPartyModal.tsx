import React, { useState } from 'react';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParty: (name: string, size: number) => void;
}

/**
 * Modal for adding a new guest party manually
 */
export const AddPartyModal: React.FC<AddPartyModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddParty 
}) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSize = parseInt(size, 10);
    if (name && parsedSize > 0) {
      onAddParty(name, parsedSize);
      setName('');
      setSize('');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Party</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="partyName" className="block text-sm font-medium text-gray-700">
              Party Name
            </label>
            <input 
              type="text" 
              id="partyName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              autoFocus 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
          <div>
            <label htmlFor="partySize" className="block text-sm font-medium text-gray-700">
              Party Size
            </label>
            <input 
              type="number" 
              id="partySize" 
              value={size} 
              onChange={(e) => setSize(e.target.value)} 
              required 
              min="1" 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Party
          </button>
        </div>
      </form>
    </div>
  );
};
