// MES_Project/backend/services/release/fwdService.js
const db = require("../../database/mapper.js");
const fwdSQL = require("../../database/sqlList.js");

/* ===========================
 *  주문 관련 서비스
 * =========================== */

/**
 * 주문 목록 조회 (모달용)
 * 라우터: GET /api/release/fwd/orders
 * query: keyword, fromDate, toDate, client, status
 */
async function getOrderList(keyword) {
  const conn = await db.getConnection();

  try {
    const like = `%${(keyword || "").trim()}%`;

    const rows = await conn.query(fwdSQL.SELECT_ORDER_LIST, [like, like, like]);

    return rows;
  } finally {
    conn.release();
  }
}

/**
 * 주문 상세 조회 (헤더 + 아이템)
 * 라우터: GET /api/release/fwd/orders/:orderNo
 */
async function getOrderDetail(orderNo) {
  const conn = await db.getConnection();

  try {
    console.log("[getOrderDetail] orderNo:", orderNo);

    // 1) 헤더 조회
    const headerRows = await conn.query(fwdSQL.SELECT_ORDER_HEADER, [orderNo]);
    console.log("[getOrderDetail] headerRows:", headerRows);

    if (!headerRows || headerRows.length === 0) {
      console.log("[getOrderDetail] no header found for", orderNo);
      return null;
    }

    const h = headerRows[0];

    const header = {
      orderNo: h.orderNo,
      orderDate: h.orderDate, // 이미 YYYY-MM-DD 포맷
      client: h.client,
      dueDate: h.dueDate,
      status: h.status,
      priority: h.priority,
    };

    // 2) 라인(아이템) 조회
    const itemRows = await conn.query(fwdSQL.SELECT_ORDER_ITEMS, [orderNo]);
    console.log("[getOrderDetail] itemRows:", itemRows);

    const items = (itemRows || []).map((r) => ({
      productCode: r.productCode,
      productName: r.productName,
      type: r.type,
      spec: r.spec,
      unit: r.unit,
      orderQty: r.orderQty,
      stockQty: r.stockQty, // 프론트에서 stockQty ?? currentStock ?? 0
      currentStock: r.currentStock, // 혹시 쓸일 생기면 사용
      notReleasedQty: r.notReleasedQty,
      dueDate: r.dueDate, // 프론트에서 formatDate 한 번 더 태웁니다
    }));

    const result = { header, items };
    console.log("[getOrderDetail] result:", result);

    return result;
  } finally {
    conn.release();
  }
}

/* ===========================
 *  출고(Forwarding) 관련 서비스
 * =========================== */

/**
 * 출고전표 목록 조회 (모달용)
 * 라우터: GET /api/release/fwd
 * query: keyword, fromDate, toDate, client, status
 */
async function getReleaseList(params = {}) {
  const {
    keyword = "",
    fromDate = "",
    toDate = "",
    client = "",
    status = "",
  } = params;

  const where = [];
  const values = [];

  if (keyword) {
    // 🔹 출고번호 / 주문번호 / 거래처명 검색
    where.push(
      "(pb.poutbnd_code LIKE ? OR orq.ord_code LIKE ? OR c.client_name LIKE ?)"
    );
    const like = `%${keyword}%`;
    values.push(like, like, like);
  }

  if (fromDate) {
    where.push("pb.deadline >= ?");
    values.push(fromDate);
  }

  if (toDate) {
    where.push("pb.deadline <= ?");
    values.push(toDate);
  }

  if (client) {
    where.push("c.client_name LIKE ?");
    values.push(`%${client}%`);
  }

  if (status) {
    where.push("pb.stat = ?");
    values.push(status);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // 🔹 sql의 /*WHERE*/ 자리 치환
  const listSql = fwdSQL.SELECT_RELEASE_LIST.replace("/*WHERE*/", whereSQL);

  const conn = await db.getConnection();
  try {
    // mariadb 쓰고 있으니까 구조분해 말고 그대로
    const rows = await conn.query(listSql, values);
    return rows; // [{ releaseCode, releaseDate, orderCode, client, status, totalQty }, ...]
  } finally {
    conn.release();
  }
}

/**
 * 출고전표 상세 조회 (헤더 + 라인)
 * 라우터: GET /api/release/fwd/:releaseCode
 */
async function getReleaseDetail(releaseCode) {
  console.log("[getReleaseDetail] releaseCode:", releaseCode);
  const conn = await db.getConnection();

  try {
    // 1) 헤더 조회
    const headerRows = await conn.query(fwdSQL.SELECT_RELEASE_HEADER, [
      releaseCode,
    ]);
    console.log("[getReleaseDetail] headerRows:", headerRows);

    if (!headerRows || headerRows.length === 0) {
      return null;
    }

    const h = headerRows[0];

    const header = {
      releaseCode: h.releaseCode,
      releaseDate: h.releaseDate, // 'YYYY-MM-DD'
      orderCode: h.orderCode,
      client: h.client,
      remark: h.remark,
      status: h.status,
      orderDate: h.orderDate, // 'YYYY-MM-DD'
      registrantCode: h.registrantCode,
      registrantName: h.registrantName,
    };

    // 2) 라인(상세) 조회
    const lineRows = await conn.query(fwdSQL.SELECT_RELEASE_LINES, [
      releaseCode,
    ]);
    console.log("[getReleaseDetail] lineRows:", lineRows);

    const lines = (lineRows || []).map((r) => ({
      lineNo: r.line_no,
      productCode: r.product_code,
      productName: r.product_name,
      type: r.product_type,
      spec: r.spec,
      unit: r.unit,
      orderQty: r.order_qty,
      releaseQty: r.release_qty,
      stockQty: r.current_stock,
      dueDate: r.due_date,
    }));

    return { header, lines };
  } finally {
    conn.release();
  }
}

/* ===========================
 *  직원(등록자) 목록 조회
 *  라우터: GET /api/release/fwd/employees
 * =========================== */
async function getEmployeeList() {
  const conn = await db.getConnection();

  try {
    const rows = await conn.query(fwdSQL.SELECT_EMPLOYEE_LIST, []);
    console.log("[getEmployeeList] rows.length =", rows.length);
    return rows; // [{ empCode, empName }, ...]
  } finally {
    conn.release();
  }
}

/* ===========================
 *  출고전표 생성/수정/삭제
 *  👉 poutbnd_tbl 구조가 "헤더+라인"을 어떻게 가질지
 *     아직 명확하지 않아서 일단 Not Implemented 처리
 * =========================== */

async function createRelease() {
  throw new Error("createRelease is not implemented yet.");
}

async function updateRelease(/* releaseCode, payload */) {
  throw new Error("updateRelease is not implemented yet.");
}

async function deleteRelease(/* releaseCode */) {
  throw new Error("deleteRelease is not implemented yet.");
}

module.exports = {
  getOrderList,
  getOrderDetail,
  getReleaseList,
  getReleaseDetail,
  createRelease,
  updateRelease,
  deleteRelease,
  getEmployeeList,
};
