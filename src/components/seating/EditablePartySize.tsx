import React from 'react';
import { Guest } from '../../types';
import { UserIcon } from '../ui/icons/UserIcon';

interface EditablePartySizeProps {
  guest: Guest;
  onSizeChange: (guestId: string, newSize: number) => void;
}

/**
 * Component for editing a guest party's size with increment/decrement buttons
 */
export const EditablePartySize: React.FC<EditablePartySizeProps> = ({ 
  guest, 
  onSizeChange 
}) => {
  const adjust = (delta: number) => {
    let newSize = guest.size + delta;
    if (newSize < 0) newSize = 0;
    if (newSize !== guest.size) {
      onSizeChange(guest.id, newSize);
    }
  };

  return (
    <div className="flex items-center space-x-1 text-indigo-600 select-none">
      <UserIcon className="w-5 h-5" />
      <button 
        onClick={(e) => { e.stopPropagation(); adjust(-1); }} 
        className="w-6 h-6 flex items-center justify-center bg-indigo-200 text-indigo-800 rounded-full"
      >
        -
      </button>
      <span className="w-8 text-center font-bold text-lg">{guest.size}</span>
      <button 
        onClick={(e) => { e.stopPropagation(); adjust(1); }} 
        className="w-6 h-6 flex items-center justify-center bg-indigo-200 text-indigo-800 rounded-full"
      >
        +
      </button>
    </div>
  );
};
