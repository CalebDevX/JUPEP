import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useActivation() {
  const { isActivated } = useAuth();
  const [gateVisible, setGateVisible] = useState(false);

  const showGate = useCallback(() => setGateVisible(true), []);
  const hideGate = useCallback(() => setGateVisible(false), []);

  /**
   * Guards a feature: if activated, run the action; otherwise show the gate.
   */
  const guard = useCallback((action: () => void) => {
    if (isActivated) {
      action();
    } else {
      setGateVisible(true);
    }
  }, [isActivated]);

  return { isActivated, gateVisible, showGate, hideGate, guard };
}
