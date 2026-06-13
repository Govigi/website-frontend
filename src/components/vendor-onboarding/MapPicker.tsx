"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon } from "@heroicons/react/24/outline";

const DEFAULT_CENTER = {
    lat: 17.3850,
    lng: 78.4867
};

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

type MapPickerProps = {
    isOpen?: boolean;
    onClose?: () => void;
    onConfirm: (locationData: any) => void;
    apiKey: string;     
    initialLocation?: { lat: number; lng: number };
    initialAddress?: string;
    inline?: boolean;
};

export default function MapPicker({ isOpen, onClose, onConfirm, apiKey, initialLocation, initialAddress, inline = false }: MapPickerProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
        libraries: LIBRARIES,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
    const [searchQuery, setSearchQuery] = useState("");
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);

    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const geocoder = useRef<google.maps.Geocoder | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);

    useEffect(() => {
        if (isLoaded && !loadError) {
            try {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                geocoder.current = new window.google.maps.Geocoder();
                // We create a dummy div for PlacesService since it requires an HTML element or a Map.
                placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
            } catch (err) {
                console.error("Error initializing Google Maps services:", err);
            }
        }
    }, [isLoaded, loadError]);

    useEffect(() => {
        if ((isOpen || inline) && isLoaded) {
            if (initialLocation && initialLocation.lat !== 0 && initialLocation.lng !== 0) {
                setCenter(initialLocation);
                setMarkerPosition(initialLocation);
                const prevPlace = {
                    place_id: "initial-pin",
                    formatted_address: initialAddress || "Pinned Location (Coordinates Set)",
                    name: "Selected Location",
                    address_components: []
                };
                setSelectedPlace(prevPlace);
                setSearchQuery(initialAddress || prevPlace.formatted_address);

                if (geocoder.current) {
                    geocoder.current.geocode({ location: initialLocation }, (results, status) => {
                        if (status === "OK" && results && results[0]) {
                            setSelectedPlace(results[0]);
                        }
                    });
                }
            } else {
                let isSecure = true;
                if (typeof window !== "undefined") {
                    isSecure = window.location.protocol === "https:" || 
                               window.location.hostname === "localhost" || 
                               window.location.hostname === "127.0.0.1";
                }

                if (isSecure && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            const newPos = { lat: latitude, lng: longitude };
                            setCenter(newPos);
                            updateLocationFromCoordinates(latitude, longitude, false);
                        },
                        (error) => {
                            console.error("Auto geolocation error:", error);
                            updateLocationFromCoordinates(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, false);
                        }
                    );
                } else {
                    updateLocationFromCoordinates(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, false);
                }
            }
        }
    }, [isOpen, isLoaded, initialLocation, initialAddress]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        // We can update the places service to use the actual map once it loads
        if (window.google?.maps?.places) {
            placesService.current = new window.google.maps.places.PlacesService(map);
        }
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length > 2 && autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                { input: value },
                (results) => {
                    setPredictions(results || []);
                }
            );
        } else {
            setPredictions([]);
        }
    };

    const triggerConfirm = (result: any, pos: { lat: number; lng: number }) => {
        const components: any = {};
        if (result.address_components) {
            result.address_components.forEach((c: any) => {
                const types = c.types;
                if (types.includes("street_number")) components.houseNumber = c.long_name;
                if (types.includes("route")) components.street = c.long_name;
                if (types.includes("sublocality") || types.includes("sublocality_level_1")) components.area = c.long_name;
                if (types.includes("locality")) components.city = c.long_name;
                if (types.includes("administrative_area_level_1")) components.state = c.long_name;
                if (types.includes("postal_code")) components.postalCode = c.long_name;
                if (types.includes("country")) components.country = c.long_name;
            });
        }
        const formatted = result.formatted_address || result.name || "";
        onConfirm({
            placeId: result.place_id || "manual",
            formattedAddress: formatted,
            rawAddress: formatted,
            components,
            location: {
                type: "Point",
                coordinates: [pos.lng, pos.lat],
            },
            label: "Business",
            isPrimary: true,
        });
    };

    const updateLocationFromCoordinates = (lat: number, lng: number, shouldConfirm = true) => {
        const newPos = { lat, lng };
        setMarkerPosition(newPos);

        const fallbackPlace = {
            place_id: "manual-pin",
            formatted_address: "Pinned Location (Custom Map Pin)",
            name: "Pinned Location",
            address_components: [
                { types: ["locality"], long_name: "Local Area" },
                { types: ["administrative_area_level_1"], long_name: "Manual Location" }
            ]
        };
        setSelectedPlace(fallbackPlace);
        setSearchQuery(fallbackPlace.formatted_address);

        if (geocoder.current) {
            geocoder.current.geocode({ location: newPos }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                    const place = results[0];
                    setSelectedPlace(place);
                    setSearchQuery(place.formatted_address);
                    if (inline && shouldConfirm) {
                        triggerConfirm(place, newPos);
                    }
                }
            });
        }
    };

    const handlePredictionSelect = (placeId: string, description: string) => {
        setSearchQuery(description);
        setPredictions([]);

        if (placesService.current) {
            placesService.current.getDetails({ placeId }, (place, status) => {
                if (status === "OK" && place && place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const newPos = { lat, lng };

                    setCenter(newPos);
                    setMarkerPosition(newPos);
                    setSelectedPlace(place);

                    map?.panTo(newPos);
                    map?.setZoom(17);
                    
                    if (inline) {
                        triggerConfirm(place, newPos);
                    }
                }
            });
        }
    };

    const handleLocateMe = () => {
        if (typeof window !== "undefined") {
            const isSecure = window.location.protocol === "https:" || 
                             window.location.hostname === "localhost" || 
                             window.location.hostname === "127.0.0.1";
            if (!isSecure) {
                alert("Location services are disabled on insecure origins (HTTP). Please access this page using 'http://localhost:3000' or configure HTTPS.");
                return;
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    updateLocationFromCoordinates(latitude, longitude);
                    const newPos = { lat: latitude, lng: longitude };
                    setCenter(newPos);
                    map?.panTo(newPos);
                    map?.setZoom(17);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    if (error.code === error.PERMISSION_DENIED) {
                        alert("Location permission was denied. Please click the lock/settings icon in your browser URL bar, change 'Location' to 'Allow', and refresh the page.");
                    } else {
                        alert("Unable to retrieve your location: " + error.message);
                    }
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
        }
    };

    const handleMapIdle = () => {
        if (map && inline) {
            const currentCenter = map.getCenter();
            if (currentCenter) {
                const lat = currentCenter.lat();
                const lng = currentCenter.lng();
                const dist = Math.abs(lat - markerPosition.lat) + Math.abs(lng - markerPosition.lng);
                if (dist > 0.0001) {
                    updateLocationFromCoordinates(lat, lng);
                }
            }
        }
    };

    const handleConfirm = () => {
        if (!selectedPlace) return;

        const result = selectedPlace;
        const components: any = {};

        if (result.address_components) {
            result.address_components.forEach((c: any) => {
                const types = c.types;
                if (types.includes("street_number")) components.houseNumber = c.long_name;
                if (types.includes("route")) components.street = c.long_name;
                if (types.includes("sublocality") || types.includes("sublocality_level_1")) components.area = c.long_name;
                if (types.includes("locality")) components.city = c.long_name;
                if (types.includes("administrative_area_level_1")) components.state = c.long_name;
                if (types.includes("postal_code")) components.postalCode = c.long_name;
                if (types.includes("country")) components.country = c.long_name;
            });
        }

        const formatted = result.formatted_address || result.name || "";
        const lat = markerPosition.lat;
        const lng = markerPosition.lng;

        onConfirm({
            placeId: result.place_id,
            formattedAddress: formatted,
            rawAddress: formatted,
            components,
            location: {
                type: "Point",
                coordinates: [lng, lat],
            },
            label: "Business",
            isPrimary: true,
        });
        onClose();
    };

    if (inline) {
        if (!isLoaded) {
            return (
                <div className="w-full h-[360px] rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 bg-gray-50/50">
                    {loadError ? "Error loading Google Maps" : "Loading Map..."}
                </div>
            );
        }

        return (
            <div className="w-full rounded-2xl overflow-hidden border border-gray-150 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col relative h-[380px] font-outfit">
                {/* Map Area */}
                <div className="flex-1 w-full bg-gray-50 relative overflow-hidden">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={center}
                        zoom={16}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onIdle={handleMapIdle}
                        onClick={handleMapClick}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: false,
                        }}
                    />

                    {/* Floating Search Bar */}
                    <div className="absolute top-4 left-4 right-4 z-10">
                        <div className="relative shadow-md rounded-full bg-white max-w-md mx-auto">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-green-600 stroke-[3]" />
                            <input
                                type="text"
                                placeholder="Search for area, street name"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-11 pr-10 py-3 rounded-full border-0 focus:ring-0 focus:outline-none bg-white text-xs font-semibold text-gray-800 placeholder-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(""); setPredictions([]); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            )}
                            {predictions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-20 border border-gray-100">
                                    {predictions.map((p) => (
                                        <button
                                            key={p.place_id}
                                            onClick={() => handlePredictionSelect(p.place_id, p.description)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                                        >
                                            <span className="font-bold block text-xs text-gray-800">{p.structured_formatting.main_text}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{p.structured_formatting.secondary_text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Pin & Tooltip Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                        {/* Tooltip Wrapper */}
                        <div className="flex flex-col items-center -translate-y-8">
                            {/* Tooltip */}
                            <div className="bg-green-700 text-white px-4 py-2.5 rounded-[18px] flex flex-col items-center shadow-lg relative max-w-xs text-center">
                                <span className="text-[10px] font-extrabold tracking-tight whitespace-nowrap">Your orders will be picked up from here</span>
                                <span className="text-[8px] text-green-100 font-semibold mt-0.5 whitespace-nowrap">Move pin to adjust exact location</span>
                                {/* Arrow */}
                                <div className="w-2 h-2 bg-green-700 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                            </div>
                            
                            {/* Black Pin with white center */}
                            <div className="mt-2 flex flex-col items-center">
                                <div className="w-7 h-7 rounded-full bg-black border-[1.5px] border-white flex items-center justify-center shadow-md">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                                {/* Stem pointing to center */}
                                <div className="w-0.5 h-2.5 bg-black -mt-0.5"></div>
                            </div>
                        </div>
                        {/* Pulse / Shadow at the center */}
                        <div className="w-4 h-1 bg-black/20 rounded-full blur-[1px] -mt-8"></div>
                    </div>

                    {/* Use Current Location Button */}
                    <button
                        type="button"
                        onClick={handleLocateMe}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white hover:bg-gray-50 border border-green-600 text-green-600 px-5 py-2.5 rounded-full shadow-lg font-bold text-[10px] flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <svg className="w-3.5 h-3.5 fill-none stroke-green-600 stroke-[2.5]" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                        </svg>
                        <span>Use current location</span>
                    </button>

                    {/* Bottom Right Zoom Control */}
                    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => map?.setZoom((map.getZoom() || 16) + 1)}
                            className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl shadow-md flex items-center justify-center font-bold text-gray-600 text-xs transition-all active:scale-95"
                        >
                            ＋
                        </button>
                        <button
                            type="button"
                            onClick={() => map?.setZoom((map.getZoom() || 16) - 1)}
                            className="w-8 h-8 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl shadow-md flex items-center justify-center font-bold text-gray-600 text-xs transition-all active:scale-95"
                        >
                            －
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Mark Shop Location</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 relative flex flex-col h-full">
                    {/* Search Bar */}
                    <div className="absolute top-4 left-4 right-4 z-10 max-w-md">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for your shop address..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                            />
                            {predictions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-20 border border-gray-100">
                                    {predictions.map((p) => (
                                        <button
                                            key={p.place_id}
                                            onClick={() => handlePredictionSelect(p.place_id, p.description)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                                        >
                                            <span className="font-semibold block text-gray-900">{p.structured_formatting.main_text}</span>
                                            <span className="text-sm text-gray-500">{p.structured_formatting.secondary_text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 w-full bg-gray-100 relative">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={center}
                                zoom={15}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                onClick={handleMapClick}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                }}
                            >
                                <Marker
                                    position={markerPosition}
                                    draggable={true}
                                    onDragEnd={(e) => {
                                        if (e.latLng) {
                                            updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
                                        }
                                    }}
                                />
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                {loadError ? "Error loading maps" : "Loading Map..."}
                            </div>
                        )}

                        {/* Locate Me Button */}
                        <button
                            onClick={handleLocateMe}
                            title="Use my current location"
                            className="absolute bottom-10 right-4 z-10 p-3 bg-white hover:bg-gray-50 text-green-600 rounded-full shadow-xl border border-gray-100 transition-all active:scale-95 group"
                        >
                            <MapPinIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Confirm Shop Address</p>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {selectedPlace ? selectedPlace.formatted_address : "Position the pin on the map"}
                        </p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPlace}
                        className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all ${
                            selectedPlace ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
}