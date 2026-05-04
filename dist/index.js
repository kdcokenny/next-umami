'use client'
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// index.ts
var next_umami_exports = {};
__export(next_umami_exports, {
  createUmamiDistinctId: () => createUmamiDistinctId,
  default: () => next_umami_default,
  useUmami: () => useUmami,
  withUmamiProxy: () => withUmamiProxy
});
module.exports = __toCommonJS(next_umami_exports);

// src/useUmami.ts
var import_react = require("react");
function getUmamiTracker() {
  if (typeof window === "undefined") return void 0;
  return window.umami;
}
function isUmamiReadyFor(method) {
  const tracker = getUmamiTracker();
  if (!tracker) return false;
  if (method === "identify") return typeof tracker.identify === "function";
  return typeof tracker.track === "function";
}
function warnIfDistinctIdIsLong(id) {
  if (id.length <= 50) return;
  console.warn("Umami distinct IDs should be 50 characters or fewer");
}
function parseIdentifyArguments(args) {
  const [firstArgument] = args;
  if (typeof firstArgument !== "string") return args;
  if (firstArgument.length > 0) {
    warnIfDistinctIdIsLong(firstArgument);
    return args;
  }
  throw new Error("Umami distinct ID must be a non-empty string");
}
function flushQueuedCalls(queue) {
  var _a;
  for (const [index, queuedCall] of queue.entries()) {
    const tracker = getUmamiTracker();
    if (!tracker || !isUmamiReadyFor(queuedCall.method)) {
      return queue.slice(index);
    }
    if (queuedCall.method === "identify") {
      (_a = tracker.identify) == null ? void 0 : _a.call(tracker, ...queuedCall.args);
      continue;
    }
    tracker.track(...queuedCall.args);
  }
  return [];
}
function useUmami() {
  const eventQueue = (0, import_react.useRef)([]);
  const flushQueue = (0, import_react.useCallback)(() => {
    if (eventQueue.current.length === 0) return;
    eventQueue.current = flushQueuedCalls(eventQueue.current);
  }, []);
  (0, import_react.useEffect)(() => {
    flushQueue();
    const intervalId = window.setInterval(flushQueue, 1e3);
    return () => window.clearInterval(intervalId);
  }, [flushQueue]);
  const enqueueOrSend = (0, import_react.useCallback)(
    (queuedCall) => {
      var _a;
      flushQueue();
      if (eventQueue.current.length > 0) {
        console.warn(`Umami tracker unavailable; queueing ${queuedCall.method}`);
        eventQueue.current = [...eventQueue.current, queuedCall];
        return;
      }
      const tracker = getUmamiTracker();
      if (!tracker || !isUmamiReadyFor(queuedCall.method)) {
        console.warn(`Umami tracker unavailable; queueing ${queuedCall.method}`);
        eventQueue.current = [...eventQueue.current, queuedCall];
        return;
      }
      if (queuedCall.method === "identify") {
        (_a = tracker.identify) == null ? void 0 : _a.call(tracker, ...queuedCall.args);
        return;
      }
      tracker.track(...queuedCall.args);
    },
    [flushQueue]
  );
  const track = (0, import_react.useCallback)(
    (...args) => {
      enqueueOrSend({ method: "track", args });
    },
    [enqueueOrSend]
  );
  const identify = (0, import_react.useCallback)(
    (...args) => {
      enqueueOrSend({ method: "identify", args: parseIdentifyArguments(args) });
    },
    [enqueueOrSend]
  );
  const pageView = (0, import_react.useCallback)(
    (data) => {
      const fullData = __spreadValues({}, data || {});
      track(fullData);
      return fullData;
    },
    [track]
  );
  const event = (0, import_react.useCallback)(
    (name, data) => {
      if (!data) {
        track(name);
        return { name, data };
      }
      const eventData = __spreadValues({}, data);
      track(name, eventData);
      return { name, data: eventData };
    },
    [track]
  );
  return { pageView, event, track, identify };
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
var import_script = __toESM(require("next/script"));
var import_react2 = __toESM(require("react"));
var BEFORE_SEND_GLOBAL_PREFIX = "__nextUmamiBeforeSend";
function createBeforeSendGlobalName() {
  const randomValue = Math.random().toString(36).slice(2);
  return `${BEFORE_SEND_GLOBAL_PREFIX}_${Date.now().toString(36)}_${randomValue}`;
}
function toSafeBeforeSend(callback) {
  return (type, payload) => {
    try {
      return callback(type, payload) || false;
    } catch (error) {
      console.warn("Umami beforeSend failed; request cancelled");
      return false;
    }
  };
}
function UmamiProvider(_a) {
  var _b = _a, {
    src = "https://cloud.umami.is/script.js",
    websiteId,
    autoTrack = true,
    hostUrl,
    domains,
    beforeSend,
    performance,
    children
  } = _b, props = __objRest(_b, [
    "src",
    "websiteId",
    "autoTrack",
    "hostUrl",
    "domains",
    "beforeSend",
    "performance",
    "children"
  ]);
  var _a2;
  const beforeSendGlobalName = (0, import_react2.useMemo)(() => {
    if (typeof beforeSend !== "function") return void 0;
    return createBeforeSendGlobalName();
  }, [beforeSend]);
  const [registeredBeforeSendName, setRegisteredBeforeSendName] = (0, import_react2.useState)(() => typeof beforeSend === "string" ? beforeSend : void 0);
  (0, import_react2.useEffect)(() => {
    if (typeof beforeSend === "string") {
      setRegisteredBeforeSendName(beforeSend);
      return;
    }
    if (!beforeSendGlobalName || typeof beforeSend !== "function") {
      setRegisteredBeforeSendName(void 0);
      return;
    }
    window[beforeSendGlobalName] = toSafeBeforeSend(beforeSend);
    setRegisteredBeforeSendName(beforeSendGlobalName);
    return () => {
      if (window[beforeSendGlobalName]) {
        delete window[beforeSendGlobalName];
      }
      setRegisteredBeforeSendName(void 0);
    };
  }, [beforeSend, beforeSendGlobalName]);
  const proxyOptions = process.env.next_umami_proxy ? {
    clientScriptPath: process.env.next_umami_clientScriptPath,
    serverScriptDestination: process.env.next_umami_serverScriptDestination,
    clientApiPath: process.env.next_umami_clientApiPath,
    serverApiDestination: process.env.next_umami_serverApiDestination
  } : void 0;
  const effectiveHostUrl = (proxyOptions == null ? void 0 : proxyOptions.clientApiPath) || hostUrl;
  const shouldWaitForBeforeSendRegistration = typeof beforeSend === "function" && !registeredBeforeSendName;
  if (shouldWaitForBeforeSendRegistration) {
    return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, children);
  }
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(
    import_script.default,
    __spreadValues(__spreadProps(__spreadValues(__spreadValues(__spreadValues(__spreadValues({
      src: (_a2 = proxyOptions == null ? void 0 : proxyOptions.clientScriptPath) != null ? _a2 : src,
      "data-website-id": websiteId,
      "data-auto-track": autoTrack
    }, performance && { "data-performance": "true" }), registeredBeforeSendName && {
      "data-before-send": registeredBeforeSendName
    }), effectiveHostUrl && { "data-host-url": effectiveHostUrl }), domains && {
      "data-domains": Array.isArray(domains) ? domains.join(",") : domains
    }), {
      strategy: "afterInteractive"
    }), props)
  ), children);
}

// src/createUmamiDistinctId.ts
var DEFAULT_DISTINCT_ID_LENGTH = 50;
var MIN_DISTINCT_ID_LENGTH = 1;
var MAX_DISTINCT_ID_LENGTH = 50;
function parseDistinctIdLength(maxLength = DEFAULT_DISTINCT_ID_LENGTH) {
  if (!Number.isInteger(maxLength) || maxLength < MIN_DISTINCT_ID_LENGTH || maxLength > MAX_DISTINCT_ID_LENGTH) {
    throw new Error(
      "Umami distinct ID maxLength must be an integer from 1 to 50"
    );
  }
  return maxLength;
}
function getWebCrypto() {
  var _a;
  if ((_a = globalThis.crypto) == null ? void 0 : _a.subtle) {
    return globalThis.crypto;
  }
  throw new Error("Umami distinct ID hashing requires Web Crypto support");
}
function bytesToLowercaseHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
function createUmamiDistinctId(_0) {
  return __async(this, arguments, function* (input, options = {}) {
    var _a;
    if (typeof input !== "string" || input.length === 0) {
      throw new Error("Umami distinct ID input must be a non-empty string");
    }
    const maxLength = parseDistinctIdLength(options.maxLength);
    const crypto = getWebCrypto();
    const encoder = new TextEncoder();
    const digest = yield crypto.subtle.digest(
      "SHA-256",
      encoder.encode(`${(_a = options.salt) != null ? _a : ""}${input}`)
    );
    return bytesToLowercaseHex(new Uint8Array(digest)).slice(0, maxLength);
  });
}

// index.ts
var next_umami_default = UmamiProvider;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createUmamiDistinctId,
  useUmami,
  withUmamiProxy
});
//# sourceMappingURL=index.js.map