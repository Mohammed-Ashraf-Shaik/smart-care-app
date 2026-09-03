(function () {
    const API_BASE = 'https://countriesnow.space/api/v0.1/countries';
    const timeoutMs = window.App?.Config?.apiTimeoutMs || 12000;

    async function fetchJson(url, options = {}) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal, headers: { Accept: 'application/json', ...(options.headers || {}) } });
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            return await response.json();
        } finally {
            window.clearTimeout(timeout);
        }
    }

    // Fictional fallback centres keep the prototype usable when public map results are sparse.
    const fallbackHospitals = [
        { id: 'hosp-101', name: 'SmartCare Community Hospital', type: 'hospital', area: 'Central district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '12 min' },
        { id: 'hosp-102', name: 'Lakeview General Hospital', type: 'hospital', area: 'Lakeview', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '18 min' },
        { id: 'hosp-103', name: 'Northgate Medical Centre', type: 'hospital', area: 'Northgate', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '15 min' },
        { id: 'hosp-104', name: 'Riverside Care Hospital', type: 'hospital', area: 'Riverside', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '22 min' },
        { id: 'hosp-105', name: 'Green Cross Community Clinic', type: 'clinic', area: 'West district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '8 min' },
        { id: 'hosp-106', name: 'Horizon Multispecialty Centre', type: 'hospital', area: 'Tech district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '14 min' },
        { id: 'hosp-107', name: 'Metro Family Hospital', type: 'hospital', area: 'Financial district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '16 min' },
        { id: 'hosp-108', name: 'Sunrise Community Clinic', type: 'clinic', area: 'East district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '5 min' },
        { id: 'hosp-109', name: 'Fern Grove Women & Child Care', type: 'clinic', area: 'Old city district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '10 min' },
        { id: 'hosp-110', name: 'Civic Heart Institute', type: 'hospital', area: 'South district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '20 min' },
        { id: 'hosp-111', name: 'Olive Grove Hospital', type: 'hospital', area: 'Garden district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '15 min' },
        { id: 'hosp-112', name: 'Vision Point Eye Clinic', type: 'clinic', area: 'Market district', city: 'Hyderabad', openingHours: 'Hours not verified', waitTime: '6 min' }
    ];

    // Radial offsets to place fallback centers around detected user coordinates dynamically
    const offsets = [
        { dLat: 0.008, dLng: 0.005 },
        { dLat: -0.012, dLng: 0.015 },
        { dLat: 0.018, dLng: -0.010 },
        { dLat: -0.005, dLng: -0.018 },
        { dLat: 0.022, dLng: 0.020 },
        { dLat: -0.020, dLng: 0.008 },
        { dLat: 0.014, dLng: 0.028 },
        { dLat: -0.015, dLng: -0.022 },
        { dLat: 0.030, dLng: -0.005 },
        { dLat: -0.028, dLng: 0.025 },
        { dLat: 0.005, dLng: 0.035 },
        { dLat: -0.032, dLng: -0.012 }
    ];

    const API = {
        fetchCountries: async () => {
            try { const data = await fetchJson(`${API_BASE}/iso`); return data.data || []; } catch { return []; }
        },
        fetchStates: async countryName => {
            try { const data = await fetchJson(`${API_BASE}/states`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: countryName }) }); return data.data?.states || []; } catch { return []; }
        },
        fetchCities: async (countryName, stateName) => {
            try { const data = await fetchJson(`${API_BASE}/state/cities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: countryName, state: stateName }) }); return data.data || []; } catch { return []; }
        },
        getCoordinates: async (query, countryHint = 'India') => {
            try {
                const searchQuery = (query || '').trim();
                const isNumericPin = /^\d{5,6}$/.test(searchQuery);
                let url = '';
                if (isNumericPin) {
                    url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&postalcode=${encodeURIComponent(searchQuery)}&country=${encodeURIComponent(countryHint)}&countrycodes=in`;
                } else {
                    const fullQuery = searchQuery.toLowerCase().includes(countryHint.toLowerCase()) ? searchQuery : `${searchQuery}, ${countryHint}`;
                    url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(fullQuery)}&countrycodes=in`;
                }
                let data = await fetchJson(url);
                let result = data?.[0];
                if (!result && isNumericPin) {
                    data = await fetchJson(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(searchQuery + ', India')}&countrycodes=in`);
                    result = data?.[0];
                }
                if (!result) {
                    data = await fetchJson(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(searchQuery)}`);
                    result = data?.[0];
                }
                if (!result) return null;
                const address = result.address || {};
                return { lat: Number(result.lat), lng: Number(result.lon), bbox: result.boundingbox, displayName: result.display_name, country: address.country || 'India', state: address.state || address.region || '', city: address.city || address.town || address.village || address.suburb || address.county || searchQuery };
            } catch { return null; }
        },
        getNearbyHospitals: async (lat, lng) => {
            const radii = [5000, 10000, 20000, 50000];
            let hospitals = [];
            let usedRadius = 5000;
            const fetchOverpass = async radius => {
                try {
                    const query = `[out:json][timeout:25];(nwr["amenity"="hospital"](around:${radius},${lat},${lng});nwr["amenity"="clinic"](around:${radius},${lat},${lng});nwr["healthcare"="hospital"](around:${radius},${lat},${lng});nwr["healthcare"="clinic"](around:${radius},${lat},${lng});nwr["amenity"="doctors"](around:${radius},${lat},${lng}););out center;`;
                    const data = await fetchJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                    return (data.elements || []).map(item => {
                        const tags = item.tags || {};
                        const itemLat = item.lat || item.center?.lat;
                        const itemLng = item.lon || item.center?.lon;
                        return { id: `osm-${item.id}`, name: tags.name || tags['addr:housename'] || 'Medical Center', lat: itemLat, lng: itemLng, type: tags.amenity || tags.healthcare || 'hospital', openingHours: tags.opening_hours || '24/7 Emergency', source: 'OpenStreetMap' };
                    }).filter(item => item.lat && item.lng && item.name !== 'Medical Center');
                } catch { return []; }
            };
            for (const radius of radii) {
                hospitals = await fetchOverpass(radius);
                if (hospitals.length >= 4) { usedRadius = radius; break; }
            }

            // Generate fallback items if total count is low so the user always has 8-12 hospitals
            const fallbackGenerated = fallbackHospitals.map((hosp, idx) => {
                const off = offsets[idx % offsets.length];
                return {
                    ...hosp,
                    lat: lat + off.dLat,
                    lng: lng + off.dLng,
                    source: 'Illustrative demo centre'
                };
            });

            const combined = [...hospitals, ...fallbackGenerated];
            const seen = new Set();
            const unique = combined.filter(item => {
                const key = `${item.name.toLowerCase()}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            return { results: unique.slice(0, 12), radius: usedRadius };
        },
        reverseGeocode: async (lat, lng) => {
            try {
                const data = await fetchJson(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}&zoom=10`);
                const address = data?.address;
                if (!address) return null;
                return { country: address.country, state: address.state || address.region, city: address.city || address.town || address.village || address.suburb, displayName: data.display_name };
            } catch { return null; }
        }
    };

    window.App.API = API;
})();
