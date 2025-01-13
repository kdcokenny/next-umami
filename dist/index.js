var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/useUmami.ts
import { useCallback, useEffect, useState } from "react";
function useUmami() {
  const [isClient, setIsClient] = useState(false);
  const [eventQueue, setEventQueue] = useState([]);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const isUmamiAvailable = useCallback(() => {
    return isClient && typeof window.umami !== "undefined";
  }, [isClient]);
  useEffect(() => {
    if (!isClient) return;
    const processQueue = () => {
      var _a, _b;
      if (!isUmamiAvailable()) return;
      while (eventQueue.length > 0) {
        const event2 = eventQueue[0];
        if (event2.type === "pageView") {
          ;
          (_a = window.umami) == null ? void 0 : _a.track(event2.payload.data);
        } else {
          ;
          (_b = window.umami) == null ? void 0 : _b.track(
            event2.payload.name,
            event2.payload.data
          );
        }
        setEventQueue((queue) => queue.slice(1));
      }
    };
    const intervalId = setInterval(() => {
      if (isUmamiAvailable()) {
        processQueue();
        if (eventQueue.length === 0) {
          clearInterval(intervalId);
        }
      }
    }, 1e3);
    return () => clearInterval(intervalId);
  }, [isClient, isUmamiAvailable, eventQueue]);
  const pageView = useCallback(
    (data) => {
      var _a;
      const fullData = __spreadValues({}, data || {});
      if (!isUmamiAvailable()) {
        console.warn("UmamiProvider not found, queueing pageView");
        setEventQueue((queue) => [
          ...queue,
          {
            type: "pageView",
            payload: { data: fullData },
            timestamp: Date.now()
          }
        ]);
        return fullData;
      }
      ;
      (_a = window.umami) == null ? void 0 : _a.track(fullData);
      return fullData;
    },
    [isUmamiAvailable]
  );
  const event = useCallback(
    (name, data) => {
      var _a;
      if (!isUmamiAvailable()) {
        console.warn("UmamiProvider not found, queueing event");
        setEventQueue((queue) => [
          ...queue,
          {
            type: "event",
            payload: { name, data },
            timestamp: Date.now()
          }
        ]);
        return { name, data };
      }
      ;
      (_a = window.umami) == null ? void 0 : _a.track(name, __spreadValues({}, data && __spreadValues({}, data)));
      return { name, data: __spreadValues({}, data && __spreadValues({}, data)) };
    },
    [isUmamiAvailable]
  );
  return { pageView, event };
}

// src/withUmamiProxy.ts
function withUmamiProxy(options = {}) {
  return (nextConfig) => {
    var _a, _b, _c, _d;
    const nextUmamiEnv = {
      next_umami_proxy: "true",
      next_umami_clientScriptPath: (_a = options.clientScriptPath) != null ? _a : "/script.js",
      next_umami_serverScriptDestination: (_b = options.serverScriptDestination) != null ? _b : "https://cloud.umami.is/script.js",
      next_umami_clientApiPath: (_c = options.clientApiPath) != null ? _c : "/",
      next_umami_serverApiDestination: (_d = options.serverApiDestination) != null ? _d : "https://api-gateway.umami.dev/api/send"
    };
    return __spreadProps(__spreadValues({}, nextConfig), {
      env: __spreadValues(__spreadValues({}, nextConfig.env), Object.fromEntries(
        Object.entries(nextUmamiEnv).filter(
          ([_, value]) => value !== void 0
        )
      )),
      rewrites: () => __async(this, null, function* () {
        var _a2, _b2;
        const umamiRewrites = [
          {
            source: nextUmamiEnv.next_umami_clientScriptPath,
            destination: nextUmamiEnv.next_umami_serverScriptDestination
          },
          {
            source: `${(_a2 = nextUmamiEnv.next_umami_clientApiPath) == null ? void 0 : _a2.replace(/\/$/, "")}/api/send`,
            destination: nextUmamiEnv.next_umami_serverApiDestination,
            headers: {}
          }
        ];
        if (process.env.NEXT_UMAMI_DEBUG) {
          console.log("umamiRewrites = ", umamiRewrites);
        }
        const rewrites = yield (_b2 = nextConfig.rewrites) == null ? void 0 : _b2.call(nextConfig);
        if (!rewrites) {
          return umamiRewrites;
        } else if (Array.isArray(rewrites)) {
          return rewrites.concat(umamiRewrites);
        } else if (rewrites.afterFiles) {
          rewrites.afterFiles = rewrites.afterFiles.concat(umamiRewrites);
          return rewrites;
        } else {
          rewrites.afterFiles = umamiRewrites;
          return rewrites;
        }
      })
    });
  };
}

// src/UmamiProvider.tsx
import Script from "next/script";
import React from "react";
function UmamiProvider(_a) {
  var _b = _a, {
    src = "https://cloud.umami.is/script.js",
    websiteId,
    autoTrack = true,
    hostUrl,
    domains,
    children
  } = _b, props = __objRest(_b, [
    "src",
    "websiteId",
    "autoTrack",
    "hostUrl",
    "domains",
    "children"
  ]);
  var _a2;
  const proxyOptions = process.env.next_umami_proxy ? {
    clientScriptPath: process.env.next_umami_clientScriptPath,
    serverScriptDestination: process.env.next_umami_serverScriptDestination,
    clientApiPath: process.env.next_umami_clientApiPath,
    serverApiDestination: process.env.next_umami_serverApiDestination
  } : void 0;
  const effectiveHostUrl = (proxyOptions == null ? void 0 : proxyOptions.clientApiPath) || hostUrl;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    Script,
    __spreadValues(__spreadProps(__spreadValues(__spreadValues({
      src: (_a2 = proxyOptions == null ? void 0 : proxyOptions.clientScriptPath) != null ? _a2 : src,
      "data-website-id": websiteId,
      "data-auto-track": autoTrack
    }, effectiveHostUrl && { "data-host-url": effectiveHostUrl }), domains && {
      "data-domains": Array.isArray(domains) ? domains.join(",") : domains
    }), {
      strategy: "afterInteractive"
    }), props)
  ), children);
}

// index.ts
var next_umami_default = UmamiProvider;
export {
  next_umami_default as default,
  useUmami,
  withUmamiProxy
};
//# sourceMappingURL=index.js.map