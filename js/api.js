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
                const searchQuery = (query || '').toLowerCase().includes(countryHint.toLowerCase()) ? query : `${query}, ${countryHint}`;
                let data = await fetchJson(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(searchQuery)}`);
                let result = data?.[0];
                if (!result) {
                    data = await fetchJson(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`);
                    result = data?.[0];
                }
                if (!result) return null;
                const address = result.address || {};
                return { lat: Number(result.lat), lng: Number(result.lon), bbox: result.boundingbox, displayName: result.display_name, country: address.country, state: address.state || address.region, city: address.city || address.town || address.village || address.suburb };
            } catch { return null; }
        },
        getNearbyHospitals: async (lat, lng) => {
            const radii = [5000, 10000, 20000, 50000];
            let hospitals = [];
            let usedRadius = 0;
            const fetchOverpass = async radius => {
                try {
                    const query = `[out:json][timeout:25];(nwr["amenity"="hospital"](around:${radius},${lat},${lng});nwr["amenity"="clinic"](around:${radius},${lat},${lng});nwr["healthcare"="hospital"](around:${radius},${lat},${lng});nwr["healthcare"="clinic"](around:${radius},${lat},${lng});nwr["amenity"="doctors"](around:${radius},${lat},${lng}););out center;`;
                    const data = await fetchJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                    return (data.elements || []).map(item => {
                        const tags = item.tags || {};
                        const itemLat = item.lat || item.center?.lat;
                        const itemLng = item.lon || item.center?.lon;
                        return { id: item.id, name: tags.name || tags['addr:housename'] || 'Medical Center', lat: itemLat, lng: itemLng, type: tags.amenity || tags.healthcare || 'hospital', openingHours: tags.opening_hours || '', source: 'OpenStreetMap' };
                    }).filter(item => item.lat && item.lng && item.name !== 'Medical Center');
                } catch { return []; }
            };
            for (const radius of radii) {
                hospitals = await fetchOverpass(radius);
                if (hospitals.length) { usedRadius = radius; break; }
            }
            const seen = new Set();
            const unique = hospitals.filter(item => {
                const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            return { results: unique, radius: usedRadius };
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
