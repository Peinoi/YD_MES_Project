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
      filters.ord_date_from,
      filters.ord_date_from,
      filters.ord_date_to,
      filters.ord_date_to,
      filters.client_name,
      filters.client_name,
      filters.client_name,
      filters.ord_amount_from,
      filters.ord_amount_from,
      filters.ord_amount_to,
      filters.ord_amount_to,
      filters.delivery_date_from,
      filters.delivery_date_from,
      filters.delivery_date_to,
      filters.delivery_date_to,
      filters.ord_stat_name,
      filters.ord_stat_name,
      filters.ord_stat_name,
    ];

    const rows = await query("selectOrderList", params);
    if (!rows || !rows.length) return [];

    return rows;
  } catch (err) {
    console.error("[orderService.js || 주문 목록 전체 조회 실패]", err.message);
    throw err;
  }
};

// 주문 모달창 조회
exports.getOrderSearch = async (filters) => {
  try {
    const params = [
      filters.ord_code,
      filters.ord_code,
      filters.ord_code,
      filters.ord_name,
      filters.ord_name,
      filters.ord_name,
      filters.client_name,
      filters.client_name,
      filters.client_name,
    ];

    const rows = await query("selectOrderSearch", params);
    if (!rows || !rows.length) return [];

    for (const order of rows) {
      order.com_value_name = await commonService.getNote("0J", order.com_value);
      // 규격 공통 코드 0O인데 왜 0X에 16 추가되어 있는걸까...
      // 일단 x1일 경우에 예외처리함
      if (order.spec == "x1") {
        order.spec_name = await commonService.getNote("0X", order.spec);
      } else {
        order.spec_name = await commonService.getNote("0O", order.spec);
      }
      order.unit_name = await commonService.getNote("0H", order.unit);
    }

    return rows;
  } catch (err) {
    console.error("[orderService.js || 주문 모달창 조회 실패]", err.message);
    throw err;
  }
};

// 거래처 목록 전체 조회
exports.getClientList = async () => {
  try {
    const rows = await query("selectClientList");

    return rows;
  } catch (err) {
    console.error(
      "[orderService.js || 거래처 목록 전체 조회 실패]",
      err.message
    );
    throw err;
  }
};

// 상태 목록 전체 조회
exports.getStatList = async () => {
  try {
    const rows = await commonService.getNoteList("0A");

    return rows;
  } catch (err) {
    console.error("[orderService.js || 상태 목록 전체 조회 실패]", err.message);
    throw err;
  }
};

// 영업팀 거래처 담당자 목록 전체 조회
exports.getManagerList = async () => {
  try {
    const rows = await query("selectManagerList");

    return rows;
  } catch (err) {
    console.error(
      "[orderService.js || 영업팀 거래처 담당자 목록 전체 조회 실패]",
      err.message
    );
    throw err;
  }
};
