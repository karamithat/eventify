// utils/googleMapsLoader.ts

declare global {
  interface Window {
    google: typeof google;
    __googleMapsLoading?: boolean;
    __googleMapsLoaded?: boolean;
  }
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async load(): Promise<void> {
    // Eğer zaten yüklenmişse
    if (this.isLoaded()) {
      return Promise.resolve();
    }

    // Eğer zaten yüklenme sürecindeyse
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Yeni yükleme süreci başlat
    this.loadPromise = this.loadScript();
    return this.loadPromise;
  }

  private isLoaded(): boolean {
    return !!(
      typeof window !== "undefined" &&
      window.google &&
      window.google.maps &&
      window.__googleMapsLoaded
    );
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Window object not available"));
        return;
      }

      // Eğer zaten yüklenmişse
      if (this.isLoaded()) {
        resolve();
        return;
      }

      // Zaten loading durumundaysa bekle
      if (window.__googleMapsLoading) {
        const checkInterval = setInterval(() => {
          if (this.isLoaded()) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      // Loading flag'ini set et
      window.__googleMapsLoading = true;

      // Script varsa ama henüz yüklenmemişse bekle
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );

      if (existingScript) {
        const checkExisting = setInterval(() => {
          if (this.isLoaded()) {
            clearInterval(checkExisting);
            resolve();
          }
        }, 100);
        return;
      }

      // Yeni script oluştur
      const script = document.createElement("script");
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        reject(new Error("Google Maps API key not found"));
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        window.__googleMapsLoaded = true;
        window.__googleMapsLoading = false;
        this.loadPromise = null;
        resolve();
      };

      script.onerror = () => {
        window.__googleMapsLoading = false;
        this.loadPromise = null;
        reject(new Error("Failed to load Google Maps API"));
      };

      document.head.appendChild(script);
    });
  }

  public isApiLoaded(): boolean {
    return this.isLoaded();
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// React Hook
import { useState, useEffect } from "react";

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      if (googleMapsLoader.isApiLoaded()) {
        setIsLoaded(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await googleMapsLoader.load();
        setIsLoaded(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load Google Maps"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMaps();
  }, []);

  return { isLoaded, isLoading, error };
};

// Utility functions
export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  if (!googleMapsLoader.isApiLoaded()) {
    throw new Error("Google Maps API not loaded");
  }

  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

export const createMap = (
  element: HTMLElement,
  options: google.maps.MapOptions
): google.maps.Map => {
  if (!googleMapsLoader.isApiLoaded()) {
    throw new Error("Google Maps API not loaded");
  }

  return new window.google.maps.Map(element, options);
};

export const createMarker = (
  options: google.maps.MarkerOptions
): google.maps.Marker => {
  if (!googleMapsLoader.isApiLoaded()) {
    throw new Error("Google Maps API not loaded");
  }

  return new window.google.maps.Marker(options);
};

export const createInfoWindow = (
  options?: google.maps.InfoWindowOptions
): google.maps.InfoWindow => {
  if (!googleMapsLoader.isApiLoaded()) {
    throw new Error("Google Maps API not loaded");
  }

  return new window.google.maps.InfoWindow(options);
};
