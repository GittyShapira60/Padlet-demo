import { useCallback, useEffect, useState } from 'react';
import type { Padlet, PadletBoards } from '../interfaces/padlet';
import { copyPadlet, deletePadlet, getPadletBoards, leavePadlet } from '../services/padlet-service';
import type { CopyPadletOptions } from '../services/padlet-service';
import { getSocket } from '../../../shared/services/socket.service';

const EMPTY_BOARDS: PadletBoards = { mine: [], shared: [] };

export function usePadlets() {
  const [boards, setBoards] = useState<PadletBoards>(EMPTY_BOARDS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPadlets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getPadletBoards();
      setBoards(data);
    } catch {
      setError('לא הצלחנו לטעון את הלוחות');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPadlets();
  }, [loadPadlets]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('padlet:shared', () => void loadPadlets());
    return () => {
      socket.off('padlet:shared');
    };
  }, [loadPadlets]);

  const addPadlet = useCallback((padlet: Padlet) => {
    setBoards((current) => ({
      ...current,
      mine: [padlet, ...current.mine],
    }));
  }, []);

  const removePadlet = useCallback(async (padletId: string) => {
    let snapshot: PadletBoards = EMPTY_BOARDS;
    setBoards((current) => {
      snapshot = current;
      return {
        mine: current.mine.filter((p) => p.id !== padletId),
        shared: current.shared.filter((p) => p.id !== padletId),
      };
    });

    try {
      await deletePadlet(padletId);
    } catch {
      setBoards(snapshot);
      window.alert('לא הצלחנו למחוק את הלוח');
    }
  }, []);

  const leaveSharedPadlet = useCallback(async (padletId: string) => {
    let snapshot: PadletBoards = EMPTY_BOARDS;
    setBoards((current) => {
      snapshot = current;
      return {
        ...current,
        shared: current.shared.filter((p) => p.id !== padletId),
      };
    });

    try {
      await leavePadlet(padletId);
    } catch {
      setBoards(snapshot);
      window.alert('לא הצלחנו לעזוב את הלוח');
    }
  }, []);

  const duplicatePadlet = useCallback(async (padletId: string, options: CopyPadletOptions) => {
    const newPadlet = await copyPadlet(padletId, options);
    setBoards((current) => ({
      ...current,
      mine: [newPadlet, ...current.mine],
    }));
  }, []);

  const hasBoards = boards.mine.length > 0 || boards.shared.length > 0;

  return { boards, hasBoards, isLoading, error, addPadlet, removePadlet, duplicatePadlet, leaveSharedPadlet, reloadPadlets: loadPadlets };
}