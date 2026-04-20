import { useEffect, useRef } from 'react';

interface UseSecureExamSessionOptions {
  active: boolean;
  onViolation: (reason: string) => void;
}

const BLOCKED_SHORTCUTS = new Set(['c', 'v', 'u', 's', 'p']);
const DEVTOOLS_CODES = new Set(['KeyI', 'KeyJ', 'KeyC']);

export function useSecureExamSession({ active, onViolation }: UseSecureExamSessionOptions) {
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolationRef.current('Tab switch detected. Stay on the exam screen.');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onViolationRef.current('Fullscreen was exited. Return to fullscreen to continue.');
      }
    };

    const blockEvent = (event: Event) => {
      event.preventDefault();
      onViolationRef.current('Copy, paste, and context actions are blocked during the exam.');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const loweredKey = event.key.toLowerCase();
      const withModifier = event.ctrlKey || event.metaKey;

      if (event.key === 'F12') {
        event.preventDefault();
        onViolationRef.current('Developer tools are blocked during the exam.');
        return;
      }

      if (withModifier && event.shiftKey && DEVTOOLS_CODES.has(event.code)) {
        event.preventDefault();
        onViolationRef.current('Developer tools shortcuts are blocked during the exam.');
        return;
      }

      if (withModifier && BLOCKED_SHORTCUTS.has(loweredKey)) {
        event.preventDefault();
        onViolationRef.current('Keyboard shortcuts are blocked during the exam.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', blockEvent);
    document.addEventListener('copy', blockEvent);
    document.addEventListener('paste', blockEvent);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', blockEvent);
      document.removeEventListener('copy', blockEvent);
      document.removeEventListener('paste', blockEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
}
