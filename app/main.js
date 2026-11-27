import { DEALS, CHECKED_LABEL } from "./deals.js";
import { discountPct, saving, money, verdictFor, filterDeals, sortDeals, totalSaving } from "./filters.js";

const grid = document.getElementById("grid");
const detail = document.getElementById("detail");
const resultLine = document.getElementById("resultLine");
const qInput = document.getElementById("q");
const catSelect = document.getElementById("cat");
const storeSelect = document.getElementById("store");
const mindSelect = document.getElementById("mind");
const sortSelect = document.getElementById("sort");

const categories = Array.from(new Set(DEALS.map((d) => d.category))).sort();
for (const c of categories) {
  const o = document.createElement("option");
  o.textContent = c;
  catSelect.appendChild(o);
}

document.getElementById("statCount").textContent = DEALS.length + " deals checked";
document.getElementById("statSaving").textContent = "Total saving " + money(totalSaving(DEALS)) + " vs usual prices";

function cardHtml(d) {
  const pct = discountPct(d);
  const v = verdictFor(pct);
  return "<article class=\"card\"><div class=\"meta\"><span>" + d.store + "</span><span>" + d.category + "</span></div>"
    + "<h2><a href=\"#/deal/" + d.id + "\">" + d.name + "</a></h2>"
    + "<div class=\"prices\"><span class=\"now\">" + money(d.price) + "</span><span class=\"was\">" + money(d.was) + "</span><span class=\"off\">-" + pct + "%</span></div>"
    + "<div class=\"save\">You save " + money(saving(d)) + "</div>"
    + "<span class=\"verdict " + v.cls + "\">" + v.label + "</span>"
    + "<p class=\"evidence\">" + d.note + "</p>"
    + "<p class=\"source\">Source: " + d.source + " · Checked " + CHECKED_LABEL + "</p>"
    + "<div class=\"actions\"><a href=\"" + d.url + "\" target=\"_blank\" rel=\"noopener\">View at " + d.store + "</a><a class=\"details\" href=\"#/deal/" + d.id + "\">Details</a></div></article>";
}

function render() {
  const opts = { q: qInput.value, category: catSelect.value, store: storeSelect.value, minDiscount: Number(mindSelect.value) };
  const found = sortDeals(filterDeals(DEALS, opts), sortSelect.value);
  resultLine.textContent = "Showing " + found.length + " of " + DEALS.length + " deals, sorted by " + sortSelect.value + ".";
  grid.innerHTML = found.map(cardHtml).join("");
  window.__shotReady = true;
}

function renderDetail(id) {
  const d = DEALS.find((x) => x.id === id);
  if (!d) { detail.hidden = true; grid.hidden = false; render(); return; }
  const pct = discountPct(d);
  const v = verdictFor(pct);
  const others = d.group ? DEALS.filter((x) => x.group === d.group && x.id !== d.id) : [];
  let compare = "";
  if (others.length) {
    compare = "<div class=\"compare\"><b>Same product elsewhere:</b> " + others.map((o) => o.store + " " + money(o.price) + " (was " + money(o.was) + ", -" + discountPct(o) + "%)").join("; ") + ". Cheapest is " + money(Math.min(d.price, ...others.map((o) => o.price))) + ".</div>";
  }
  detail.innerHTML = "<a class=\"back\" href=\"#/\">&larr; All deals</a><h2>" + d.name + "</h2>"
    + "<span class=\"verdict " + v.cls + "\">" + v.label + "</span>"
    + "<dl><dt>Store</dt><dd>" + d.store + "</dd><dt>Sale price</dt><dd>" + money(d.price) + "</dd>"
    + "<dt>Usual price</dt><dd>" + money(d.was) + "</dd><dt>Discount</dt><dd>-" + pct + "% (you save " + money(saving(d)) + ")</dd>"
    + "<dt>Category</dt><dd>" + d.category + "</dd><dt>Checked</dt><dd>" + CHECKED_LABEL + "</dd>"
    + "<dt>Source</dt><dd>" + d.source + "</dd><dt>Evidence</dt><dd>" + d.note + "</dd></dl>"
    + compare
    + "<div class=\"actions\"><a href=\"" + d.url + "\" target=\"_blank\" rel=\"noopener\">Buy at " + d.store + "</a></div>";
  detail.hidden = false;
  grid.hidden = true;
  resultLine.textContent = "";
  window.__shotReady = true;
}

function route() {
  const m = location.hash.match(/^#\/deal\/([a-z0-9-]+)$/);
  if (m) renderDetail(m[1]);
  else { detail.hidden = true; grid.hidden = false; render(); }
}

for (const el of [qInput, catSelect, storeSelect, mindSelect, sortSelect]) {
  el.addEventListener("input", () => { location.hash = "#/"; render(); });
}
window.addEventListener("hashchange", route);
route();
