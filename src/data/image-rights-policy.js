export const IMAGE_RIGHTS_STATUS = Object.freeze({
  confirmed: "confirmed",
  legacyUnverified: "legacy-unverified",
  pending: "pending",
});

export function normalizeImageRightsStatus(value, fallback = IMAGE_RIGHTS_STATUS.pending) {
  return Object.values(IMAGE_RIGHTS_STATUS).includes(value) ? value : fallback;
}

export function isImageRightsConfirmed(status) {
  return status === IMAGE_RIGHTS_STATUS.confirmed;
}
