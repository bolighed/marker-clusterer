/// <reference types="googlemaps" />
import { MarkerLike } from './types';
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
}
export interface PopupWindow extends google.maps.OverlayView {
    readonly container: HTMLDivElement;
    setContent(content: string | Element): this;
    open(map: google.maps.Map, marker: MarkerLike): this;
    close(): this;
}
export declare type PopupWindowConstructor = new (options: PopupWindowOptions) => PopupWindow;
export declare function popupWindowFactory(): PopupWindowConstructor;
