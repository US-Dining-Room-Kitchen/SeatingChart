import { useState } from 'react';

/**
 * Custom hook for managing state synchronized with localStorage
 * 
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [storedValue, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Helper function to get a value from localStorage
 * 
 * @param key - The localStorage key to retrieve
 * @returns The stored value or null if not found
 */
export function getFromStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Helper function to set a value in localStorage
 * 
 * @param key - The localStorage key to set
 * @param value - The value to store
 */
export function setInStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}
