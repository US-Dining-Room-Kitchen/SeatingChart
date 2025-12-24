import { useEffect, type RefObject } from 'react';

interface UsePinchZoomOptions {
  minScale?: number;
  maxScale?: number;
}

/**
 * Custom hook for handling pinch-to-zoom gestures on touch devices
 * 
 * @param containerRef - Reference to the DOM element that should handle pinch gestures
 * @param scaleRef - Reference to store the current scale value
 * @param setScale - State setter function to update the scale
 * @param setIsPinching - State setter function to update the pinching state
 * @param options - Optional configuration for min/max scale limits
 */
export function usePinchZoom(
  containerRef: RefObject<HTMLElement | null>,
  scaleRef: RefObject<number>,
  setScale: (scale: number) => void,
  setIsPinching: (isPinching: boolean) => void,
  options: UsePinchZoomOptions = {}
): void {
  const { minScale = 0.2, maxScale = 2 } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startDistance = 0;
    let startScale = 1;

    /**
     * Calculate the distance between two touch points
     */
    const getDistance = (touches: TouchList): number => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    /**
     * Handle the start of a pinch gesture
     */
    const handleTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        startDistance = getDistance(e.touches);
        startScale = scaleRef.current || 1;
        setIsPinching(true);
      }
    };

    /**
     * Handle the pinch gesture movement
     */
    const handleTouchMove = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const newDistance = getDistance(e.touches);
        const newScale = Math.min(
          Math.max(startScale * (newDistance / startDistance), minScale),
          maxScale
        );
        if (scaleRef.current !== undefined) {
          scaleRef.current = newScale;
        }
        setScale(newScale);
      }
    };

    /**
     * Handle the end of a pinch gesture
     */
    const handleTouchEnd = (): void => {
      setIsPinching(false);
    };

    // Add event listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    // Cleanup event listeners on unmount
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [containerRef, scaleRef, setScale, setIsPinching, minScale, maxScale]);
}
