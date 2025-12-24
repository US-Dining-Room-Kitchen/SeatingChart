import { useEffect, type RefObject } from 'react';

interface UseSwipeNavigationOptions {
  /** Minimum distance in pixels to trigger a swipe */
  minSwipeDistance?: number;
  /** Callback when swiping left (next) */
  onSwipeLeft?: () => void;
  /** Callback when swiping right (previous) */
  onSwipeRight?: () => void;
  /** Whether swipe navigation is enabled */
  enabled?: boolean;
}

/**
 * Custom hook for handling horizontal swipe gestures to navigate between items
 * 
 * @param containerRef - Reference to the DOM element that should handle swipe gestures
 * @param options - Configuration for swipe behavior and callbacks
 */
export function useSwipeNavigation(
  containerRef: RefObject<HTMLElement | null>,
  options: UseSwipeNavigationOptions = {}
): void {
  const {
    minSwipeDistance = 50,
    onSwipeLeft,
    onSwipeRight,
    enabled = true
  } = options;

  useEffect(() => {
    if (!enabled) return;
    
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    /**
     * Handle the start of a touch gesture
     */
    const handleTouchStart = (e: TouchEvent): void => {
      // Only handle single-finger swipes
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    };

    /**
     * Handle the end of a touch gesture
     */
    const handleTouchEnd = (e: TouchEvent): void => {
      if (e.changedTouches.length !== 1) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // Only trigger if primarily horizontal swipe (not vertical scroll)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      
      // Ignore if too slow (> 500ms) or too fast (< 50ms)
      if (deltaTime < 50 || deltaTime > 500) return;
      
      if (isHorizontalSwipe && Math.abs(deltaX) >= minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right (previous)
          onSwipeRight?.();
        } else {
          // Swipe left (next)
          onSwipeLeft?.();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, minSwipeDistance, onSwipeLeft, onSwipeRight, enabled]);
}
