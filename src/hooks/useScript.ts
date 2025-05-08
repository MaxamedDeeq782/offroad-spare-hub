
import { useState, useEffect } from 'react';

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useScript(src: string): { status: ScriptStatus; error: Error | null } {
  const [status, setStatus] = useState<ScriptStatus>(src ? 'loading' : 'idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }

    // Check if the script already exists in the DOM
    let script: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`);

    if (!script) {
      // Create script
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-loading-script', 'true');
      document.body.appendChild(script);
    } else if (script.getAttribute('data-loaded')) {
      // Script already loaded, set status accordingly
      setStatus('ready');
      return;
    }

    // Event handler for script load
    const handleLoad = () => {
      setStatus('ready');
      script?.setAttribute('data-loaded', 'true');
    };

    // Event handler for script error
    const handleError = (e: Error) => {
      setError(e);
      setStatus('error');
      script?.remove(); // Remove failed script
    };

    // Add event listeners
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', (event) => handleError(new Error(`Failed to load script: ${src}`)));

    // Cleanup function
    return () => {
      if (script) {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', (event) => handleError(new Error(`Failed to load script: ${src}`)));
      }
    };
  }, [src]);

  return { status, error };
}
