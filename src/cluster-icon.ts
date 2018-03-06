import { Cluster } from './cluster';

export interface ClusterIconInfo {
    index: number;
    title: string;
    text: string;
}

export interface IClusterIcon extends google.maps.OverlayView {
    hide(): any;
    show(): any;
    setCenter(lnglat: google.maps.LatLng): any;
    useStyle(a: ClusterIconInfo): any;
    readonly el: HTMLElement |  undefined;
}

export type ClusterIconCtor = new (cluster: Cluster, styles: any) => IClusterIcon;

export function clusterIconFactory(): ClusterIconCtor {
    return class ClusterIconImpl extends google.maps.OverlayView {


        protected eventPrevents: string[] = ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
            'pointerdown'];

        //private _map: google.maps.Map;
        private _div: HTMLDivElement | undefined;
        private _visible: boolean;
        private _className: string | undefined;
        private _center: google.maps.LatLng;
        private _boundsChangedListener: google.maps.MapsEventListener;
        private _sums: ClusterIconInfo;

        private _url: string;
        private _height: number;
        private _width: number;
        private _anchorText: [number, number];
        private _anchorIcon: [number, number];
        private _textColor: string;
        private _textSize: number;
        private _textDecoration: string;
        private _fontWeight: string;
        private _fontStyle: string;
        private _fontFamily: string;
        private _backgroundPosition: string;

        get el(): HTMLDivElement | undefined {
            return this._div;
        }


        constructor(public cluster: Cluster, public styles: any) {
            super();

            this._className = cluster.markerCluster.clusterClass;

            this.setMap(cluster.markerCluster.getMap());
        }


        //get map() { return this._map; }
        //set map(map: google.maps.Map) { this._map = map; }



        onAdd() {
            var cMouseDownInCluster: boolean;
            var cDraggingMapByCluster: boolean;

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

            google.maps.event.addDomListener(this._div, "click", (e: any) => {
                cMouseDownInCluster = false;
                if (!cDraggingMapByCluster) {
                    var theBounds: google.maps.LatLngBounds;
                    var mz: number | undefined;
                    var mc = this.cluster.markerCluster;
                    /**
                     * This event is fired when a cluster marker is clicked.
                     * @name MarkerClusterer#click
                     * @param {Cluster} c The cluster that was clicked.
                     * @event
                     */
                    google.maps.event.trigger(mc, "click", this.cluster);
                    google.maps.event.trigger(mc, "clusterclick", this.cluster); // deprecated name

                    // The default click handler follows. Disable it by setting
                    // the zoomOnClick property to false.
                    if (mc.zoomOnClick) {
                        // Zoom into the cluster.
                        mz = mc.maxZoom;
                        theBounds = this.cluster.getBounds();

                        var map = mc.getMap() as google.maps.Map;

                        map.fitBounds(theBounds);
                        // There is a fix for Issue 170 here:
                        setTimeout(function () {
                            map.fitBounds(theBounds);
                            // Don't zoom beyond the max zoom level
                            if (mz != null && (map.getZoom() > mz)) {
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

            google.maps.event.addDomListener(this._div, "mouseover", () => {
                var mc = this.cluster.markerCluster;
                /**
                 * This event is fired when the mouse moves over a cluster marker.
                 * @name MarkerClusterer#mouseover
                 * @param {Cluster} c The cluster that the mouse moved over.
                 * @event
                 */
                google.maps.event.trigger(mc, "mouseover", this.cluster);
            });

            google.maps.event.addDomListener(this._div, "mouseout", () => {
                var mc = this.cluster.markerCluster;
                /**
                 * This event is fired when the mouse moves out of a cluster marker.
                 * @name MarkerClusterer#mouseout
                 * @param {Cluster} c The cluster that the mouse moved out of.
                 * @event
                 */
                google.maps.event.trigger(mc, "mouseout", this.cluster);
            });

            this._stopEventPropagation();
        }

        onRemove() {
            if (this._div && this._div.parentNode) {
                this.hide();
                google.maps.event.removeListener(this._boundsChangedListener);
                google.maps.event.clearInstanceListeners(this._div);
                this._unbindEventPropagationEvents();
                this._div.parentNode.removeChild(this._div);
                this._div = void 0;
            }
        }


        draw() {
            if (this._visible) {
                var pos = this._getPosFromLatLng(this._center);
                this._div!.style.top = pos.y + "px";
                this._div!.style.left = pos.x + "px";
            }
        }


        hide() {
            if (this._div) {
                this._div.style.display = "none";
            }
            this._visible = false;
        }

        show() {
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
                    img += "clip: rect(" + (-1 * spriteV) + "px, " + ((-1 * spriteH) + this._width) + "px, " +
                        ((-1 * spriteV) + this._height) + "px, " + (-1 * spriteH) + "px);";
                }
                img += "'>";
                this._div.innerHTML = img + "<div style='" +
                    "position: absolute;" +
                    "top: " + this._anchorText[0] + "px;" +
                    "left: " + this._anchorText[1] + "px;" +
                    "color: " + this._textColor + ";" +
                    "font-size: " + this._textSize + "px;" +
                    "font-family: " + this._fontFamily + ";" +
                    "font-weight: " + this._fontWeight + ";" +
                    "font-style: " + this._fontStyle + ";" +
                    "text-decoration: " + this._textDecoration + ";" +
                    "text-align: center;" +
                    "width: " + this._width + "px;" +
                    "line-height:" + this._height + "px;" +
                    "'>" + this._sums.text + "</div>";
                if (typeof this._sums.title === "undefined" || this._sums.title === "") {
                    this._div.title = this.cluster.markerCluster.title || '';
                } else {
                    this._div.title = this._sums.title;
                }
                this._div.style.display = "";
            }
            this._visible = true;
        }

        useStyle(sums: ClusterIconInfo) {
            this._sums = sums;
            var index = Math.max(0, sums.index - 1);
            index = Math.min(this.styles.length - 1, index);
            var style = this.styles[index];
            this._url = style.url;
            this._height = style.height;
            this._width = style.width;
            this._anchorText = style.anchorText || [0, 0];
            this._anchorIcon = style.anchorIcon || [parseInt((this._height / 2) as any, 10), parseInt((this._width / 2) as any, 10)];
            this._textColor = style.textColor || "black";
            this._textSize = style.textSize || 11;
            this._textDecoration = style.textDecoration || "none";
            this._fontWeight = style.fontWeight || "bold";
            this._fontStyle = style.fontStyle || "normal";
            this._fontFamily = style.fontFamily || "Arial,sans-serif";
            this._backgroundPosition = style.backgroundPosition || "0 0";
        }

        setCenter(center: google.maps.LatLng) {
            this._center = center;
        }

        createCss(pos: google.maps.Point) {
            var style = [];
            style.push("cursor: pointer;");
            style.push("position: absolute; top: " + pos.y + "px; left: " + pos.x + "px;");
            style.push("width: " + this._width + "px; height: " + this._height + "px;");
            return style.join("");
        }

        private _getPosFromLatLng(latlng: google.maps.LatLng) {
            var pos = this.getProjection().fromLatLngToDivPixel(latlng);
            pos.x -= this._anchorIcon[1];
            pos.y -= this._anchorIcon[0];
            pos.x = parseInt(pos.x as any, 10);
            pos.y = parseInt(pos.y as any, 10);
            return pos;
        }

        private _stopEventPropagation() {
            const anchor = this._div!;
            //anchor.style.cursor = 'auto';

            this.eventPrevents
                .forEach((event) => {
                    anchor.addEventListener(event, this._handleStopEventPropagation);
                });
        };

        private _handleStopEventPropagation(e: Event) {
            e.stopPropagation();
        }

        private _unbindEventPropagationEvents() {
            const anchor = this._div!;
            //anchor.style.cursor = 'auto';

            this.eventPrevents
                .forEach((event) => {
                    anchor.removeEventListener(event, this._handleStopEventPropagation);
                });
        }


    }
}