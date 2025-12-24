import React from 'react';
import { Guest } from '../../types';
import { UserIcon } from '../ui/icons/UserIcon';

interface EditableAssignedSeatsProps {
  guest: Guest;
  tableId: string | number;
  assignedSeats: number;
  onSeatsChange: (guestId: string, tableId: string | number, newSeats: number) => void;
}

/**
 * Component for editing the number of seats assigned to a guest at a specific table
 */
export const EditableAssignedSeats: React.FC<EditableAssignedSeatsProps> = ({ 
  guest, 
  tableId, 
  assignedSeats, 
  onSeatsChange 
}) => {
  const adjust = (delta: number) => {
    let newSeats = assignedSeats + delta;
    if (newSeats < 0) newSeats = 0;
    onSeatsChange(guest.id, tableId, newSeats);
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
      <span className="w-8 text-center font-bold text-lg">{assignedSeats}</span>
      <button 
        onClick={(e) => { e.stopPropagation(); adjust(1); }} 
        className="w-6 h-6 flex items-center justify-center bg-indigo-200 text-indigo-800 rounded-full"
      >
        +
      </button>
    </div>
  );
};
