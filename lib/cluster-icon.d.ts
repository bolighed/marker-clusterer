/// <reference types="googlemaps" />
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
}
export declare type ClusterIconCtor = new (cluster: Cluster, styles: any) => IClusterIcon;
export declare function clusterIconFactory(): ClusterIconCtor;
