import { MarkerLike } from './types';

const marker_size = (marker: MarkerLike) => 50

export interface Offset {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

/**
 * PopupWindow options
 * 
 * @export
 * @interface PopupWindowOptions
 */
export interface PopupWindowOptions {
    /**
     * Prevent event to bubble up the map
     * 
     * @type {boolean}
     * @memberof PopupWindowOptions
     */
    preventEventPropagation?: boolean;
    /**
     * Padding
     * 
     * @type {Offset}
     * @memberof PopupWindowOptions
     */
    edgeOffset?: Offset;
    /**
     * Should the popupwindow close, when clicking outside off the window
     * 
     * @type {boolean}
     * @memberof PopupWindowOptions
     */
    closeOnClickOutside?: boolean;
    /**
     * Optional class name to give the popup window
     * 
     * @type {string}
     * @memberof PopupWindowOptions
     */
    className?: string;

    markerOffset?: number;
}

export interface PopupWindow extends google.maps.OverlayView {
    readonly container: HTMLDivElement;
    setContent(content: string | Element): this;
    open(map: google.maps.Map, marker: MarkerLike): this;
    close(): this;
}

export type PopupWindowConstructor = new (options: PopupWindowOptions) => PopupWindow

// We need to wrap the class definition in a function,
// because google.maps is loaded asyncronly, so it is 
// imposible to subclass or use any google maps spcific types!
export function popupWindowFactory(): PopupWindowConstructor {



    /* Custom infowindow */
    return class PopupWindow extends google.maps.OverlayView {

        private _marker: MarkerLike | undefined;
        private _content: Element;
        private _anchor: HTMLDivElement;
        private _container: HTMLDivElement;

        private _listener: google.maps.MapsEventListener | undefined;

        get container() { return this._container; }

        constructor(private options: PopupWindowOptions) {
            super();
            if (!options.edgeOffset)
                options.edgeOffset = { top: 40, bottom: 20, left: 20, right: 20 };
            options.closeOnClickOutside = typeof options.closeOnClickOutside === 'boolean' ? options.closeOnClickOutside : true

            let pixelOffset = document.createElement('div');
            pixelOffset.classList.add('popup-bubble-anchor');


            this._container = pixelOffset;

            this._anchor = document.createElement('div');
            this._anchor.classList.add('popup-tip-anchor');

            if (this.options.className)
                this._anchor.classList.add(this.options.className);

            // Fyha

            this._anchor.style.position = 'absolute';

            this._anchor.appendChild(pixelOffset);

            // Optionally stop clicks, etc., from bubbling up to the map.
            if (options.preventEventPropagation === true)
                this._stopEventPropagation();

        }

        setContent(content: string | Element) {
            if (typeof content === 'string') {
                this._content = document.createElement('div');
                this._content.innerHTML = content;
            } else if (content && content instanceof Element) {
                this._content = content
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
        open(map: google.maps.Map, marker: MarkerLike) {

            this._marker = marker;
            this.setMap(map);

            this._listener = map.addListener('click', () => {
                this.close();
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
        close() {
            if (!this._anchor.parentElement) return this;
            this.setMap(null);

            google.maps.event.trigger(this, 'close', this);

            return this;
        }


        //#region google.maps.OverLayView life-circle

        onAdd() {
            this.getPanes().floatPane.appendChild(this._anchor);
        }

        onRemove() {
            if (this._anchor.parentElement)
                this._anchor.parentElement.removeChild(this._anchor);
            if (this._listener) {
                google.maps.event.removeListener(this._listener)
                this._listener = void 0;
            }
            this._marker = void 0;
        }

        draw() {

            const projection = this.getProjection();
            if (!projection) {
                return;
            }

            var divPosition = projection.fromLatLngToDivPixel(this._marker!.getPosition());
            // Hide the popup when it is far out of view.
            var display =
                Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
                    'block' :
                    'none';

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
        private _reposition(panToWindow: boolean = false) {

            const projection = this.getProjection();

            if (projection) {
                const divPosition = projection.fromLatLngToDivPixel(this._marker!.getPosition());
                // Middle
                this._anchor.style.left = divPosition.x - (this._anchor.clientWidth / 2) + 'px';
                // The home card should be place above the top of the marker
                this._anchor.style.top = (divPosition.y - this._anchor.clientHeight - (this.options.markerOffset || 50)) + 'px';
            }

            if (panToWindow) {
                requestAnimationFrame(() => this._panMap());
            }

        }

        /**
         * Pan the map so the PopupWindow is just inside view
         * 
         * @private
         */
        private _panMap() {
            // we'll pan the map just enough so the popup is just inside viewport respecting 
            // edgeOffset
            const mib = this._getMapInnerBounds(),
                wb = this._anchor.getBoundingClientRect();

            let dx = 0,
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
                (this.getMap() as google.maps.Map).panBy(dx, dy);
            }
        }

        private _getMapInnerBounds() {
            const mb = (this.getMap() as google.maps.Map).getDiv().getBoundingClientRect(),
                mib = {
                    top: mb.top + this.options.edgeOffset!.top,
                    right: mb.right - this.options.edgeOffset!.right,
                    bottom: mb.bottom - this.options.edgeOffset!.bottom,
                    left: mb.left + this.options.edgeOffset!.left,
                    width: 0,
                    height: 0
                };
            mib.width = mib.right - mib.left;
            mib.height = mib.bottom - mib.top;
            return mib;
        }

        /** Stops clicks/drags from bubbling up to the map. */
        private _stopEventPropagation() {
            const anchor = this._anchor;
            anchor.style.cursor = 'auto';

            ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
                'pointerdown']
                .forEach(function (event) {
                    anchor.addEventListener(event, function (e: any) {
                        e.stopPropagation();
                    });
                });
        };
    }
}