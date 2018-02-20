

export interface MarkerLike {
    setPosition(position: google.maps.LatLng): any;
    getPosition(): google.maps.LatLng;
    getDraggable(): boolean;
    getVisible(): boolean;
    setMap(map: google.maps.Map | google.maps.StreetViewPanorama | null): any;
    getMap(): google.maps.Map | google.maps.StreetViewPanorama;
}