/** Saves text as a local file via Blob + object URL. Nothing leaves the machine. */
export function downloadText(fileName: string, text: string, mimeType: string): void {
  if (typeof URL.createObjectURL !== "function") {
    throw new Error("This environment cannot create downloadable files (URL.createObjectURL is unavailable).");
  }
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Revoke after the click has been dispatched.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** File-name-safe stamp from an ISO timestamp: 2026-10-01T18:00:00.000Z -> 2026-10-01T18-00-00Z. */
export function fileStamp(isoUtc: string): string {
  return isoUtc.replace(/\.\d+Z$/, "Z").replace(/:/g, "-");
}
