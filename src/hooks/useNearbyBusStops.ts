import { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationCoordinates, NearbyBusStop } from '../types/lta';
import { SINGAPORE_BUS_STOPS, SINGAPORE_LOCATION_PRESETS } from '../data/singaporeBusStops';
import {
  calculateBearing,
  calculateHaversineDistanceMeters,
  bearingToCompass,
  estimateWalkingMinutes,
  isWithinSingapore,
} from '../utils/geo';

const LAST_LOCATION_STORAGE_KEY = 'sg_bus_last_location';

export function useNearbyBusStops() {
  // Default to Orchard Road hub if geolocation is pending or outside Singapore
  const defaultPreset = SINGAPORE_LOCATION_PRESETS[0];

  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(() => {
    try {
      const saved = localStorage.getItem(LAST_LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      latitude: defaultPreset.latitude,
      longitude: defaultPreset.longitude,
      source: 'preset',
      locationName: defaultPreset.name,
    };
  });

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedStopCode, setSelectedStopCode] = useState<string | null>(null);

  // Compute all stops sorted by distance, and pick the top 5 closest
  const nearbyStops: NearbyBusStop[] = useMemo(() => {
    const scored = SINGAPORE_BUS_STOPS.map((stop) => {
      const distanceMeters = calculateHaversineDistanceMeters(
        currentLocation.latitude,
        currentLocation.longitude,
        stop.latitude,
        stop.longitude
      );
      const bearingDegrees = calculateBearing(
        currentLocation.latitude,
        currentLocation.longitude,
        stop.latitude,
        stop.longitude
      );
      const walkingMinutes = estimateWalkingMinutes(distanceMeters);
      const compassDirection = bearingToCompass(bearingDegrees);

      return {
        ...stop,
        distanceMeters,
        walkingMinutes,
        bearingDegrees,
        compassDirection,
      };
    });

    // Sort strictly by ascending distance
    scored.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // Return the 5 nearest stops
    return scored.slice(0, 5);
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Keep selectedStopCode valid (default to closest stop)
  useEffect(() => {
    if (nearbyStops.length > 0) {
      if (!selectedStopCode || !nearbyStops.some((s) => s.busStopCode === selectedStopCode)) {
        setSelectedStopCode(nearbyStops[0].busStopCode);
      }
    }
  }, [nearbyStops, selectedStopCode]);

  // Function to request actual GPS from device
  const requestDeviceGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;

        if (isWithinSingapore(latitude, longitude)) {
          const loc: LocationCoordinates = {
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            source: 'gps',
            locationName: 'My Live Location',
          };
          setCurrentLocation(loc);
          localStorage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(loc));
          setGpsError(null);
        } else {
          // Device is physically outside Singapore, so notify politely
          setGpsError(
            `GPS detected coordinates (${latitude.toFixed(3)}, ${longitude.toFixed(
              3
            )}) outside Singapore. Using Singapore Orchard Hub as test location.`
          );
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not retrieve GPS coordinates.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access permission was denied. You can select any Singapore neighborhood preset below.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  // Preset location switcher
  const setPresetLocation = useCallback((presetId: string) => {
    const preset = SINGAPORE_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const loc: LocationCoordinates = {
      latitude: preset.latitude,
      longitude: preset.longitude,
      source: 'preset',
      locationName: preset.name,
    };
    setCurrentLocation(loc);
    localStorage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(loc));
    setGpsError(null);
  }, []);

  // Custom coordinate setter
  const setCustomCoordinates = useCallback((latitude: number, longitude: number, name: string) => {
    const loc: LocationCoordinates = {
      latitude,
      longitude,
      source: 'manual',
      locationName: name,
    };
    setCurrentLocation(loc);
    localStorage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(loc));
    setGpsError(null);
  }, []);

  const activeStop = useMemo(() => {
    return nearbyStops.find((s) => s.busStopCode === selectedStopCode) || nearbyStops[0] || null;
  }, [nearbyStops, selectedStopCode]);

  return {
    currentLocation,
    nearbyStops,
    selectedStopCode,
    setSelectedStopCode,
    activeStop,
    isLocating,
    gpsError,
    requestDeviceGps,
    setPresetLocation,
    setCustomCoordinates,
  };
}
