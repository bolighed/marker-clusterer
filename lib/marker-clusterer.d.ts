/// <reference types="googlemaps" />
import { ClusterIconCtor } from './cluster-icon';
export interface MarkerLike {
    getPosition(): google.maps.LatLng;
    getDraggable(): boolean;
    getVisible(): boolean;
    setMap(map: google.maps.Map | google.maps.StreetViewPanorama | null): any;
    getMap(): google.maps.Map | google.maps.StreetViewPanorama;
}
export interface MarkerClustererOptions {
    gridSize?: number;
    minClusterSize?: number;
    clusterClass?: string;
    maxZoom?: number;
    styles?: string[];
    title?: string;
    zoomOnClick?: boolean;
    avarageCenter?: boolean;
    ignoreHidden?: boolean;
    enableRetinaIcons?: boolean;
    imagePath?: string;
    imageExtension?: string;
    imageSizes?: number[];
    batchSize?: number;
    batchSizeIE?: number;
    calculator?: (markers: MarkerLike[], numStyles: number) => any;
    ClusterIcon?: ClusterIconCtor;
}
export interface MarkerClusterer extends google.maps.OverlayView, MarkerClustererOptions {
    addMarker(marker: MarkerLike): any;
    getExtendedBounds(bounds: google.maps.LatLngBounds): any;
    clearMarkers(): any;
}
export declare type MarkerClustererCTOR = new (map: google.maps.Map, options: MarkerClustererOptions) => MarkerClusterer;
export declare function markerClustererFactory(): MarkerClustererCTOR;
