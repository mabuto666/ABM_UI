import { DatasetAdapter } from "./adapter_contract.js";

async function loadJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return await r.json();
}

// Generic adapter expects /data_generic/limits.json with rows like:
// { "name": "...", "params": {...}, "status": "...", "reason": "...", "metrics": {...} }
export class GenericLimitsFilesystemAdapter extends DatasetAdapter {
  constructor(base="/data_generic") {
    super();
    this.base = base.replace(/\/+$/,"");
  }

  async listRuns() {
    return [{ run_id: "latest", label: "latest", timestamp_utc: null }];
  }

  async getLimits() {
    const obj = await loadJson(`${this.base}/limits.json`);
    const rows = Array.isArray(obj) ? obj : (obj.limits || []);
    // Normalize into ABM_UI expected shape
    return rows.map(r => ({
      benchmark: r.name || r.benchmark || "",
      parameters: r.params || r.parameters || {},
      outcome: r.status || r.outcome || "",
      halt_reason: r.reason || r.halt_reason || "",
      metrics: r.metrics || {}
    }));
  }

  async getRun(run_id) {
    // Optional aggregates/events for generic datasets
    let aggregates = {};
    try { aggregates = await loadJson(`${this.base}/aggregates.json`); } catch {}
    let events = [];
    try {
      const txt = await (await fetch(`${this.base}/events.jsonl`)).text();
      events = txt.split("\n").filter(Boolean).map(l => JSON.parse(l));
    } catch {}
    const limits = await this.getLimits().catch(()=>[]);
    return { run_id, events, aggregates, limits };
  }
}
