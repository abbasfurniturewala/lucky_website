import { trackEvent } from "../src/analytics.js";

let dispatchedEvent;

globalThis.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.detail = options.detail;
    this.type = type;
  }
};

globalThis.window = {
  dataLayer: [],
  dispatchEvent(event) {
    dispatchedEvent = event;
  },
};

trackEvent("whatsapp_click", {
  cta_location: "test",
  page_type: "product",
  product_id: "test-product",
});

if (window.dataLayer.length !== 1) {
  throw new Error("Expected one analytics event in window.dataLayer.");
}

if (window.dataLayer[0].event !== "whatsapp_click") {
  throw new Error("Analytics event name was not preserved.");
}

if (window.dataLayer[0].product_id !== "test-product") {
  throw new Error("Analytics event parameters were not preserved.");
}

if (dispatchedEvent?.type !== "lucky:analytics") {
  throw new Error("Expected the local lucky:analytics event to be dispatched.");
}

console.log("Analytics event verification passed without loading an external vendor.");
