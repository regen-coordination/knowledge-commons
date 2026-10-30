/** Apply the same disclosure filtering to report bodies and filenames. */
export const redactReportText = (text: string) =>
  text
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[contact redacted]")
    .replace(/0x[a-fA-F0-9]{40,}/g, "[address redacted]");

// Source/model text cannot supply Markdown, HTML, images, or links.
export const reportProse = (text: string) =>
  redactReportText(text)
    .replace(/[\\`*_{}[\]()<>|#!]/g, "\\$&")
    .replace(/[\r\n]+/g, " ");
