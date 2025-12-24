import React from 'react';
import type { Guest } from '../../types';

interface MobileQuickAssignPanelProps {
  /** List of unassigned guests with remaining seats */
  unassignedGuests: Array<{ guest: Guest; remaining: number }>;
  /** ID of the currently selected guest */
  selectedGuestId: string | null;
  /** Callback when a guest is selected */
  onSelectGuest: (guestId: string) => void;
  /** Callback to close the panel */
  onClose: () => void;
}

/**
 * Floating bottom panel for quick guest assignment on mobile devices
 * Displays a horizontal scrollable list of unassigned guests
 */
export const MobileQuickAssignPanel: React.FC<MobileQuickAssignPanelProps> = ({
  unassignedGuests,
  selectedGuestId,
  onSelectGuest,
  onClose,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-gray-200 shadow-2xl">
      <div className="px-4 py-3">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Quick Assign ({unassignedGuests.length} guests)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close quick assign panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Horizontal scrollable guest list */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-2 min-w-min">
            {unassignedGuests.map(({ guest, remaining }) => {
              const isSelected = selectedGuestId === guest.id;
              return (
                <button
                  key={guest.id}
                  onClick={() => onSelectGuest(guest.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 ring-offset-2'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap">{guest.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-indigo-500' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {remaining}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Helper text */}
        {selectedGuestId && (
          <div className="mt-2 text-xs text-gray-600 text-center">
            Tap a table to assign
          </div>
        )}
      </div>
    </div>
  );
};
