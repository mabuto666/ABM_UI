export class DatasetAdapter {
  // Return [{run_id, label, timestamp_utc}]
  async listRuns() { throw new Error("not implemented"); }

  // Return {run_id, events:[], aggregates:{}, limits:[]}
  async getRun(run_id) { throw new Error("not implemented"); }

  // Optional: Return benchmark limit rows
  async getLimits() { return []; }
}
