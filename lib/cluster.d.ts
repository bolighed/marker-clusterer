/// <reference types="googlemaps" />
import { ClusterIconCtor } from './cluster-icon';
import { MarkerClusterer } from './marker-clusterer';
import { MarkerLike } from './types';
export declare class Cluster {
    private _clusterIcon;
    private _markerClusterer;
    private _markers;
    private _bounds;
    private _map;
    private _averageCenter;
    private _center;
    private _gridSize;
    private _minClusterSize;
    constructor(markerClusterer: MarkerClusterer, CustomClusterIcon?: ClusterIconCtor);
    center: google.maps.LatLng | null;
    readonly size: number;
    readonly markers: MarkerLike[];
    readonly markerCluster: MarkerClusterer;
    getBounds(): google.maps.LatLngBounds;
    remove(): void;
    addMarker(marker: MarkerLike): boolean;
    isMarkerInClusterBounds(marker: MarkerLike): boolean;
    private _calculateBounds();
    private _updateIcon();
    private _isMarkerAlreadyAdded(marker);
}
