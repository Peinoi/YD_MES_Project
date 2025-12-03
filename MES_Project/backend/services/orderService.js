const { query, getConnection } = require("../database/mapper.js");
const commonService = require("../services/commonService.js");

// 주문 목록 전체 조회
exports.getOrderList = async (filters) => {
  try {
    const params = [
      filters.ord_code,
      filters.ord_code,
      filters.ord_code,
      filters.ord_name,
      filters.ord_name,
      filters.ord_name,
      filters.ord_date,
      filters.ord_date,
      filters.ord_date,
      filters.ord_date,
      filters.client_name,
      filters.client_name,
      filters.client_name,
      filters.ord_amount,
      filters.ord_amount,
      filters.ord_amount,
      filters.ord_amount,
      filters.delivery_date,
      filters.delivery_date,
      filters.delivery_date,
      filters.delivery_date,
      filters.ord_stat,
      filters.ord_stat,
      filters.ord_stat,
    ];

    const rows = await query("selectOrderList", params);
    if (!rows || !rows.length) return [];

    for (const order of rows) {
      order.ord_stat_name = await commonService.getNote("0A", order.ord_stat);
    }

    return rows;
  } catch (err) {
    console.error("[orderService.js || 주문 목록 전체 조회 실패]", err.message);
    throw err;
  }
};
