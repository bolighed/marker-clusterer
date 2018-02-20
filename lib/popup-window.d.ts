/// <reference types="googlemaps" />
export interface Offset {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
export interface PopupWindowOptions {
    preventEventPropagation?: boolean;
    edgeOffset?: Offset;
    closeOnClickOutside?: boolean;
    className?: string;
}
export interface PopupWindow extends google.maps.OverlayView {
    readonly container: HTMLDivElement;
    setContent(content: string | Element): this;
    open(map: google.maps.Map, marker: google.maps.Marker): this;
    close(): this;
}
export declare type PopupWindowConstructor = new (options: PopupWindowOptions) => PopupWindow;
export declare function popupWindowFactory(): PopupWindowConstructor;
