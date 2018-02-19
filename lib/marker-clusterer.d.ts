/// <reference types="googlemaps" />
import { ClusterIconCtor } from './cluster-icon';
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
    calculator?: (markers: google.maps.Marker[], numStyles: number) => any;
    ClusterIcon?: ClusterIconCtor;
}
export interface MarkerClusterer extends google.maps.OverlayView, MarkerClustererOptions {
    addMarker(marker: google.maps.Marker): any;
    getExtendedBounds(bounds: google.maps.LatLngBounds): any;
    clearMarkers(): any;
}
export declare type MarkerClustererCTOR = new (map: google.maps.Map, options: MarkerClustererOptions) => MarkerClusterer;
export declare function markerClustererFactory(): MarkerClustererCTOR;
