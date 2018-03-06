(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['marker-clusterer'] = {})));
}(this, (function (exports) { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

function clusterIconFactory() {
    return function (_google$maps$OverlayV) {
        inherits(ClusterIconImpl, _google$maps$OverlayV);

        function ClusterIconImpl(cluster, styles) {
            classCallCheck(this, ClusterIconImpl);

            var _this = possibleConstructorReturn(this, (ClusterIconImpl.__proto__ || Object.getPrototypeOf(ClusterIconImpl)).call(this));

            _this.cluster = cluster;
            _this.styles = styles;
            _this.eventPrevents = ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart', 'pointerdown'];
            _this._className = cluster.markerCluster.clusterClass;
            _this.setMap(cluster.markerCluster.getMap());
            return _this;
        }

        createClass(ClusterIconImpl, [{
            key: 'onAdd',

            //get map() { return this._map; }
            //set map(map: google.maps.Map) { this._map = map; }
            value: function onAdd() {
                var _this2 = this;

                var cMouseDownInCluster;
                var cDraggingMapByCluster;
                this._div = document.createElement("div");
                this._div.className = this._className || '';
                if (this._visible) {
                    this.show();
                }
                this.getPanes().overlayMouseTarget.appendChild(this._div);
                // Fix for Issue 157
                this._boundsChangedListener = google.maps.event.addListener(this.getMap(), "bounds_changed", function () {
                    cDraggingMapByCluster = cMouseDownInCluster;
                });
                google.maps.event.addDomListener(this._div, "mousedown", function () {
                    cMouseDownInCluster = true;
                    cDraggingMapByCluster = false;
                });
                google.maps.event.addDomListener(this._div, "click", function (e) {
                    cMouseDownInCluster = false;
                    if (!cDraggingMapByCluster) {
                        var theBounds;
                        var mz;
                        var mc = _this2.cluster.markerCluster;
                        /**
                         * This event is fired when a cluster marker is clicked.
                         * @name MarkerClusterer#click
                         * @param {Cluster} c The cluster that was clicked.
                         * @event
                         */
                        google.maps.event.trigger(mc, "click", _this2.cluster);
                        google.maps.event.trigger(mc, "clusterclick", _this2.cluster); // deprecated name
                        // The default click handler follows. Disable it by setting
                        // the zoomOnClick property to false.
                        if (mc.zoomOnClick) {
                            // Zoom into the cluster.
                            mz = mc.maxZoom;
                            theBounds = _this2.cluster.getBounds();
                            var map = mc.getMap();
                            map.fitBounds(theBounds);
                            // There is a fix for Issue 170 here:
                            setTimeout(function () {
                                map.fitBounds(theBounds);
                                // Don't zoom beyond the max zoom level
                                if (mz != null && map.getZoom() > mz) {
                                    map.setZoom(mz + 1);
                                }
                            }, 100);
                        }
                        // Prevent event propagation to the map:
                        e.cancelBubble = true;
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
                    }
                });
                google.maps.event.addDomListener(this._div, "mouseover", function () {
                    var mc = _this2.cluster.markerCluster;
                    /**
                     * This event is fired when the mouse moves over a cluster marker.
                     * @name MarkerClusterer#mouseover
                     * @param {Cluster} c The cluster that the mouse moved over.
                     * @event
                     */
                    google.maps.event.trigger(mc, "mouseover", _this2.cluster);
                });
                google.maps.event.addDomListener(this._div, "mouseout", function () {
                    var mc = _this2.cluster.markerCluster;
                    /**
                     * This event is fired when the mouse moves out of a cluster marker.
                     * @name MarkerClusterer#mouseout
                     * @param {Cluster} c The cluster that the mouse moved out of.
                     * @event
                     */
                    google.maps.event.trigger(mc, "mouseout", _this2.cluster);
                });
                this._stopEventPropagation();
            }
        }, {
            key: 'onRemove',
            value: function onRemove() {
                if (this._div && this._div.parentNode) {
                    this.hide();
                    google.maps.event.removeListener(this._boundsChangedListener);
                    google.maps.event.clearInstanceListeners(this._div);
                    this._unbindEventPropagationEvents();
                    this._div.parentNode.removeChild(this._div);
                    this._div = void 0;
                }
            }
        }, {
            key: 'draw',
            value: function draw() {
                if (this._visible) {
                    var pos = this._getPosFromLatLng(this._center);
                    this._div.style.top = pos.y + "px";
                    this._div.style.left = pos.x + "px";
                }
            }
        }, {
            key: 'hide',
            value: function hide() {
                if (this._div) {
                    this._div.style.display = "none";
                }
                this._visible = false;
            }
        }, {
            key: 'show',
            value: function show() {
                if (this._div) {
                    var img = "";
                    // NOTE: values must be specified in px units
                    var bp = this._backgroundPosition.split(" ");
                    var spriteH = parseInt(bp[0].replace(/^\s+|\s+$/g, ""), 10);
                    var spriteV = parseInt(bp[1].replace(/^\s+|\s+$/g, ""), 10);
                    var pos = this._getPosFromLatLng(this._center);
                    this._div.style.cssText = this.createCss(pos);
                    img = "<img src='" + this._url + "' style='position: absolute; top: " + spriteV + "px; left: " + spriteH + "px; ";
                    if (!this.cluster.markerCluster.enableRetinaIcons) {
                        img += "clip: rect(" + -1 * spriteV + "px, " + (-1 * spriteH + this._width) + "px, " + (-1 * spriteV + this._height) + "px, " + -1 * spriteH + "px);";
                    }
                    img += "'>";
                    this._div.innerHTML = img + "<div style='" + "position: absolute;" + "top: " + this._anchorText[0] + "px;" + "left: " + this._anchorText[1] + "px;" + "color: " + this._textColor + ";" + "font-size: " + this._textSize + "px;" + "font-family: " + this._fontFamily + ";" + "font-weight: " + this._fontWeight + ";" + "font-style: " + this._fontStyle + ";" + "text-decoration: " + this._textDecoration + ";" + "text-align: center;" + "width: " + this._width + "px;" + "line-height:" + this._height + "px;" + "'>" + this._sums.text + "</div>";
                    if (typeof this._sums.title === "undefined" || this._sums.title === "") {
                        this._div.title = this.cluster.markerCluster.title || '';
                    } else {
                        this._div.title = this._sums.title;
                    }
                    this._div.style.display = "";
                }
                this._visible = true;
            }
        }, {
            key: 'useStyle',
            value: function useStyle(sums) {
                this._sums = sums;
                var index = Math.max(0, sums.index - 1);
                index = Math.min(this.styles.length - 1, index);
                var style = this.styles[index];
                this._url = style.url;
                this._height = style.height;
                this._width = style.width;
                this._anchorText = style.anchorText || [0, 0];
                this._anchorIcon = style.anchorIcon || [parseInt(this._height / 2, 10), parseInt(this._width / 2, 10)];
                this._textColor = style.textColor || "black";
                this._textSize = style.textSize || 11;
                this._textDecoration = style.textDecoration || "none";
                this._fontWeight = style.fontWeight || "bold";
                this._fontStyle = style.fontStyle || "normal";
                this._fontFamily = style.fontFamily || "Arial,sans-serif";
                this._backgroundPosition = style.backgroundPosition || "0 0";
            }
        }, {
            key: 'setCenter',
            value: function setCenter(center) {
                this._center = center;
            }
        }, {
            key: 'createCss',
            value: function createCss(pos) {
                var style = [];
                style.push("cursor: pointer;");
                style.push("position: absolute; top: " + pos.y + "px; left: " + pos.x + "px;");
                style.push("width: " + this._width + "px; height: " + this._height + "px;");
                return style.join("");
            }
        }, {
            key: '_getPosFromLatLng',
            value: function _getPosFromLatLng(latlng) {
                var pos = this.getProjection().fromLatLngToDivPixel(latlng);
                pos.x -= this._anchorIcon[1];
                pos.y -= this._anchorIcon[0];
                pos.x = parseInt(pos.x, 10);
                pos.y = parseInt(pos.y, 10);
                return pos;
            }
        }, {
            key: '_stopEventPropagation',
            value: function _stopEventPropagation() {
                var _this3 = this;

                var anchor = this._div;
                //anchor.style.cursor = 'auto';
                this.eventPrevents.forEach(function (event) {
                    anchor.addEventListener(event, _this3._handleStopEventPropagation);
                });
            }
        }, {
            key: '_handleStopEventPropagation',
            value: function _handleStopEventPropagation(e) {
                e.stopPropagation();
            }
        }, {
            key: '_unbindEventPropagationEvents',
            value: function _unbindEventPropagationEvents() {
                var _this4 = this;

                var anchor = this._div;
                //anchor.style.cursor = 'auto';
                this.eventPrevents.forEach(function (event) {
                    anchor.removeEventListener(event, _this4._handleStopEventPropagation);
                });
            }
        }, {
            key: 'el',
            get: function get$$1() {
                return this._div;
            }
        }]);
        return ClusterIconImpl;
    }(google.maps.OverlayView);
}

// We wanna cache the resolved ClusterIcon
var ClusterIconConstructor;

var Cluster = function () {
    function Cluster(markerClusterer, CustomClusterIcon) {
        classCallCheck(this, Cluster);

        this._markers = [];
        if (!ClusterIconConstructor) ClusterIconConstructor = clusterIconFactory();
        this._markerClusterer = markerClusterer;
        this._clusterIcon = new (CustomClusterIcon || ClusterIconConstructor)(this, markerClusterer.styles);
        this._map = markerClusterer.getMap();
        this._gridSize = markerClusterer.gridSize;
        this._minClusterSize = markerClusterer.minClusterSize;
        this._averageCenter = markerClusterer.avarageCenter;
        this._markers = [];
        this._center = void 0;
        this._bounds = void 0;
    }

    createClass(Cluster, [{
        key: 'getBounds',
        value: function getBounds() {
            var bounds = new google.maps.LatLngBounds(this.center, this.center);
            for (var i = 0, ii = this.size; i < ii; i++) {
                bounds.extend(this.markers[i].getPosition());
            }
            return bounds;
        }
        //#endregion

    }, {
        key: 'remove',
        value: function remove() {
            this._clusterIcon.setMap(null);
            this._markers = [];
            delete this._markers;
        }
    }, {
        key: 'addMarker',
        value: function addMarker(marker) {
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
            marker.isAdded = true;
            this._markers.push(marker);
            mCount = this._markers.length;
            mz = this._markerClusterer.maxZoom;
            if (mz != null && this._map.getZoom() > mz) {
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
    }, {
        key: 'isMarkerInClusterBounds',
        value: function isMarkerInClusterBounds(marker) {
            return this._bounds.contains(marker.getPosition());
        }
    }, {
        key: '_calculateBounds',
        value: function _calculateBounds() {
            var bounds = new google.maps.LatLngBounds(this.center, this.center);
            this._bounds = this._markerClusterer.getExtendedBounds(bounds);
        }
    }, {
        key: '_updateIcon',
        value: function _updateIcon() {
            var mCount = this.markers.length;
            var mz = this._markerClusterer.maxZoom;
            if (mz != null && this._map.getZoom() > mz) {
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
    }, {
        key: '_isMarkerAlreadyAdded',
        value: function _isMarkerAlreadyAdded(marker) {
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
    }, {
        key: 'size',
        get: function get$$1() {
            return this._markers.length;
        }
    }, {
        key: 'markers',
        get: function get$$1() {
            return this._markers;
        }
    }, {
        key: 'markerCluster',
        get: function get$$1() {
            return this._markerClusterer;
        }
    }]);
    return Cluster;
}();

function markerClustererFactory() {
    var MarkerClustererImpl = function (_google$maps$OverlayV) {
        inherits(MarkerClustererImpl, _google$maps$OverlayV);

        //#endregion
        function MarkerClustererImpl(map) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            classCallCheck(this, MarkerClustererImpl);

            var _this = possibleConstructorReturn(this, (MarkerClustererImpl.__proto__ || Object.getPrototypeOf(MarkerClustererImpl)).call(this));

            _this._clusters = [];
            _this._markers = [];
            _this._ready = false;
            Object.assign(_this, {
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
                _this.batchSize = _this.batchSizeIE;
            }
            _this._setupStyles();
            _this.setMap(map);
            return _this;
        }

        createClass(MarkerClustererImpl, [{
            key: 'addMarker',

            /**
             * Add a marker to the clusterer
             *
             * @param {MarkerLike} marker
             * @param {boolean} [redraw=true]
             * @memberof MarkerClustererImpl
             */
            value: function addMarker(marker) {
                var redraw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                this._pushMarkerTo(marker);
                if (redraw) this._redraw();
            }
            /**
             * Added a list of markers to the clusterer
             *
             * @param {MarkerLike[]} markers
             * @param {boolean} [redraw=true]
             * @memberof MarkerClustererImpl
             */

        }, {
            key: 'addMarkers',
            value: function addMarkers(markers) {
                var redraw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                for (var i = 0, ii = markers.length; i < ii; i++) {
                    this._pushMarkerTo(markers[i]);
                }if (redraw) this._redraw();
            }
            /**
             * Remove a marker from
             *
             * @param {MarkerLike} marker
             * @param {boolean} [redraw=true]
             * @returns
             * @memberof MarkerClustererImpl
             */

        }, {
            key: 'removeMarker',
            value: function removeMarker(marker) {
                var redraw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                var removed = this._removeMarker(marker);
                if (!redraw && removed) {
                    this.repaint();
                }
                return removed;
            }
            /**
             * Remove a list of markers
             *
             * @param {MarkerLike[]} markers
             * @param {boolean} [redraw=true]
             * @returns
             * @memberof MarkerClustererImpl
             */

        }, {
            key: 'removeMarkers',
            value: function removeMarkers(markers) {
                var redraw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

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
        }, {
            key: 'clearMarkers',
            value: function clearMarkers() {
                this._resetViewport(true);
                this._markers = [];
            }
        }, {
            key: 'repaint',
            value: function repaint() {
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
        }, {
            key: 'getExtendedBounds',
            value: function getExtendedBounds(bounds) {
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
        }, {
            key: 'fitMapToMarkers',
            value: function fitMapToMarkers() {
                var i;
                var markers = this.markers;
                var bounds = new google.maps.LatLngBounds();
                for (i = 0; i < markers.length; i++) {
                    bounds.extend(markers[i].getPosition());
                }
                this.getMap().fitBounds(bounds);
            }
            //#region Overlay Lifecircle

        }, {
            key: 'onAdd',
            value: function onAdd() {
                var _this2 = this;

                this._ready = true;
                this._listeners = [google.maps.event.addListener(this.getMap(), 'zoom_changed', function () {
                    _this2._resetViewport(false);
                    // Workaround for this Google bug: when map is at level 0 and "-" of
                    // zoom slider is clicked, a "zoom_changed" event is fired even though
                    // the map doesn't zoom out any further. In this situation, no "idle"
                    // event is triggered so the cluster markers that have been removed
                    // do not get redrawn. Same goes for a zoom in at maxZoom.
                    var map = _this2.getMap();
                    if (map.getZoom() === (map.get("minZoom") || 0) || map.getZoom() === map.get("maxZoom")) {
                        google.maps.event.trigger(_this2, "idle");
                    }
                }), google.maps.event.addListener(this.getMap(), 'idle', function () {
                    _this2._redraw();
                })];
            }
        }, {
            key: 'onRemove',
            value: function onRemove() {
                var i = 0,
                    ii = 0,
                    map = this.getMap();
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
        }, {
            key: 'draw',
            value: function draw() {}
            //#endregion

        }, {
            key: '_pushMarkerTo',
            value: function _pushMarkerTo(marker) {
                var _this3 = this;

                // If the marker is draggable add a listener so we can update the clusters on the dragend:
                if (marker.getDraggable()) {
                    google.maps.event.addListener(marker, "dragend", function () {
                        if (_this3._ready) {
                            marker.isAdded = false;
                            _this3.repaint();
                        }
                    });
                }
                marker.isAdded = false;
                this._markers.push(marker);
            }
        }, {
            key: '_redraw',
            value: function _redraw() {
                this._createClusters(0);
            }
        }, {
            key: '_resetViewport',
            value: function _resetViewport(hide) {
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
        }, {
            key: '_distanceBetweenPoints',
            value: function _distanceBetweenPoints(p1, p2) {
                var R = 6371; // Radius of the Earth in km
                var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
                var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                return d;
            }
        }, {
            key: '_isMarkerInBounds',
            value: function _isMarkerInBounds(marker, bounds) {
                return bounds.contains(marker.getPosition());
            }
        }, {
            key: '_addToClosestCluster',
            value: function _addToClosestCluster(marker) {
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
                } else {
                    cluster = new Cluster(this, this.ClusterIcon);
                    cluster.addMarker(marker);
                    this._clusters.push(cluster);
                }
            }
        }, {
            key: '_createClusters',
            value: function _createClusters(firstIndex) {
                var _this4 = this;

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
                var map = this.getMap();
                // Get our current map view bounds.
                // Create a new bounds object so we don't affect the map.
                //
                // See Comments 9 & 11 on Issue 3651 relating to this workaround for a Google Maps bug:
                if (map.getZoom() > 3) {
                    mapBounds = new google.maps.LatLngBounds(map.getBounds().getSouthWest(), map.getBounds().getNorthEast());
                } else {
                    mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(85.02070771743472, -178.48388434375), new google.maps.LatLng(-85.08136444384544, 178.00048865625));
                }
                var bounds = this.getExtendedBounds(mapBounds);
                var iLast = Math.min(firstIndex + this.batchSize, this.markers.length);
                for (i = firstIndex; i < iLast; i++) {
                    marker = this.markers[i];
                    if (!marker.isAdded && this._isMarkerInBounds(marker, bounds)) {
                        if (!this.ignoreHidden || this.ignoreHidden && marker.getVisible()) {
                            this._addToClosestCluster(marker);
                        }
                    }
                }
                if (iLast < this.markers.length) {
                    this._timerRefStatic = setTimeout(function () {
                        _this4._createClusters(iLast);
                    }, 0);
                } else {
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
        }, {
            key: '_removeMarker',
            value: function _removeMarker(marker) {
                var i;
                var index = -1;
                if (this._markers.indexOf) {
                    index = this._markers.indexOf(marker);
                } else {
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
        }, {
            key: '_setupStyles',
            value: function _setupStyles() {
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
        }, {
            key: 'markers',
            get: function get$$1() {
                return this._markers;
            }
        }]);
        return MarkerClustererImpl;
    }(google.maps.OverlayView);

    var Calculator = function Calculator(markers, numStyles) {
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

var marker_size = function marker_size(marker) {
    return 50;
};
// We need to wrap the class definition in a function,
// because google.maps is loaded asyncronly, so it is 
// imposible to subclass or use any google maps spcific types!
function popupWindowFactory() {
    /* Custom infowindow */
    return function (_google$maps$OverlayV) {
        inherits(PopupWindow, _google$maps$OverlayV);

        function PopupWindow(options) {
            classCallCheck(this, PopupWindow);

            var _this = possibleConstructorReturn(this, (PopupWindow.__proto__ || Object.getPrototypeOf(PopupWindow)).call(this));

            _this.options = options;
            if (!options.edgeOffset) options.edgeOffset = { top: 40, bottom: 20, left: 20, right: 20 };
            options.closeOnClickOutside = typeof options.closeOnClickOutside === 'boolean' ? options.closeOnClickOutside : true;
            var pixelOffset = document.createElement('div');
            pixelOffset.classList.add('popup-bubble-anchor');
            _this._container = pixelOffset;
            _this._anchor = document.createElement('div');
            _this._anchor.classList.add('popup-tip-anchor');
            if (_this.options.className) _this._anchor.classList.add(_this.options.className);
            // Fyha
            _this._anchor.style.position = 'absolute';
            _this._anchor.appendChild(pixelOffset);
            // Optionally stop clicks, etc., from bubbling up to the map.
            if (options.preventEventPropagation === true) _this._stopEventPropagation();
            return _this;
        }

        createClass(PopupWindow, [{
            key: 'setContent',
            value: function setContent(content) {
                if (typeof content === 'string') {
                    this._content = document.createElement('div');
                    this._content.innerHTML = content;
                } else if (content && content instanceof Element) {
                    this._content = content;
                }
                this._content.classList.add('popup-bubble-content');
                this._container.innerHTML = '';
                this._container.appendChild(this._content);
                return this;
            }
            /**
             * Open the popupwindow and pan the map, so it's fully in view.
             *
             * @param {google.maps.Map} map
             * @param {MarkerLike} marker
             */

        }, {
            key: 'open',
            value: function open(map, marker) {
                var _this2 = this;

                this._marker = marker;
                this.setMap(map);
                this._listener = map.addListener('click', function () {
                    _this2.close();
                });
                this._reposition(true);
                google.maps.event.trigger(this, 'open', this);
                return this;
            }
            /**
             * Close the popup window
             *
             * @returns
             */

        }, {
            key: 'close',
            value: function close() {
                if (!this._anchor.parentElement) return this;
                this.setMap(null);
                google.maps.event.trigger(this, 'close', this);
                return this;
            }
            //#region google.maps.OverLayView life-circle

        }, {
            key: 'onAdd',
            value: function onAdd() {
                this.getPanes().floatPane.appendChild(this._anchor);
            }
        }, {
            key: 'onRemove',
            value: function onRemove() {
                if (this._anchor.parentElement) this._anchor.parentElement.removeChild(this._anchor);
                if (this._listener) {
                    google.maps.event.removeListener(this._listener);
                    this._listener = void 0;
                }
                this._marker = void 0;
            }
        }, {
            key: 'draw',
            value: function draw() {
                var projection = this.getProjection();
                if (!projection) {
                    return;
                }
                var divPosition = projection.fromLatLngToDivPixel(this._marker.getPosition());
                // Hide the popup when it is far out of view.
                var display = Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';
                if (display === 'block') {
                    this._reposition();
                }
                if (this._anchor.style.display !== display) {
                    this._anchor.style.display = display;
                }
            }
            //#endregion
            /**
             * Position the window so it's just above the marker
             *
             * @param {boolean} [panToWindow=false]
             */

        }, {
            key: '_reposition',
            value: function _reposition() {
                var _this3 = this;

                var panToWindow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                var divPosition = this.getProjection().fromLatLngToDivPixel(this._marker.getPosition());
                // Middle
                this._anchor.style.left = divPosition.x - this._anchor.clientWidth / 2 + 'px';
                // The home card should be place above the top of the marker
                this._anchor.style.top = divPosition.y - this._anchor.clientHeight - marker_size(this._marker) + 'px';
                if (panToWindow) {
                    requestAnimationFrame(function () {
                        return _this3._panMap();
                    });
                }
            }
            /**
             * Pan the map so the PopupWindow is just inside view
             *
             * @private
             */

        }, {
            key: '_panMap',
            value: function _panMap() {
                // we'll pan the map just enough so the popup is just inside viewport respecting 
                // edgeOffset
                var mib = this._getMapInnerBounds(),
                    wb = this._anchor.getBoundingClientRect();
                var dx = 0,
                    dy = 0;
                if (mib.left >= wb.left) {
                    dx = wb.left - mib.left;
                } else if (mib.right <= wb.right) {
                    dx = wb.left - (mib.right - wb.width);
                }
                if (mib.top >= wb.top) {
                    dy = wb.top - mib.top;
                } else if (mib.bottom <= wb.bottom) {
                    dy = wb.top - (mib.bottom - wb.height);
                }
                if (dx !== 0 || dy !== 0) {
                    this.getMap().panBy(dx, dy);
                }
            }
        }, {
            key: '_getMapInnerBounds',
            value: function _getMapInnerBounds() {
                var mb = this.getMap().getDiv().getBoundingClientRect(),
                    mib = {
                    top: mb.top + this.options.edgeOffset.top,
                    right: mb.right - this.options.edgeOffset.right,
                    bottom: mb.bottom - this.options.edgeOffset.bottom,
                    left: mb.left + this.options.edgeOffset.left,
                    width: 0,
                    height: 0
                };
                mib.width = mib.right - mib.left;
                mib.height = mib.bottom - mib.top;
                return mib;
            }
            /** Stops clicks/drags from bubbling up to the map. */

        }, {
            key: '_stopEventPropagation',
            value: function _stopEventPropagation() {
                var anchor = this._anchor;
                anchor.style.cursor = 'auto';
                ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart', 'pointerdown'].forEach(function (event) {
                    anchor.addEventListener(event, function (e) {
                        e.stopPropagation();
                    });
                });
            }
        }, {
            key: 'container',
            get: function get$$1() {
                return this._container;
            }
        }]);
        return PopupWindow;
    }(google.maps.OverlayView);
}

exports.markerClustererFactory = markerClustererFactory;
exports.Cluster = Cluster;
exports.clusterIconFactory = clusterIconFactory;
exports.popupWindowFactory = popupWindowFactory;

Object.defineProperty(exports, '__esModule', { value: true });

})));
