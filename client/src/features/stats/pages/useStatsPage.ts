import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStats,
  getPadletVisits,
  type StatsData,
  type DayCount,
} from '../services/stats-service';

export function useStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPadletId, setSelectedPadletId] = useState('');
  const [padletVisits, setPadletVisits] = useState<DayCount[]>([]);
  const [isLoadingPadletVisits, setIsLoadingPadletVisits] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStats();
        setStats(data);
      } catch {
        setError('לא הצלחנו לטעון את הסטטיסטיקות');
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const handlePadletSelect = useCallback(async (padletId: string) => {
    setSelectedPadletId(padletId);
    if (!padletId) {
      setPadletVisits([]);
      return;
    }
    setIsLoadingPadletVisits(true);
    try {
      const visits = await getPadletVisits(padletId);
      setPadletVisits(visits);
    } catch {
      setPadletVisits([]);
    } finally {
      setIsLoadingPadletVisits(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    stats,
    isLoading,
    error,
    selectedPadletId,
    padletVisits,
    isLoadingPadletVisits,
    handlePadletSelect,
    handleBack,
  };
}
