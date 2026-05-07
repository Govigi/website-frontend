"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const DEFAULT_CENTER = {
    lat: 17.3850,
    lng: 78.4867
};

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

type MapPickerProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (locationData: any) => void;
    apiKey: string;
};

export default function MapPicker({ isOpen, onClose, onConfirm, apiKey }: MapPickerProps) {
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

    const updateLocationFromCoordinates = (lat: number, lng: number) => {
        const newPos = { lat, lng };
        setMarkerPosition(newPos);

        if (geocoder.current) {
            geocoder.current.geocode({ location: newPos }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                    const place = results[0];
                    setSelectedPlace(place);
                    setSearchQuery(place.formatted_address);
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
                }
            });
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
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
