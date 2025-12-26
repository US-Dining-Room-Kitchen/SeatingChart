import React from 'react';
import type { Guest } from '../../types';

interface SelectedGuestBannerProps {
  /** The currently selected guest */
  guest: Guest;
  /** Number of seats remaining to assign */
  remainingSeats: number;
  /** Callback to navigate to previous unassigned guest */
  onPrevious: () => void;
  /** Callback to navigate to next unassigned guest */
  onNext: () => void;
  /** Callback to deselect the guest */
  onClose: () => void;
  /** Whether there is a previous guest available */
  hasPrevious: boolean;
  /** Whether there is a next guest available */
  hasNext: boolean;
}

/**
 * Banner component displayed at the top of the map view on mobile
 * Shows the currently selected guest with navigation controls
 */
export const SelectedGuestBanner: React.FC<SelectedGuestBannerProps> = ({
  guest,
  remainingSeats,
  onPrevious,
  onNext,
  onClose,
  hasPrevious,
  hasNext,
}) => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-indigo-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Previous button */}
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="p-2 rounded-full hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous guest"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Guest info */}
        <div className="flex-1 text-center">
          <div className="font-semibold text-lg">{guest.name}</div>
          <div className="text-sm opacity-90">
            {remainingSeats} {remainingSeats === 1 ? 'seat' : 'seats'} remaining
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="p-2 rounded-full hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next guest"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="ml-2 p-2 rounded-full hover:bg-indigo-500 transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
    </div>
  );
};
