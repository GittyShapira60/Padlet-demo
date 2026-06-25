import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PadletPermission } from '../enums/padlet-permission';
import {
  buildPadletCapabilities,
  type PadletCapabilities,
} from '../utils/padlet-capabilities';

const PadletCapabilitiesContext = createContext<PadletCapabilities | null>(null);

interface PadletCapabilitiesProviderProps {
  permission: PadletPermission;
  currentUsername?: string;
  children: ReactNode;
}

export function PadletCapabilitiesProvider({
  permission,
  currentUsername,
  children,
}: PadletCapabilitiesProviderProps) {
  const capabilities = useMemo(
    () => buildPadletCapabilities(permission, currentUsername),
    [permission, currentUsername],
  );

  return (
    <PadletCapabilitiesContext.Provider value={capabilities}>
      {children}
    </PadletCapabilitiesContext.Provider>
  );
}

export function usePadletCapabilities(): PadletCapabilities {
  const context = useContext(PadletCapabilitiesContext);

  if (!context) {
    throw new Error('usePadletCapabilities must be used within PadletCapabilitiesProvider');
  }

  return context;
}
