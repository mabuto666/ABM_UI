import { AbmFilesystemAdapter } from "./adapters/abm_fs_adapter.js";
import { GenericLimitsFilesystemAdapter } from "./adapters/generic_limits_fs_adapter.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s)
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;");

function renderLimits(rows){
  if (!rows.length) return "<p class='muted'>No limit rows.</p>";
  const cols = ["benchmark","parameters","outcome","halt_reason"];
  let h = "<table><thead><tr>" + cols.map(c=>`<th>${c}</th>`).join("") + "</tr></thead><tbody>";
  rows.forEach((r,i)=>{
    h += `<tr data-i="${i}" style="cursor:pointer">` +
      `<td>${esc(r.benchmark||"")}</td>` +
      `<td><code>${esc(JSON.stringify(r.parameters||{}))}</code></td>` +
      `<td>${esc(r.outcome||"")}</td>` +
      `<td>${esc(r.halt_reason||"")}</td>` +
    `</tr>`;
  });
  h += "</tbody></table>";
  return h;
}

let adapter = new AbmFilesystemAdapter("/data");
let current = { limits: [] };

$("loadBtn").onclick = async () => {
  const sel = $("adapterSelect").value;
  const base = ($("baseUrl").value || (sel==="generic" ? "/data_generic" : "/data")).trim();
  adapter = (sel==="generic") ? new GenericLimitsFilesystemAdapter(base) : new AbmFilesystemAdapter(base);
  $("status").textContent = "Loading...";
  try {
    const limits = await adapter.getLimits();
    current.limits = limits;
    $("limits").innerHTML = renderLimits(limits);
    $("status").textContent = `Loaded ${limits.length} rows from ${base}/results.json`;
    $("raw").textContent = "";

    document.querySelectorAll("tr[data-i]").forEach(tr=>{
      tr.onclick = ()=> {
        const i = Number(tr.getAttribute("data-i"));
        $("raw").textContent = JSON.stringify(current.limits[i], null, 2);
      };
    });
  } catch (e) {
    $("status").textContent = "Error: " + e.message;
  }
};
