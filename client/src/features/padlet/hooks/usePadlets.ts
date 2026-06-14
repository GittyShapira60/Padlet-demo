import { useCallback, useEffect, useState } from 'react';
import type { Padlet, PadletBoards } from '../interfaces/padlet';
import { getPadletBoards } from '../services/padlet-service';

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

  const addPadlet = useCallback((padlet: Padlet) => {
    setBoards((current) => ({
      ...current,
      mine: [padlet, ...current.mine],
    }));
  }, []);

  const hasBoards = boards.mine.length > 0 || boards.shared.length > 0;

  return { boards, hasBoards, isLoading, error, addPadlet, reloadPadlets: loadPadlets };
}
