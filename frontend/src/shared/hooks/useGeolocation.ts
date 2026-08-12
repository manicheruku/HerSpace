import { useEffect, useState } from "react";

export interface Coords {
  lat: number;
  lon: number;
}

interface UseGeolocationResult {
  coords: Coords | null;
  /** True once the geolocation attempt has settled (granted, denied, or error). */
  resolved: boolean;
}

/**
 * Requests the device's current position once on mount. Resolves quietly to
 * `null` coordinates if permission is denied or geolocation is unavailable, so
 * callers can fall back to a default (e.g. the user's saved city).
 */
export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setResolved(true);
      return;
    }

    let active = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setResolved(true);
      },
      () => {
        if (!active) return;
        setResolved(true);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );

    return () => {
      active = false;
    };
  }, []);

  return { coords, resolved };
}
