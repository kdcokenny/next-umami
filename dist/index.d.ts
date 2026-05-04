import { ScriptProps } from 'next/script';
import React, { ReactNode } from 'react';
import { NextConfig } from 'next';

type UmamiEventDataValue = string | number | boolean | null | undefined | UmamiEventDataValue[] | {
    [key: string]: UmamiEventDataValue;
};
type UmamiEventData = {
    [key: string]: UmamiEventDataValue;
};
type UmamiPayload = {
    [key: string]: UmamiEventDataValue;
};
type UmamiBeforeSend = (type: string, payload: UmamiPayload) => UmamiPayload | false | null | undefined;
interface PageView {
    hostname: string;
    language: string;
    referrer: string;
    screen: string;
    title: string;
    url: string;
    website: string;
}
type UmamiTrackPayload = Partial<PageView> | UmamiEventData;
type UmamiTrackOptions = {
    [key: string]: UmamiEventDataValue;
};
type UmamiTrackArguments = [] | [payload: UmamiTrackPayload] | [payload: UmamiTrackPayload, options: UmamiTrackOptions] | [eventName: string] | [eventName: string, eventData: UmamiEventData] | [eventName: string, eventData: UmamiEventData, options: UmamiTrackOptions];
type UmamiIdentifyArguments = [id: string] | [data: UmamiEventData] | [id: string, data: UmamiEventData];
interface UmamiProps extends Pick<ScriptProps, 'onLoad' | 'onReady' | 'onError'> {
    /**
     * The source of the script. Defaults to version hosted by Umami.
     */
    src?: string;
    /**
     * Website ID found in Umami dashboard. https://umami.is/docs/collect-data
     */
    websiteId: string;
    /**
     * By default, Umami will send data to wherever the script is located. You can override this to send data to another location.
     */
    hostUrl?: string;
    /**
     * By default, Umami tracks all pageviews and events for you automatically. You can disable this behavior and track events yourself using the tracker functions.
     */
    autoTrack?: boolean;
    /**
     * If you want the tracker to only run on specific domains, you can add them to your tracker script. This is a comma delimited list of domain names. Helps if you are working in a staging/development environment.
     */
    domains?: string | string[];
    /**
     * Name of a global before-send function or a callback to register for request modification/cancellation.
     */
    beforeSend?: string | UmamiBeforeSend;
    /**
     * Enables Umami performance tracking when set to true.
     */
    performance?: boolean;
    children?: ReactNode;
}
type NextUmamiProxyOptions = {
    /**
     * The path to the script. This can be any path. Defaults to '/script.js'.
     */
    clientScriptPath?: string;
    /**
     * The location of the script you'd like to pull. Defaults to 'https://cloud.umami.is/script.js'.
     */
    serverScriptDestination?: string;
    /**
     * The path to the API. Defaults to '/'. This can be any path but this will ALWAYS end with '/api/send' due to a restriction in the Umami script.
     */
    clientApiPath?: string;
    /**
     * The location of the API you'd like to pull. Defaults to 'https://api-gateway.umami.dev/api/send'.
     */
    serverApiDestination?: string;
};

type UmamiTracker = {
    track: (...args: UmamiTrackArguments) => unknown;
    identify?: (...args: UmamiIdentifyArguments) => unknown;
};
declare global {
    interface Window {
        umami?: UmamiTracker;
    }
}
declare function useUmami(): {
    pageView: (data?: Partial<PageView>) => {
        hostname?: string | undefined;
        language?: string | undefined;
        referrer?: string | undefined;
        screen?: string | undefined;
        title?: string | undefined;
        url?: string | undefined;
        website?: string | undefined;
    };
    event: (name: string, data?: UmamiEventData) => {
        name: string;
        data: undefined;
    } | {
        name: string;
        data: {
            [x: string]: UmamiEventDataValue;
        };
    };
    track: (...args: UmamiTrackArguments) => void;
    identify: (...args: UmamiIdentifyArguments) => void;
};

declare function withUmamiProxy(options?: NextUmamiProxyOptions): NextConfig;

declare global {
    interface Window {
        [key: string]: unknown;
    }
}
declare function UmamiProvider({ src, websiteId, autoTrack, hostUrl, domains, beforeSend, performance, children, ...props }: UmamiProps): React.JSX.Element;

type CreateUmamiDistinctIdOptions = {
    salt?: string;
    maxLength?: number;
};
declare function createUmamiDistinctId(input: string, options?: CreateUmamiDistinctIdOptions): Promise<string>;

export { type CreateUmamiDistinctIdOptions, type PageView, type UmamiBeforeSend, type UmamiEventData, type UmamiEventDataValue, type UmamiIdentifyArguments, type UmamiPayload, type UmamiProps, type UmamiTrackArguments, type UmamiTrackOptions, type UmamiTrackPayload, createUmamiDistinctId, UmamiProvider as default, useUmami, withUmamiProxy };
