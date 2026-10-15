import { useState, useEffect, useCallback, useRef } from 'react';
import { ProcessedBusService } from '../types/lta';
import {
  fetchBusArrivalsForStop,
  getApiConfiguration,
  toggleBookmarkKey,
} from '../services/ltaService';

export function useBusArrivals(busStopCode: string | null) {
  const [services, setServices] = useState<ProcessedBusService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(15);

  const refreshIntervalSec = getApiConfiguration().autoRefreshIntervalSec || 15;
  const isMountedRef = useRef(true);

  // Fetch logic
  const loadData = useCallback(
    async (showSilentLoading = false) => {
      if (!busStopCode) return;

      if (!showSilentLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const result = await fetchBusArrivalsForStop(busStopCode);
        if (isMountedRef.current) {
          setServices(result.data);
          setIsSimulated(result.isSimulated);
          setLastUpdated(new Date());
          setRefreshCountdown(refreshIntervalSec);
          if (result.error && !result.isSimulated) {
            setError(result.error);
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error('Failed to fetch bus arrivals', err);
          setError('Failed to load bus arrivals.');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [busStopCode, refreshIntervalSec]
  );

  // Initial fetch on stop change
  useEffect(() => {
    isMountedRef.current = true;
    loadData(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  // Periodic auto-fetch and countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadData(true);
          return refreshIntervalSec;
        }
        return prev - 1;
      });

      // Recalculate remaining seconds in existing services every second for smooth ticking
      setServices((prev) =>
        prev.map((svc) => {
          const updateBus = (bus: typeof svc.nextBus) => {
            if (!bus) return null;
            const diffSec = Math.round(
              (new Date(bus.estimatedArrival).getTime() - Date.now()) / 1000
            );
            const mins = Math.max(0, Math.floor(diffSec / 60));
            let label = 'Arr';
            if (diffSec > 60) label = `${mins} min`;
            else if (diffSec > 10) label = '1 min';
            else if (diffSec >= -45) label = 'Arr';
            else return null;

            return {
              ...bus,
              minutesRemaining: mins,
              secondsRemaining: Math.max(0, diffSec),
              formattedCountdown: label,
            };
          };

          return {
            ...svc,
            nextBus: updateBus(svc.nextBus),
            nextBus2: updateBus(svc.nextBus2),
            nextBus3: updateBus(svc.nextBus3),
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData, refreshIntervalSec]);

  // Bookmark toggle
  const toggleBookmark = useCallback((serviceNo: string) => {
    if (!busStopCode) return;
    const key = `${busStopCode}_${serviceNo}`;
    const isNowBookmarked = toggleBookmarkKey(key);

    setServices((prev) =>
      prev.map((s) => (s.serviceNo === serviceNo ? { ...s, isBookmarked: isNowBookmarked } : s))
    );
  }, [busStopCode]);

  return {
    services,
    isLoading,
    isRefreshing,
    isSimulated,
    lastUpdated,
    error,
    refreshCountdown,
    manualRefresh: () => loadData(true),
    toggleBookmark,
  };
}
