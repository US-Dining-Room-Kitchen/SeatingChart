import React from 'react';
import { Guest } from '../../types';
import { EditablePartySize } from './EditablePartySize';
import { EditableNote } from './EditableNote';

interface GuestCardProps {
  guest: Guest;
  remaining: number;
  onSizeChange: (guestId: string, newSize: number) => void;
  onNotesChange: (guestId: string, notes: string) => void;
  isSelected: boolean;
  onClick: () => void;
  isMerging: boolean;
  mergeSelected: boolean;
  onMergeSelect: (guestId: string, selected: boolean) => void;
  onUnmerge: (guestId: string) => void;
}

/**
 * Card component displaying guest information with editing capabilities
 */
export const GuestCard: React.FC<GuestCardProps> = ({ 
  guest, 
  remaining, 
  onSizeChange, 
  onNotesChange, 
  isSelected, 
  onClick, 
  isMerging, 
  mergeSelected, 
  onMergeSelect, 
  onUnmerge 
}) => {
  const handleClick = () => {
    if (isMerging) {
      onMergeSelect(guest.id, !mergeSelected);
    } else {
      onClick();
    }
  };

  const ringClass = isMerging
    ? (mergeSelected ? 'ring-2 ring-green-500' : 'ring-1 ring-transparent')
    : (isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent');

  return (
    <div 
      onClick={handleClick} 
      className={`w-full p-3 mb-2 rounded-lg shadow-md cursor-pointer flex flex-col items-start justify-center text-sm transition-all duration-200 ease-in-out bg-white hover:bg-gray-50 ${ringClass}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          {isMerging && (
            <input 
              type="checkbox" 
              checked={mergeSelected} 
              onChange={(e) => { onMergeSelect(guest.id, e.target.checked); }} 
              onClick={(e) => e.stopPropagation()} 
            />
          )}
          <span className="font-semibold text-gray-800">{guest.name}</span>
        </div>
        <EditablePartySize guest={guest} onSizeChange={onSizeChange} />
      </div>
      {remaining < guest.size && (
        <p className="text-xs text-gray-600">Remaining: {remaining} of {guest.size}</p>
      )}
      <EditableNote guest={guest} onNotesChange={onNotesChange} />
      {guest.mergedFrom && (
        <button 
          onClick={(e) => { e.stopPropagation(); onUnmerge(guest.id); }} 
          className="text-xs text-red-600 mt-2"
        >
          Unmerge
        </button>
      )}
    </div>
  );
};
