/**
 * Represents a guest party in the seating chart system
 */
export interface Guest {
  /** Unique identifier for the guest party */
  id: string;
  /** Name of the party or group */
  name: string;
  /** Total number of people in the party */
  size: number;
  /** Optional notes or special requirements */
  notes?: string;
  /** Array of guest IDs that were merged into this party */
  mergedFrom?: string[];
}

/**
 * Represents a table in the seating chart layout
 */
export interface Table {
  /** Internal unique identifier for the table */
  internalId: string | number;
  /** Display label shown on the table (can be different from internalId) */
  displayId: string;
  /** Visual orientation of the table */
  orientation: 'horizontal' | 'vertical';
  /** Row position in the grid layout */
  gridRow: number;
  /** Column position in the grid layout */
  gridCol: number;
  /** Maximum number of seats at the table */
  capacity: number;
}

/**
 * Represents a seat assignment for a guest at a specific table
 */
export interface Assignment {
  /** The table ID where seats are assigned */
  tableId: string | number;
  /** Number of seats assigned at this table */
  seats: number;
}

/**
 * Map of guest IDs to their table assignments
 */
export interface Assignments {
  [guestId: string]: Assignment[];
}

/**
 * Represents a layout option available for selection
 */
export interface LayoutOption {
  /** Display name of the layout */
  name: string;
  /** Filename of the layout JSON file */
  file: string;
}

/**
 * Guest with assignment information for display purposes
 */
export interface GuestWithAssignment {
  guest: Guest;
  assignedSeats: number;
}

/**
 * Notification types for the notification component
 */
export type NotificationType = 'info' | 'success' | 'error' | 'warning';
