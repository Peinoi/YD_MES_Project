// backend/services/dashboardService.js
const { query } = require("../database/mapper");
const sql = require("../database/sqlList");

module.exports = {
  async getProduction() {
    const rows = await query("production");
    const row = rows[0] || { currentOutput: 0, dailyTarget: 0 };

    return {
      dailyTarget: Number(row.dailyTarget),
      currentOutput: Number(row.currentOutput),
    };
  },

  async getRamen() {
    const rows = await query("ramen");
    return {
      names: rows.map((r) => r.name),
      codes: rows.map((r) => r.code),
      values: rows.map((r) => Number(r.qty)),
    };
  },

  async getEquipments() {
    const rows = await query("equipments");
    return rows.map((r) => ({
      prdr_s_code: r.prdr_s_code,
      op_time: r.op_time,
      down_time: r.down_time,
      po_code: r.po_code,
      po_name: r.po_name,
    }));
  },

  async getOrders() {
    const rows = await query("dashOrder");

    return rows.map((r) => ({
      code: r.code,
      unit: r.unit,
      qty: r.req_qtt,
      deadline: r.deadline,
      purchase: r.purchase_code,
      client: r.client_code,
      material: r.mat_code,
    }));
  },
};
