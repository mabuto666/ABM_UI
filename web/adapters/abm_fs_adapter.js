import { DatasetAdapter } from "./adapter_contract.js";

async function loadJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return await r.json();
}

export class AbmFilesystemAdapter extends DatasetAdapter {
  constructor(base="/data") {
    super();
    this.base = base.replace(/\/+$/,"" );
  }

  async listRuns() {
    // Prefer runs.json if present, else "latest"
    try {
      const runs = await loadJson(`${this.base}/runs.json`);
      return runs;
    } catch {
      return [{ run_id: "latest", label: "latest", timestamp_utc: null }];
    }
  }

  async getLimits() {
    const obj = await loadJson(`${this.base}/results.json`);
    return Array.isArray(obj) ? obj : (obj.results || []);
  }

  async getRun(run_id) {
    const aggregates = await loadJson(`${this.base}/aggregates.json`);
    let events = [];
    try {
      const txt = await (await fetch(`${this.base}/events.jsonl`)).text();
      events = txt.split("\n").filter(Boolean).map(l => JSON.parse(l));
    } catch {}
    const limits = await this.getLimits().catch(()=>[]);
    return { run_id, events, aggregates, limits };
  }
}
