"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = require("./cluster");
function markerClustererFactory() {
    class MarkerClustererImpl extends google.maps.OverlayView {
        //#endregion
        constructor(map, options = {}) {
            super();
            this._clusters = [];
            this._markers = [];
            this._ready = false;
            Object.assign(this, {
                batchSize: 2000,
                batchSizeIE: 500,
                imagePath: 'm',
                imageExtension: 'png',
                imageSizes: [53, 56, 66, 68, 90],
                calculator: Calculator,
                avarageCenter: false,
                zoomOnClick: true,
                ignoreHidden: false,
                enableRetinaIcons: false,
                clusterClass: 'cluster',
                styles: [],
                gridSize: 60,
                minClusterSize: 3
            }, options);
            if (navigator.userAgent.toLowerCase().indexOf("msie") !== -1) {
                // Try to avoid IE timeout when processing a huge number of markers:
                this.batchSize = this.batchSizeIE;
            }
            this._setupStyles();
            this.setMap(map);
        }
        get markers() { return this._markers; }
        /**
         * Add a marker to the clusterer
         *
         * @param {google.maps.Marker} marker
         * @param {boolean} [redraw=true]
         * @memberof MarkerClustererImpl
         */
        addMarker(marker, redraw = true) {
            this._pushMarkerTo(marker);
            if (redraw)
                this._redraw();
        }
        /**
         * Added a list of markers to the clusterer
         *
         * @param {google.maps.Marker[]} markers
         * @param {boolean} [redraw=true]
         * @memberof MarkerClustererImpl
         */
        addMarkers(markers, redraw = true) {
            for (let i = 0, ii = markers.length; i < ii; i++)
                this._pushMarkerTo(markers[i]);
            if (redraw)
                this._redraw();
        }
        /**
         * Remove a marker from
         *
         * @param {google.maps.Marker} marker
         * @param {boolean} [redraw=true]
         * @returns
         * @memberof MarkerClustererImpl
         */
        removeMarker(marker, redraw = true) {
            var removed = this._removeMarker(marker);
            if (!redraw && removed) {
                this.repaint();
            }
            return removed;
        }
        /**
         * Remove a list of markers
         *
         * @param {google.maps.Marker[]} markers
         * @param {boolean} [redraw=true]
         * @returns
         * @memberof MarkerClustererImpl
         */
        removeMarkers(markers, redraw = true) {
            var i, r;
            var removed = false;
            for (i = 0; i < markers.length; i++) {
                r = this._removeMarker(markers[i]);
                removed = removed || r;
            }
            if (!redraw && removed) {
                this.repaint();
            }
            return removed;
        }
        clearMarkers() {
            this._resetViewport(true);
            this._markers = [];
        }
        repaint() {
            var oldClusters = this._clusters.slice();
            this._clusters = [];
            this._resetViewport(false);
            this._redraw();
            // Remove the old clusters.
            // Do it in a timeout to prevent blinking effect.
            setTimeout(function () {
                var i;
                for (i = 0; i < oldClusters.length; i++) {
                    oldClusters[i].remove();
                }
            }, 0);
        }
        getExtendedBounds(bounds) {
            var projection = this.getProjection();
            // Turn the bounds into latlng.
            var tr = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng());
            var bl = new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng());
            // Convert the points to pixels and the extend out by the grid size.
            var trPix = projection.fromLatLngToDivPixel(tr);
            trPix.x += this.gridSize;
            trPix.y -= this.gridSize;
            var blPix = projection.fromLatLngToDivPixel(bl);
            blPix.x -= this.gridSize;
            blPix.y += this.gridSize;
            // Convert the pixel points back to LatLng
            var ne = projection.fromDivPixelToLatLng(trPix);
            var sw = projection.fromDivPixelToLatLng(blPix);
            // Extend the bounds to contain the new bounds.
            bounds.extend(ne);
            bounds.extend(sw);
            return bounds;
        }
        fitMapToMarkers() {
            var i;
            var markers = this.markers;
            var bounds = new google.maps.LatLngBounds();
            for (i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }
            this.getMap().fitBounds(bounds);
        }
        //#region Overlay Lifecircle
        onAdd() {
            this._ready = true;
            this._listeners = [
                google.maps.event.addListener(this.getMap(), 'zoom_changed', () => {
                    this._resetViewport(false);
                    // Workaround for this Google bug: when map is at level 0 and "-" of
                    // zoom slider is clicked, a "zoom_changed" event is fired even though
                    // the map doesn't zoom out any further. In this situation, no "idle"
                    // event is triggered so the cluster markers that have been removed
                    // do not get redrawn. Same goes for a zoom in at maxZoom.
                    const map = this.getMap();
                    if (map.getZoom() === (map.get("minZoom") || 0) || map.getZoom() === map.get("maxZoom")) {
                        google.maps.event.trigger(this, "idle");
                    }
                }),
                google.maps.event.addListener(this.getMap(), 'idle', () => {
                    this._redraw();
                })
            ];
        }
        onRemove() {
            var i = 0, ii = 0, map = this.getMap();
            for (i = 0, ii = this._markers.length; i < ii; i++) {
                if (this._markers[i].getMap() !== map) {
                    this._markers[i].setMap(map);
                }
            }
            // Remove all clusters:
            for (i = 0, ii = this._clusters.length; i < ii; i++) {
                this._clusters[i].remove();
            }
            this._clusters = [];
            // Remove map event listeners:
            for (i = 0, ii = this._listeners.length; i < ii; i++) {
                google.maps.event.removeListener(this._listeners[i]);
            }
            this._listeners = [];
            this._ready = false;
        }
        draw() { }
        //#endregion
        _pushMarkerTo(marker) {
            // If the marker is draggable add a listener so we can update the clusters on the dragend:
            if (marker.getDraggable()) {
                google.maps.event.addListener(marker, "dragend", () => {
                    if (this._ready) {
                        marker.isAdded = false;
                        this.repaint();
                    }
                });
            }
            marker.isAdded = false;
            this._markers.push(marker);
        }
        _redraw() {
            this._createClusters(0);
        }
        _resetViewport(hide) {
            var i, marker;
            // Remove all the clusters
            for (i = 0; i < this._clusters.length; i++) {
                this._clusters[i].remove();
            }
            this._clusters = [];
            // Reset the markers to not be added and to be removed from the map.
            for (i = 0; i < this._markers.length; i++) {
                marker = this._markers[i];
                marker.isAdded = false;
                if (hide) {
                    marker.setMap(null);
                }
            }
        }
        _distanceBetweenPoints(p1, p2) {
            var R = 6371; // Radius of the Earth in km
            var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
            var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        }
        _isMarkerInBounds(marker, bounds) {
            return bounds.contains(marker.getPosition());
        }
        _addToClosestCluster(marker) {
            var i, d, cluster, center;
            var distance = 40000; // Some large number
            var clusterToAddTo = null;
            for (i = 0; i < this._clusters.length; i++) {
                cluster = this._clusters[i];
                center = cluster.center;
                if (center) {
                    d = this._distanceBetweenPoints(center, marker.getPosition());
                    if (d < distance) {
                        distance = d;
                        clusterToAddTo = cluster;
                    }
                }
            }
            if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
                clusterToAddTo.addMarker(marker);
            }
            else {
                cluster = new cluster_1.Cluster(this, this.ClusterIcon);
                cluster.addMarker(marker);
                this._clusters.push(cluster);
            }
        }
        _createClusters(firstIndex) {
            var i, marker;
            var mapBounds;
            if (!this._ready) {
                return;
            }
            // Cancel previous batch processing if we're working on the first batch:
            if (firstIndex === 0) {
                /**
                 * This event is fired when the <code>MarkerClusterer</code> begins
                 *  clustering markers.
                 * @name MarkerClusterer#clusteringbegin
                 * @param {MarkerClusterer} mc The MarkerClusterer whose markers are being clustered.
                 * @event
                 */
                google.maps.event.trigger(this, "clusteringbegin", this);
                if (typeof this._timerRefStatic !== "undefined") {
                    clearTimeout(this._timerRefStatic);
                    delete this._timerRefStatic;
                }
            }
            const map = this.getMap();
            // Get our current map view bounds.
            // Create a new bounds object so we don't affect the map.
            //
            // See Comments 9 & 11 on Issue 3651 relating to this workaround for a Google Maps bug:
            if (map.getZoom() > 3) {
                mapBounds = new google.maps.LatLngBounds(map.getBounds().getSouthWest(), map.getBounds().getNorthEast());
            }
            else {
                mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(85.02070771743472, -178.48388434375), new google.maps.LatLng(-85.08136444384544, 178.00048865625));
            }
            var bounds = this.getExtendedBounds(mapBounds);
            var iLast = Math.min(firstIndex + this.batchSize, this.markers.length);
            for (i = firstIndex; i < iLast; i++) {
                marker = this.markers[i];
                if (!marker.isAdded && this._isMarkerInBounds(marker, bounds)) {
                    if (!this.ignoreHidden || (this.ignoreHidden && marker.getVisible())) {
                        this._addToClosestCluster(marker);
                    }
                }
            }
            if (iLast < this.markers.length) {
                this._timerRefStatic = setTimeout(() => {
                    this._createClusters(iLast);
                }, 0);
            }
            else {
                delete this._timerRefStatic;
                /**
                 * This event is fired when the <code>MarkerClusterer</code> stops
                 *  clustering markers.
                 * @name MarkerClusterer#clusteringend
                 * @param {MarkerClusterer} mc The MarkerClusterer whose markers are being clustered.
                 * @event
                 */
                google.maps.event.trigger(this, "clusteringend", this);
            }
        }
        _removeMarker(marker) {
            var i;
            var index = -1;
            if (this._markers.indexOf) {
                index = this._markers.indexOf(marker);
            }
            else {
                for (i = 0; i < this._markers.length; i++) {
                    if (marker === this._markers[i]) {
                        index = i;
                        break;
                    }
                }
            }
            if (index === -1) {
                // Marker is not in our list of markers, so do nothing:
                return false;
            }
            marker.setMap(null);
            this._markers.splice(index, 1); // Remove the marker from the list of managed markers
            return true;
        }
        _setupStyles() {
            var i, size;
            if (this.styles.length > 0) {
                return;
            }
            for (i = 0; i < this.imageSizes.length; i++) {
                size = this.imageSizes[i];
                this.styles.push({
                    //url: this.imagePath + (i + 1) + "." + this.imageExtension,
                    url: this.imagePath + '.' + this.imageExtension,
                    //height: size,
                    //width: size,
                    width: 37,
                    height: 50
                });
            }
        }
    }
    var Calculator = function (markers, numStyles) {
        var index = 0;
        var title = "";
        var count = markers.length; //.toString();
        var dv = count;
        while (dv !== 0) {
            dv = dv / 10; //parseInt(dv / 10, 10);
            index++;
        }
        index = Math.min(index, numStyles);
        return {
            text: count,
            index: index,
            title: title
        };
    };
    return MarkerClustererImpl;
}
exports.markerClustererFactory = markerClustererFactory;
