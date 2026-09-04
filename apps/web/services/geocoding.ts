/**
 * Geocoding service — wraps OpenStreetMap Nominatim + Overpass API
 * Ported from js/services/api.js
 */

import type { GeoCoordinates, HospitalCentre } from '@smartcare/types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export async function geocodeLocation(query: string): Promise<GeoCoordinates | null> {
  try {
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
    const r = data[0];
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      bbox: r.boundingbox,
      displayName: r.display_name,
      country: r.address?.country,
      state: r.address?.state,
      city: r.address?.city || r.address?.town || r.address?.village,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoCoordinates | null> {
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      lat, lng,
      displayName: data.display_name,
      country: data.address?.country,
      state: data.address?.state,
      city: data.address?.city || data.address?.town || data.address?.village,
    };
  } catch {
    return null;
  }
}

export async function findNearbyHospitals(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<HospitalCentre[]> {
  const radiusM = radiusKm * 1000;
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="clinic"](around:${radiusM},${lat},${lng});
      way["amenity"="clinic"](around:${radiusM},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusM},${lat},${lng});
    );
    out center 15;
  `;
  try {
    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: String(el.id),
        name: el.tags.name,
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
        type: el.tags.amenity || el.tags.healthcare || 'hospital',
        openingHours: el.tags.opening_hours,
        source: 'osm',
      }));
  } catch {
    return [];
  }
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
