export function discountPct(deal) {
  return Math.round((deal.was - deal.price) / deal.was * 100);
}

export function saving(deal) {
  return Math.round((deal.was - deal.price) * 100) / 100;
}

export function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

export function verdictFor(pct) {
  if (pct >= 40) return { label: "New low — strong deal", cls: "strong" };
  if (pct >= 25) return { label: "Strong price", cls: "good" };
  if (pct >= 15) return { label: "Decent saving", cls: "ok" };
  return { label: "Routine sale", cls: "routine" };
}

export function filterDeals(deals, opts) {
  const q = (opts.q || "").trim().toLowerCase();
  return deals.filter((d) => {
    if (opts.category && d.category !== opts.category) return false;
    if (opts.store && d.store !== opts.store) return false;
    if (discountPct(d) < (opts.minDiscount || 0)) return false;
    if (q && !(d.name + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
}

export function sortDeals(deals, key) {
  const list = deals.slice();
  if (key === "saving") list.sort((a, b) => saving(b) - saving(a));
  else if (key === "price") list.sort((a, b) => a.price - b.price);
  else list.sort((a, b) => discountPct(b) - discountPct(a) || saving(b) - saving(a));
  return list;
}

export function totalSaving(deals) {
  return Math.round(deals.reduce((s, d) => s + saving(d), 0) * 100) / 100;
}
