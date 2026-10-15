import {
  ApiConfiguration,
  BusLoad,
  BusOperator,
  BusType,
  LtaBusArrivalResponse,
  ProcessedBusInfo,
  ProcessedBusService,
  ServiceArrivalRaw,
} from '../types/lta';
import { SINGAPORE_BUS_STOPS, BUS_SERVICE_DESTINATIONS } from '../data/singaporeBusStops';

const CONFIG_STORAGE_KEY = 'sg_bus_arrival_api_config';
const BOOKMARKS_STORAGE_KEY = 'sg_bus_arrival_bookmarks';

// Default configuration
const DEFAULT_CONFIG: ApiConfiguration = {
  endpointUrl: '/api/busarriavl',
  useBackend: false, // Default to simulated LTA data until user attaches backend
  autoRefreshIntervalSec: 15,
};

/**
 * Retrieves the current API configuration from localStorage
 */
export function getApiConfiguration(): ApiConfiguration {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to read API config', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves updated API configuration to localStorage
 */
export function saveApiConfiguration(config: Partial<ApiConfiguration>): ApiConfiguration {
  const current = getApiConfiguration();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Bookmarks management
 */
export function getBookmarkedKeys(): string[] {
  try {
    const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to read bookmarks', e);
  }
  return [];
}

export function toggleBookmarkKey(key: string): boolean {
  const current = getBookmarkedKeys();
  const exists = current.includes(key);
  const updated = exists ? current.filter((k) => k !== key) : [...current, key];
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  return !exists;
}

/**
 * Formats a raw LTA NextBus object into user-friendly timing and load info
 */
export function processRawBusArrival(
  arrivalTimestampStr: string,
  load: BusLoad,
  feature: string,
  type: BusType,
  destinationCode: string,
  destinationName?: string
): ProcessedBusInfo | null {
  if (!arrivalTimestampStr) return null;

  const arrivalTime = new Date(arrivalTimestampStr).getTime();
  const now = Date.now();
  const diffSeconds = Math.round((arrivalTime - now) / 1000);
  const minutesRemaining = Math.max(0, Math.floor(diffSeconds / 60));

  let formattedCountdown = 'Arr';
  if (diffSeconds > 60) {
    formattedCountdown = `${minutesRemaining} min`;
  } else if (diffSeconds > 10) {
    formattedCountdown = '1 min';
  } else if (diffSeconds >= -60) {
    formattedCountdown = 'Arr';
  } else {
    // Bus passed
    return null;
  }

  let loadLabel = 'Seats Available';
  if (load === 'SDA') loadLabel = 'Standing Available';
  if (load === 'LSD') loadLabel = 'Limited Standing';

  let typeLabel = 'Single Deck';
  if (type === 'DD') typeLabel = 'Double Deck';
  if (type === 'BD') typeLabel = 'Bendy Bus';

  return {
    estimatedArrival: arrivalTimestampStr,
    minutesRemaining,
    secondsRemaining: Math.max(0, diffSeconds),
    formattedCountdown,
    load,
    loadLabel,
    feature: feature === 'WAB' ? 'WAB' : '',
    isWheelchairAccessible: feature === 'WAB',
    type,
    typeLabel,
    destinationCode,
    destinationName,
  };
}

/**
 * Operator display name helper
 */
export function getOperatorName(op: BusOperator): string {
  switch (op) {
    case 'SBST':
      return 'SBS Transit';
    case 'SMRT':
      return 'SMRT Buses';
    case 'TTS':
      return 'Tower Transit';
    case 'GAS':
      return 'Go-Ahead Singapore';
    default:
      return 'Public Bus';
  }
}

/**
 * Generates deterministic realistic LTA-compliant real-time mock data
 * based on current time of day so buses advance realistically every second!
 */
export function generateSimulatedLtaArrival(busStopCode: string): LtaBusArrivalResponse {
  const stop = SINGAPORE_BUS_STOPS.find((s) => s.busStopCode === busStopCode) || {
    busStopCode,
    roadName: 'Singapore Transit Stn',
    description: `Bus Stop ${busStopCode}`,
    services: ['7', '14', '65', '106', '190'],
    latitude: 1.304,
    longitude: 103.834,
  };

  const now = Date.now();

  const services: ServiceArrivalRaw[] = stop.services.map((svcNo, index) => {
    const meta = BUS_SERVICE_DESTINATIONS[svcNo] || {
      term1: 'Interchange',
      op: 'SBST' as BusOperator,
    };

    // Stagger arrival times using service number hash + current time
    const seed = svcNo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 17;
    
    // Cycle simulation every 25 minutes
    const cycleOffsetSec = (Math.floor(now / 1000) + seed * 37) % (22 * 60);

    // 1st bus: 0 to 6 minutes away
    const bus1WaitSec = (seed % 300) - (cycleOffsetSec % 300);
    const bus1ActualSec = bus1WaitSec < 0 ? bus1WaitSec + 420 : bus1WaitSec + 20;

    // 2nd bus: 7 to 15 minutes away
    const bus2ActualSec = bus1ActualSec + 360 + (seed % 240);

    // 3rd bus: 16 to 28 minutes away
    const bus3ActualSec = bus2ActualSec + 480 + (seed % 300);

    // Assign realistic loads
    const loads: BusLoad[] = ['SEA', 'SEA', 'SDA', 'LSD', 'SEA', 'SDA'];
    const bus1Load = loads[(seed + Math.floor(now / 60000)) % loads.length];
    const bus2Load = loads[(seed + 2) % loads.length];
    const bus3Load = loads[(seed + 4) % loads.length];

    // Assign deck type (many trunk routes use Double Deckers)
    const types: BusType[] = ['DD', 'SD', 'DD', 'SD', 'BD'];
    const bus1Type = types[(seed + index) % types.length];
    const bus2Type = types[(seed + index + 1) % types.length];
    const bus3Type = types[(seed + index + 2) % types.length];

    return {
      ServiceNo: svcNo,
      Operator: meta.op,
      NextBus: {
        OriginCode: '01019',
        DestinationCode: '75009',
        EstimatedArrival: new Date(now + bus1ActualSec * 1000).toISOString(),
        Latitude: (stop.latitude - 0.003 + (seed % 10) * 0.0005).toFixed(6),
        Longitude: (stop.longitude - 0.003 + (seed % 8) * 0.0005).toFixed(6),
        VisitNumber: '1',
        Load: bus1Load,
        Feature: 'WAB',
        Type: bus1Type,
      },
      NextBus2: {
        OriginCode: '01019',
        DestinationCode: '75009',
        EstimatedArrival: new Date(now + bus2ActualSec * 1000).toISOString(),
        Latitude: (stop.latitude - 0.01 + (seed % 5) * 0.001).toFixed(6),
        Longitude: (stop.longitude - 0.01 + (seed % 4) * 0.001).toFixed(6),
        VisitNumber: '1',
        Load: bus2Load,
        Feature: 'WAB',
        Type: bus2Type,
      },
      NextBus3: {
        OriginCode: '01019',
        DestinationCode: '75009',
        EstimatedArrival: new Date(now + bus3ActualSec * 1000).toISOString(),
        Latitude: '0',
        Longitude: '0',
        VisitNumber: '1',
        Load: bus3Load,
        Feature: 'WAB',
        Type: bus3Type,
      },
    };
  });

  return {
    'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrivalv2/@Element',
    BusStopCode: busStopCode,
    Services: services,
  };
}

/**
 * Main fetch function that hits backend if available or falls back to realistic simulation
 */
export async function fetchBusArrivalsForStop(
  busStopCode: string
): Promise<{
  data: ProcessedBusService[];
  isSimulated: boolean;
  rawResponse?: LtaBusArrivalResponse;
  error?: string;
}> {
  const config = getApiConfiguration();

  // If user enabled backend mode, attempt to hit the backend endpoint
  if (config.useBackend && config.endpointUrl) {
    try {
      const url = `${config.endpointUrl}${
        config.endpointUrl.includes('?') ? '&' : '?'
      }BusStopCode=${encodeURIComponent(busStopCode)}`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(config.ltaAccountKey ? { AccountKey: config.ltaAccountKey } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP status ${response.status}`);
      }

      const raw: LtaBusArrivalResponse = await response.json();
      const processed = parseLtaResponse(raw);
      return { data: processed, isSimulated: false, rawResponse: raw };
    } catch (err: unknown) {
      console.warn('Backend fetch failed or not yet mounted. Falling back to simulated LTA stream:', err);
      // Fallback to simulation so UI doesn't break
      const simulatedRaw = generateSimulatedLtaArrival(busStopCode);
      const processed = parseLtaResponse(simulatedRaw);
      return {
        data: processed,
        isSimulated: true,
        rawResponse: simulatedRaw,
        error: err instanceof Error ? err.message : 'Backend connection unavailable',
      };
    }
  }

  // Pure frontend mode with simulated LTA stream
  const simulatedRaw = generateSimulatedLtaArrival(busStopCode);
  const processed = parseLtaResponse(simulatedRaw);
  return { data: processed, isSimulated: true, rawResponse: simulatedRaw };
}

/**
 * Converts LTA raw API response into our clean ProcessedBusService array
 */
export function parseLtaResponse(raw: LtaBusArrivalResponse): ProcessedBusService[] {
  const bookmarks = getBookmarkedKeys();
  const stopCode = raw.BusStopCode;

  const list: ProcessedBusService[] = (raw.Services || []).map((s) => {
    const meta = BUS_SERVICE_DESTINATIONS[s.ServiceNo];
    const destination = meta ? meta.term1 : 'Terminal / Loop';
    const operator = s.Operator || (meta ? meta.op : 'SBST');

    const nextBus = s.NextBus
      ? processRawBusArrival(
          s.NextBus.EstimatedArrival,
          s.NextBus.Load,
          s.NextBus.Feature,
          s.NextBus.Type,
          s.NextBus.DestinationCode,
          destination
        )
      : null;

    const nextBus2 = s.NextBus2
      ? processRawBusArrival(
          s.NextBus2.EstimatedArrival,
          s.NextBus2.Load,
          s.NextBus2.Feature,
          s.NextBus2.Type,
          s.NextBus2.DestinationCode,
          destination
        )
      : null;

    const nextBus3 = s.NextBus3
      ? processRawBusArrival(
          s.NextBus3.EstimatedArrival,
          s.NextBus3.Load,
          s.NextBus3.Feature,
          s.NextBus3.Type,
          s.NextBus3.DestinationCode,
          destination
        )
      : null;

    const bookmarkKey = `${stopCode}_${s.ServiceNo}`;

    return {
      serviceNo: s.ServiceNo,
      operator,
      operatorName: getOperatorName(operator),
      destination,
      nextBus,
      nextBus2,
      nextBus3,
      isBookmarked: bookmarks.includes(bookmarkKey),
    };
  });

  // Sort services numerically / naturally (e.g. 7, 14, 16, 65, 106, 502)
  return list.sort((a, b) => {
    const numA = parseInt(a.serviceNo.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.serviceNo.replace(/\D/g, ''), 10) || 0;
    if (numA !== numB) return numA - numB;
    return a.serviceNo.localeCompare(b.serviceNo);
  });
}
