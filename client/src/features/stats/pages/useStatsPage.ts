import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStats,
  getPadletVisits,
  getMostVisitedPadlets,
  type StatsData,
  type DayCount,
  type MostVisitedPadlet,
} from '../services/stats-service';

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const today = new Date();
const twoWeeksAgo = new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000);

export function useStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPadletId, setSelectedPadletId] = useState('');
  const [padletVisits, setPadletVisits] = useState<DayCount[]>([]);
  const [isLoadingPadletVisits, setIsLoadingPadletVisits] = useState(false);

  const [fromDate, setFromDate] = useState(toDateString(twoWeeksAgo));
  const [toDate, setToDate] = useState(toDateString(today));
  const [mostVisited, setMostVisited] = useState<MostVisitedPadlet[]>([]);
  const [isLoadingMostVisited, setIsLoadingMostVisited] = useState(false);

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

  useEffect(() => {
    setIsLoadingMostVisited(true);
    getMostVisitedPadlets(fromDate, toDate)
      .then(setMostVisited)
      .catch(() => setMostVisited([]))
      .finally(() => setIsLoadingMostVisited(false));
  }, [fromDate, toDate]);

  const handleFromDateChange = useCallback((value: string) => {
    if (value > toDate) return;
    setFromDate(value);
  }, [toDate]);

  const handleToDateChange = useCallback((value: string) => {
    if (value < fromDate) return;
    setToDate(value);
  }, [fromDate]);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
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
    fromDate,
    toDate,
    minDate: toDateString(twoWeeksAgo),
    maxDate: toDateString(today),
    mostVisited,
    isLoadingMostVisited,
    handleFromDateChange,
    handleToDateChange,
    handleDateRangeChange,
    handlePadletSelect,
    handleBack,
  };
}
