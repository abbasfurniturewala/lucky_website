export function trackEvent(eventName, parameters = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const event = {
    event: eventName,
    ...parameters,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
  window.dispatchEvent(new CustomEvent("lucky:analytics", { detail: event }));
}
