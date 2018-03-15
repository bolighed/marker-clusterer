/// <reference types="googlemaps" />
import { ClusterIconCtor } from './cluster-icon';
import { MarkerLike } from './types';
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
    addMarker(marker: MarkerLike, redraw?: boolean): any;
    getExtendedBounds(bounds: google.maps.LatLngBounds): any;
    clearMarkers(): any;
    /**
         * Added a list of markers to the clusterer
         *
         * @param {MarkerLike[]} markers
         * @param {boolean} [redraw=true]
         * @memberof MarkerClustererImpl
         */
    addMarkers(markers: MarkerLike[], redraw?: boolean): any;
    /**
     * Remove a marker from
     *
     * @param {MarkerLike} marker
     * @param {boolean} [redraw=true]
     * @returns
     * @memberof MarkerClustererImpl
     */
    removeMarker(marker: MarkerLike, redraw?: boolean): any;
    /**
     * Remove a list of markers
     *
     * @param {MarkerLike[]} markers
     * @param {boolean} [redraw=true]
     * @returns
     * @memberof MarkerClustererImpl
     */
    removeMarkers(markers: MarkerLike[], redraw?: boolean): any;
    repaint(): any;
}
export declare type MarkerClustererCTOR = new (map: google.maps.Map, options: MarkerClustererOptions) => MarkerClusterer;
export declare function markerClustererFactory(): MarkerClustererCTOR;
