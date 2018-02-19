/// <reference types="googlemaps" />
import { ClusterIconCtor } from './cluster-icon';
import { MarkerClusterer } from './marker-clusterer';
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
    readonly markers: google.maps.Marker[];
    readonly markerCluster: MarkerClusterer;
    getBounds(): google.maps.LatLngBounds;
    remove(): void;
    addMarker(marker: google.maps.Marker): boolean;
    isMarkerInClusterBounds(marker: google.maps.Marker): boolean;
    private _calculateBounds();
    private _updateIcon();
    private _isMarkerAlreadyAdded(marker);
}
