(function () {
    const API_BASE = "https://countriesnow.space/api/v0.1/countries";

    const API = {
        fetchCountries: async () => {
            try {
                const res = await fetch(`${API_BASE}/iso`);
                const data = await res.json();
                return data.data; // Array of { name, Iso2, Iso3 }
            } catch (e) {
                console.error("API Error", e);
                return [];
            }
        },

        fetchStates: async (countryName) => {
            try {
                const res = await fetch(`${API_BASE}/states`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: countryName })
                });
                const data = await res.json();
                return data.data.states; // Array of { name, state_code }
            } catch (e) {
                console.error("API Error", e);
                return [];
            }
        },

        fetchCities: async (countryName, stateName) => {
            try {
                const res = await fetch(`${API_BASE}/state/cities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: countryName, state: stateName })
                });
                const data = await res.json();
                return data.data; // Array of strings
            } catch (e) {
                console.error("API Error", e);
                return [];
            }
        },

        getCoordinates: async (query) => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    // Return lat/lng AND bounding box
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        bbox: data[0].boundingbox // [minLat, maxLat, minLon, maxLon]
                    };
                }
                return null;
            } catch (e) {
                console.error("Geocoding Error", e);
                return null;
            }
        },

        getNearbyHospitals: async (lat, lng, bbox = null) => {
            const radii = [5000, 10000, 20000, 50000];
            let usedRadius = 0;
            let hospitals = [];

            const fetchOverpass = async (searchRadius) => {
                try {
                    console.log(`[API] Fetching hospitals with radius: ${searchRadius}m`);
                    // Comprehensive Query
                    const query = `
                        [out:json][timeout:25];
                        (
                          nwr["amenity"="hospital"](around:${searchRadius},${lat},${lng});
                          nwr["amenity"="clinic"](around:${searchRadius},${lat},${lng});
                          nwr["healthcare"="hospital"](around:${searchRadius},${lat},${lng});
                          nwr["healthcare"="clinic"](around:${searchRadius},${lat},${lng});
                          nwr["amenity"="doctors"](around:${searchRadius},${lat},${lng});
                        );
                        out center;
                    `;
                    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                    const data = await res.json();

                    return data.elements.map(h => {
                        const hLat = h.lat || h.center?.lat;
                        const hLng = h.lon || h.center?.lon;
                        const name = h.tags.name || h.tags["addr:housename"] || "Medical Center";
                        const type = h.tags.amenity || h.tags.healthcare || "hospital";
                        return { id: h.id, name, lat: hLat, lng: hLng, type, source: 'Overpass' };
                    }).filter(h => h.lat && h.lng && h.name !== "Medical Center");
                } catch (e) {
                    console.error("[API] Overpass Error", e);
                    return [];
                }
            };

            // Recursive Search
            for (const r of radii) {
                hospitals = await fetchOverpass(r);
                if (hospitals.length > 0) {
                    usedRadius = r;
                    break;
                }
            }

            // Deduplicate
            const seen = new Set();
            const uniqueHospitals = hospitals.filter(h => {
                const key = h.lat.toFixed(4) + ',' + h.lng.toFixed(4);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            return {
                results: uniqueHospitals,
                radius: usedRadius
            };
        },

        reverseGeocode: async (lat, lng) => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
                const data = await res.json();
                if (data && data.address) {
                    return {
                        country: data.address.country,
                        state: data.address.state || data.address.region,
                        city: data.address.city || data.address.town || data.address.village || data.address.suburb
                    };
                }
                return null;
            } catch (e) {
                console.error("Reverse Geocoding Error", e);
                return null;
            }
        }
    };

    window.App.API = API;
})();
