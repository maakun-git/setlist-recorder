// ここに将来の拡張を全部集約

export async function fetchJSON(url) {
  const res = await fetch(url + "?t=" + Date.now());
  if (!res.ok) throw new Error(res.status);
  return await res.json();
}

export function sendAnalytics(eventName, params = {}) {
  if (window.gtag) {
    gtag("event", eventName, params);
  }
}

export async function sendToSheets(payload) {
  await fetch("YOUR_GAS_ENDPOINT", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
