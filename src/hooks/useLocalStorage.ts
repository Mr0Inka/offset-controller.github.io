import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      // Handle boolean values stored as strings
      if (initialValue === true || initialValue === false) {
        return (item === 'true') as T;
      }
      // Handle number values
      if (typeof initialValue === 'number') {
        const parsed = parseInt(item, 10);
        return (isNaN(parsed) ? initialValue : parsed) as T;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      // Store boolean and number as strings for compatibility
      if (typeof value === 'boolean' || typeof value === 'number') {
        window.localStorage.setItem(key, String(value));
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

