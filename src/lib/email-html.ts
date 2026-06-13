export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapAdminMessageHtml(message: string, storeName: string): string {
  const paragraphs = message
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 12px;">${escapeHtml(line)}</p>`)
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;">
      ${paragraphs}
      <p style="margin:24px 0 0;color:#64748b;font-size:14px;">— ${escapeHtml(storeName)}</p>
    </div>
  `;
}
