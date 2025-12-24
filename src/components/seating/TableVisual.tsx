import React from 'react';
import type { Table, GuestWithAssignment } from '../../types';

interface TableVisualProps {
  table: Table;
  assignedGuests: GuestWithAssignment[];
  onClick: () => void;
  isSelectedGuest: boolean;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Visual representation of a table with chairs and occupancy
 */
export const TableVisual: React.FC<TableVisualProps> = ({ 
  table, 
  assignedGuests, 
  onClick, 
  isSelectedGuest, 
  orientation = 'vertical' 
}) => {
  const totalAssigned = assignedGuests.reduce((sum, g) => sum + g.assignedSeats, 0);
  const remainingSeats = table.capacity - totalAssigned;

  let tableColor = 'bg-green-400';
  if (remainingSeats <= 2) {
    tableColor = 'bg-red-400';
  } else if (remainingSeats <= 6) {
    tableColor = 'bg-yellow-400';
  }

  const renderChairs = (count: number, filledCount: number, layoutClass: string) => (
    <div className={`flex ${layoutClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded-sm ${i < filledCount ? 'bg-indigo-500' : 'bg-gray-300'}`}
        ></div>
      ))}
    </div>
  );

  const hoverClass = isSelectedGuest ? 'hover:outline-blue-500 hover:bg-blue-100' : '';

  return (
    <div 
      onClick={onClick} 
      className={`p-2 rounded-lg outline outline-2 outline-dashed outline-gray-300 bg-gray-50 transition-all duration-200 cursor-pointer w-28 h-28 flex flex-col items-center justify-center ${hoverClass}`}
    >
      {orientation === 'horizontal' ? (
        <div className="flex flex-col items-center justify-center">
          {renderChairs(4, totalAssigned, 'gap-2 mb-1')}
          <div className="flex items-center gap-1">
            {renderChairs(1, Math.max(0, totalAssigned - 4), '')}
            <div className={`relative ${tableColor} rounded h-10 w-16 flex items-center justify-center text-white font-bold text-sm`}>
              {table.displayId}
            </div>
            {renderChairs(1, Math.max(0, totalAssigned - 5), '')}
          </div>
          {renderChairs(4, Math.max(0, totalAssigned - 6), 'gap-2 mt-1')}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {renderChairs(4, totalAssigned, 'flex-col gap-2 mr-1')}
          <div className="flex flex-col items-center gap-1">
            {renderChairs(1, Math.max(0, totalAssigned - 4), '')}
            <div className={`relative ${tableColor} rounded w-10 h-16 flex items-center justify-center text-white font-bold text-sm`}>
              {table.displayId}
            </div>
            {renderChairs(1, Math.max(0, totalAssigned - 5), '')}
          </div>
          {renderChairs(4, Math.max(0, totalAssigned - 6), 'flex-col gap-2 ml-1')}
        </div>
      )}
      <div className="text-center text-xs font-semibold mt-1 text-gray-600">
        {totalAssigned}/{table.capacity}
      </div>
    </div>
  );
};
