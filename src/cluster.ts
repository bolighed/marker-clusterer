import { ClusterIcon, clusterIconFactory } from './cluster-icon';
import { MarkerClusterer } from './marker-clusterer';

export class Cluster {

    private _clusterIcon: ClusterIcon;
    private _markerClusterer: MarkerClusterer;
    private _markers: google.maps.Marker[] = [];
    private _bounds: google.maps.LatLngBounds | null;
    private _map: google.maps.Map;
    private _averageCenter: boolean;
    private _center: google.maps.LatLng | undefined;
    private _gridSize: number;
    private _minClusterSize: number;

    constructor(markerClusterer: MarkerClusterer) {
        this._markerClusterer = markerClusterer;
        this._clusterIcon = new (clusterIconFactory())(this, markerClusterer.styles);

        this._map = markerClusterer.getMap() as google.maps.Map;
        this._gridSize = markerClusterer.gridSize;
        this._minClusterSize = markerClusterer.minClusterSize;
        this._averageCenter = markerClusterer.avarageCenter;
        this._markers = [];
        this._center = void 0;
        this._bounds = void 0;

    }


    //#region Properties
    public center: google.maps.LatLng | null;
    get size() { return this._markers.length; }
    get markers() { return this._markers; }
    get markerCluster() { return this._markerClusterer; }

    getBounds() {
        const bounds = new google.maps.LatLngBounds(this.center, this.center);
        for (let i = 0, ii = this.size; i < ii; i++) {
            bounds.extend(this.markers[i].getPosition());
        }
        return bounds;
    }


    //#endregion


    remove() {
        this._clusterIcon.setMap(null);
        this._markers = [];
        delete this._markers;
    }

    addMarker(marker: google.maps.Marker) {
        var i;
        var mCount;
        var mz;

        if (this._isMarkerAlreadyAdded(marker)) {
            return false;
        }

        if (!this.center) {
            this.center = marker.getPosition();
            this._calculateBounds();
        } else {
            if (this._averageCenter) {
                var l = this.markers.length + 1;
                var lat = (this.center.lat() * (l - 1) + marker.getPosition().lat()) / l;
                var lng = (this.center.lng() * (l - 1) + marker.getPosition().lng()) / l;
                this.center = new google.maps.LatLng(lat, lng);
                this._calculateBounds();
            }
        }

        (marker as any).isAdded = true;
        this._markers.push(marker);

        mCount = this._markers.length;
        mz = this._markerClusterer.maxZoom;
        if (mz !== null && this._map.getZoom() > mz) {
            // Zoomed in past max zoom, so show the marker.
            if (marker.getMap() !== this._map) {
                marker.setMap(this._map);
            }
        } else if (mCount < this._minClusterSize) {
            // Min cluster size not reached so show the marker.
            if (marker.getMap() !== this._map) {
                marker.setMap(this._map);
            }
        } else if (mCount === this._minClusterSize) {
            // Hide the markers that were showing.
            for (i = 0; i < mCount; i++) {
                this._markers[i].setMap(null);
            }
        } else {
            marker.setMap(null);
        }

        this._updateIcon();
        return true;
    }


    isMarkerInClusterBounds(marker: google.maps.Marker) {
        return this._bounds.contains(marker.getPosition());
    }


    private _calculateBounds() {
        var bounds = new google.maps.LatLngBounds(this.center, this.center);
        this._bounds = this._markerClusterer.getExtendedBounds(bounds);
    }

    private _updateIcon() {
        var mCount = this.markers.length;
        var mz = this._markerClusterer.maxZoom;

        if (mz !== null && this._map.getZoom() > mz) {
            this._clusterIcon.hide();
            return;
        }

        if (mCount < this._minClusterSize) {
            // Min cluster size not yet reached.
            this._clusterIcon.hide();
            return;
        }

        var numStyles = this._markerClusterer.styles.length;
        var sums = this._markerClusterer.calculator(this.markers, numStyles);
        this._clusterIcon.setCenter(this.center);
        this._clusterIcon.useStyle(sums);
        this._clusterIcon.show();
    }

    private _isMarkerAlreadyAdded(marker: google.maps.Marker) {
        var i;
        if (this.markers.indexOf) {
            return this.markers.indexOf(marker) !== -1;
        } else {
            for (i = 0; i < this.markers.length; i++) {
                if (marker === this.markers[i]) {
                    return true;
                }
            }
        }
        return false;
    }



}