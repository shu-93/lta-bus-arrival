/**
 * Official LTA DataMall Bus Arrival Types & Application Models
 * Based on LTA DataMall API documentation:
 * https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html
 */

export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available (Green), Standing Available (Amber), Limited Standing (Red)
export type BusFeature = 'WAB' | ''; // Wheelchair Accessible Bus
export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy
export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export interface NextBusArrivalRaw {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string; // ISO 8601 UTC timestamp e.g. "2026-10-15T06:45:00+00:00"
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: BusLoad;
  Feature: BusFeature;
  Type: BusType;
}

export interface ServiceArrivalRaw {
  ServiceNo: string;
  Operator: BusOperator;
  NextBus: NextBusArrivalRaw;
  NextBus2?: NextBusArrivalRaw;
  NextBus3?: NextBusArrivalRaw;
}

export interface LtaBusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: ServiceArrivalRaw[];
}

// Client-enriched models for smooth real-time UI
export interface ProcessedBusInfo {
  estimatedArrival: string; // ISO string
  minutesRemaining: number; // e.g. 0 (Arr), 1, 5, 12
  secondsRemaining: number;
  formattedCountdown: string; // "Arr", "2 min", "12 min"
  load: BusLoad;
  loadLabel: string; // "Seats Available", "Standing Available", "Limited Standing"
  feature: BusFeature;
  isWheelchairAccessible: boolean;
  type: BusType;
  typeLabel: string; // "Single Deck", "Double Deck", "Bendy"
  latitude?: number;
  longitude?: number;
  destinationCode: string;
  destinationName?: string;
}

export interface ProcessedBusService {
  serviceNo: string;
  operator: BusOperator;
  operatorName: string;
  destination: string;
  nextBus: ProcessedBusInfo | null;
  nextBus2: ProcessedBusInfo | null;
  nextBus3: ProcessedBusInfo | null;
  isBookmarked?: boolean;
}

export interface BusStopRecord {
  busStopCode: string; // 5-digit code e.g. "09048"
  roadName: string; // e.g. "Orchard Rd"
  description: string; // e.g. "Orchard Stn/Lucky Plaza"
  latitude: number;
  longitude: number;
  services: string[]; // List of passing services e.g. ["7", "14", "16", "65", "106"]
  landmark?: string;
  neighborhood?: string;
}

export interface NearbyBusStop extends BusStopRecord {
  distanceMeters: number; // Haversine distance from user
  walkingMinutes: number; // Estimated walking time
  bearingDegrees: number; // Angle relative to user (0-360)
  compassDirection: string; // N, NE, E, SE, S, SW, W, NW
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'preset' | 'manual';
  locationName: string;
}

export interface ApiConfiguration {
  endpointUrl: string;
  useBackend: boolean;
  ltaAccountKey?: string;
  autoRefreshIntervalSec: number; // default 15
}
