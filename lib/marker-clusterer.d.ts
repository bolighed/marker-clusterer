/// <reference types="googlemaps" />
export interface MarkerClusterer extends google.maps.OverlayView {
    gridSize: number;
    minClusterSize: number;
    maxZoom: number;
    styles: any[];
    title: string;
    zoomOnClick: boolean;
    avarageCenter: boolean;
    ignoreHidden: boolean;
    enableRetinaIcons: boolean;
    imagePath: string;
    imageExtension: string;
    imageSizes: number[];
    batchSize: number;
    batchSizeIE: number;
    clusterClass: string;
    addMarker(marker: google.maps.Marker): any;
    getExtendedBounds(bounds: google.maps.LatLngBounds): any;
    clearMarkers(): any;
    calculator?: (markers: google.maps.Marker[], numStyles: number) => any;
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
    calculator?: (markers: google.maps.Marker[], numStyles: number) => any;
}
export declare type MarkerClustererCTOR = new (map: google.maps.Map, options: MarkerClustererOptions) => MarkerClusterer;
export declare function markerClustererFactory(): MarkerClustererCTOR;
