/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNearbyBusStops } from './hooks/useNearbyBusStops';
import { Header } from './components/Header';
import { NearbyStopsTabs } from './components/NearbyStopsTabs';
import { BusStopCard } from './components/BusStopCard';
import { ProximityRadar } from './components/ProximityRadar';
import { SavedStopsView } from './components/SavedStopsView';
import { BusServiceModal } from './components/BusServiceModal';
import { BackendGuideModal } from './components/BackendGuideModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { SearchStopsModal } from './components/SearchStopsModal';
import { ProcessedBusService, BusStopRecord } from './types/lta';
import {
  MapPin,
  Radar,
  Info,
  Server,
  Compass,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

export default function App() {
  const {
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
  } = useNearbyBusStops();

  // Navigation states
  const [activeNavTab, setActiveNavTab] = useState<'nearby' | 'radar' | 'saved'>('nearby');
  const [viewMode, setViewMode] = useState<'focus' | 'all'>('focus');

  // Modals
  const [selectedService, setSelectedService] = useState<ProcessedBusService | null>(null);
  const [isBackendGuideOpen, setIsBackendGuideOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [, setConfigRerender] = useState(0);

  const handleSelectSearchedStop = (stop: BusStopRecord) => {
    // If the searched stop is not in nearby stops, update location to that stop's vicinity so user gets its 5 closest stops
    setCustomCoordinates(stop.latitude, stop.longitude, stop.description);
    setSelectedStopCode(stop.busStopCode);
    setActiveNavTab('nearby');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Main App Navigation Bar */}
      <Header
        currentLocation={currentLocation}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenBackendGuide={() => setIsBackendGuideOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeNavTab={activeNavTab}
        onSelectNavTab={setActiveNavTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Context Banner: 5 Stops Radius & Backend Connection Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-2xl text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold">
              5
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
              <span className="font-semibold text-slate-100">Live Radius:</span>
              <span>Tracking 5 nearest stops within</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {nearbyStops.length > 0
                  ? `${nearbyStops[nearbyStops.length - 1].distanceMeters}m`
                  : '—'}
              </span>
              <span>of</span>
              <strong className="text-white">{currentLocation.locationName}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline flex items-center gap-1"
            >
              <span>Switch Area</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setIsBackendGuideOpen(true)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <Server className="w-3 h-3 text-emerald-400" />
              <span>Connect Backend</span>
            </button>
          </div>
        </div>

        {/* Tab 1: 5 Nearest Stops View */}
        {activeNavTab === 'nearby' && (
          <div className="space-y-6">
            {/* 5 Stops Selector Tabs */}
            <NearbyStopsTabs
              stops={nearbyStops}
              selectedStopCode={selectedStopCode}
              onSelectStop={setSelectedStopCode}
              viewMode={viewMode}
              onToggleViewMode={setViewMode}
            />

            {/* Content based on viewMode: Single Focused Stop vs All 5 Stops */}
            {viewMode === 'focus' ? (
              activeStop ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left / Main Arrival Board */}
                  <div className="lg:col-span-8">
                    <BusStopCard
                      stop={activeStop}
                      onSelectService={setSelectedService}
                    />
                  </div>

                  {/* Right Side Proximity Radar & Proximity Insights */}
                  <div className="lg:col-span-4 space-y-4">
                    <ProximityRadar
                      stops={nearbyStops}
                      selectedStopCode={selectedStopCode}
                      onSelectStop={setSelectedStopCode}
                      userLocationName={currentLocation.locationName}
                    />

                    {/* Quick Walk & Route Info */}
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-300 font-semibold">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <span>Walking Proximity Summary</span>
                      </div>
                      <div className="text-slate-400 leading-relaxed">
                        Bus Stop <strong className="text-slate-200">#{activeStop.busStopCode}</strong> is located approximately{' '}
                        <strong className="text-emerald-400">{activeStop.distanceMeters}m</strong> away ({activeStop.compassDirection} bearing).
                        Walking time is estimated at ~{activeStop.walkingMinutes} min at standard pedestrian pace.
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Services: {activeStop.services.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">Loading nearest bus stops...</div>
              )
            ) : (
              /* All 5 Stops Parallel Overview */
              <div className="space-y-6">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time arrival boards for all 5 nearest bus stops</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nearbyStops.map((stop) => (
                    <BusStopCard
                      key={stop.busStopCode}
                      stop={stop}
                      onSelectService={setSelectedService}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Proximity Radar View */}
        {activeNavTab === 'radar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <ProximityRadar
                stops={nearbyStops}
                selectedStopCode={selectedStopCode}
                onSelectStop={setSelectedStopCode}
                userLocationName={currentLocation.locationName}
              />
            </div>

            <div className="lg:col-span-6">
              {activeStop && (
                <BusStopCard
                  stop={activeStop}
                  onSelectService={setSelectedService}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Saved / Bookmarked Commute Routes */}
        {activeNavTab === 'saved' && (
          <SavedStopsView
            onSelectStop={(code) => {
              setSelectedStopCode(code);
              setActiveNavTab('nearby');
              setViewMode('focus');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SG Bus Arrivals</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Singapore Land Transport Authority (LTA) DataMall Standards</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setIsBackendGuideOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Backend Setup</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Locations</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BusServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        currentStopCode={selectedStopCode || '09048'}
      />

      <BackendGuideModal
        isOpen={isBackendGuideOpen}
        onClose={() => setIsBackendGuideOpen(false)}
        onConfigChanged={() => setConfigRerender((v) => v + 1)}
      />

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={currentLocation}
        onSelectPreset={setPresetLocation}
        onRequestGps={requestDeviceGps}
        isLocating={isLocating}
        gpsError={gpsError}
        onSetCustomCoords={setCustomCoordinates}
      />

      <SearchStopsModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStop={handleSelectSearchedStop}
      />
    </div>
  );
}
