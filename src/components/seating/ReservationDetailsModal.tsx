import React from 'react';
import { Table, Assignments, GuestWithAssignment } from '../../types';
import { EditablePartySize } from './EditablePartySize';
import { EditableAssignedSeats } from './EditableAssignedSeats';

interface ReservationDetailsModalProps {
  table: Table | null;
  guests: GuestWithAssignment[];
  assignments: Assignments;
  tables: Table[];
  onClose: () => void;
  onUnassign: (guestId: string) => void;
  onReassign: (guestId: string) => void;
  onSizeChange: (guestId: string, newSize: number) => void;
  onSeatsChange: (guestId: string, tableId: string | number, newSeats: number) => void;
  onUnmerge: (guestId: string) => void;
}

/**
 * Modal showing detailed information about guests assigned to a table
 */
export const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({ 
  table, 
  guests, 
  assignments, 
  tables, 
  onClose, 
  onUnassign, 
  onReassign, 
  onSizeChange, 
  onSeatsChange, 
  onUnmerge 
}) => {
  if (!table) return null;

  const sortedGuests = guests.slice().sort((a, b) => 
    a.guest.name.localeCompare(b.guest.name, undefined, { sensitivity: 'base' })
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Table {table.displayId} Details
        </h2>
        {sortedGuests.length > 0 ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {sortedGuests.map(item => {
              // Calculate other table assignments for this guest
              const parts = assignments[item.guest.id] || [];
              const others = parts.filter(p => p.tableId !== table.internalId);
              const otherTablesText = others.length > 0 
                ? others.map(p => {
                    const t = tables.find(tt => tt.internalId === p.tableId);
                    return `${t ? t.displayId : p.tableId} (${p.seats})`;
                  }).join(', ')
                : null;

              return (
                <div key={item.guest.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900">{item.guest.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <EditableAssignedSeats 
                        guest={item.guest} 
                        tableId={table.internalId} 
                        assignedSeats={item.assignedSeats} 
                        onSeatsChange={onSeatsChange} 
                      />
                      <button 
                        onClick={() => onReassign(item.guest.id)} 
                        className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-green-600"
                      >
                        Reassign
                      </button>
                      <button 
                        onClick={() => onUnassign(item.guest.id)} 
                        className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600"
                      >
                        Unassign
                      </button>
                      {item.guest.mergedFrom && (
                        <button 
                          onClick={() => onUnmerge(item.guest.id)} 
                          className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Unmerge
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                    <span>Total party size:</span>
                    <EditablePartySize guest={item.guest} onSizeChange={onSizeChange} />
                  </div>
                  {otherTablesText && (
                    <p className="text-gray-600 text-xs">
                      Others at table{others.length > 1 ? 's' : ''}: {otherTablesText}
                    </p>
                  )}
                  {item.guest.notes && (
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                      <strong>Notes:</strong> {item.guest.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">This table is currently empty.</p>
        )}
        <button 
          onClick={onClose} 
          className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
