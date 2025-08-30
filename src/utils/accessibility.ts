/**
 * Accessibility utilities and helpers
 * Requirements: 8.2, 8.3
 */

// Generate unique IDs for form elements and ARIA relationships
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

// Announce messages to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  
  static pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }
  
  static popFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }
  
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}

// Keyboard navigation helpers
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab'
} as const;

export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void,
  keys: string[] = [KeyboardKeys.ENTER, KeyboardKeys.SPACE]
): void {
  if (keys.includes(event.key)) {
    event.preventDefault();
    callback();
  }
}

// ARIA helpers
export function getAriaLabel(
  label: string,
  description?: string,
  status?: string
): string {
  let ariaLabel = label;
  if (description) {
    ariaLabel += `, ${description}`;
  }
  if (status) {
    ariaLabel += `, ${status}`;
  }
  return ariaLabel;
}

// High contrast mode detection
export function isHighContrastMode(): boolean {
  // Check for Windows high contrast mode
  if (window.matchMedia) {
    return window.matchMedia('(prefers-contrast: high)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches;
  }
  return false;
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

// Screen reader only text utility
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0'
};

// Enhanced status announcements for complex operations
export function announceStatus(
  operation: string,
  status: 'started' | 'progress' | 'completed' | 'failed',
  details?: { current?: number; total?: number; item?: string; error?: string }
): void {
  let message = '';
  
  switch (status) {
    case 'started':
      message = `${operation} started`;
      break;
    case 'progress':
      if (details?.current && details?.total) {
        message = `${operation} progress: ${details.current} of ${details.total}`;
        if (details.item) {
          message += `, currently processing ${details.item}`;
        }
      } else {
        message = `${operation} in progress`;
      }
      break;
    case 'completed':
      message = `${operation} completed successfully`;
      if (details?.total) {
        message += ` for ${details.total} item${details.total !== 1 ? 's' : ''}`;
      }
      break;
    case 'failed':
      message = `${operation} failed`;
      if (details?.error) {
        message += `: ${details.error}`;
      }
      break;
  }
  
  announceToScreenReader(message, status === 'failed' ? 'assertive' : 'polite');
}

// Keyboard navigation helper for grid-like components
export function getGridNavigationIndex(
  currentIndex: number,
  direction: 'up' | 'down' | 'left' | 'right' | 'home' | 'end',
  totalItems: number,
  columnsPerRow: number
): number {
  switch (direction) {
    case 'left':
      return Math.max(0, currentIndex - 1);
    case 'right':
      return Math.min(totalItems - 1, currentIndex + 1);
    case 'up':
      return Math.max(0, currentIndex - columnsPerRow);
    case 'down':
      return Math.min(totalItems - 1, currentIndex + columnsPerRow);
    case 'home':
      return 0;
    case 'end':
      return totalItems - 1;
    default:
      return currentIndex;
  }
}

// Validate and enhance ARIA attributes
export function validateAriaAttributes(element: HTMLElement): string[] {
  const issues: string[] = [];
  
  // Check for required ARIA attributes
  if (element.getAttribute('role') === 'button' && !element.hasAttribute('aria-label') && !element.textContent?.trim()) {
    issues.push('Button role requires aria-label or text content');
  }
  
  if (element.hasAttribute('aria-describedby')) {
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy && !document.getElementById(describedBy)) {
      issues.push(`aria-describedby references non-existent element: ${describedBy}`);
    }
  }
  
  if (element.hasAttribute('aria-labelledby')) {
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy && !document.getElementById(labelledBy)) {
      issues.push(`aria-labelledby references non-existent element: ${labelledBy}`);
    }
  }
  
  return issues;
}