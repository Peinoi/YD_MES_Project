// MES_Project/backend/services/release/fwdService.js
const db = require("../../database/mapper.js");
const fwdSQL = require("../../database/sqlList.js");
const commonService = require("../commonService.js");

/* ===========================
 *          공통코드
 * =========================== */

// 출고 화면에서 쓸 공통코드 묶음 조회
async function getForwardingCommonCodes() {
  // group_value 는 common_code 테이블 기준
  const [
    unitList, // 단위: 0H
    specOList, // 규격: 봉지라면 포장 0O
    specXList, // 규격: 컵라면(대) 0X
    specYList, // 규격: 컵라면(소) 0Y
    specZList, // 규격: 완제품 규격 0Z
    typeList, // 유형: 완제품 유형 0J
  ] = await Promise.all([
    commonService.getNoteList("0H"), // 단위
    commonService.getNoteList("0O"), // 규격(봉지)
    commonService.getNoteList("0X"), // 규격(컵 대)
    commonService.getNoteList("0Y"), // 규격(컵 소)
    commonService.getNoteList("0Z"), // 규격(완제품)
    commonService.getNoteList("0J"), // 제품 유형
  ]);

  // 🔹 규격은 4개 그룹을 하나로 합치기
  const specList = [...specOList, ...specXList, ...specYList, ...specZList];

  const toMap = (list) =>
    Object.fromEntries(list.map((row) => [row.com_value, row.note]));

  return {
    unitMap: toMap(unitList),
    specMap: toMap(specList),
    typeMap: toMap(typeList),

    // 필요 시 드롭다운 등에 쓸 수 있게 원본 리스트도 같이 넘겨둠
    unitList,
    specList,
    typeList,
  };
}

/* ===========================
 *       주문 관련 서비스
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
 * 출고요청 목록 조회 (모달용)
 * 라우터: GET /api/release/fwd
 * query: keyword, fromDate, toDate, client, status
 */
async function getReleaseList(params = {}) {
  const {
    keyword = "",
    fromDate = "",
    toDate = "",
    client = "",
    status = "", // 지금은 안 씀
  } = params;

  const where = [];
  const values = [];

  if (keyword) {
    // 🔹 출고요청코드 / 주문코드 / 거래처명 검색
    where.push(
      "(orq.out_req_code LIKE ? OR orq.ord_code LIKE ? OR c.client_name LIKE ?)"
    );
    const like = `%${keyword}%`;
    values.push(like, like, like);
  }

  if (fromDate) {
    where.push("orq.out_req_date >= ?");
    values.push(fromDate);
  }

  if (toDate) {
    where.push("orq.out_req_date <= ?");
    values.push(toDate);
  }

  if (client) {
    where.push("c.client_name LIKE ?");
    values.push(`%${client}%`);
  }

  // status는 out_req_tbl에 없으니 일단 무시하거나, 나중에 컬럼 추가하면 그때 처리

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const listSql = fwdSQL.SELECT_RELEASE_LIST.replace("/*WHERE*/", whereSQL);

  const conn = await db.getConnection();
  try {
    const rows = await conn.query(listSql, values);
    return rows;
  } finally {
    conn.release();
  }
}

// 출고요청 전체 목록 조회 (모달)
async function getReleaseListAll(params = {}) {
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
    where.push(
      "(orq.out_req_code LIKE ? OR orq.ord_code LIKE ? OR c.client_name LIKE ?)"
    );
    const like = `%${keyword}%`;
    values.push(like, like, like);
  }

  if (fromDate) {
    where.push("orq.out_req_date >= ?");
    values.push(fromDate);
  }

  if (toDate) {
    where.push("orq.out_req_date <= ?");
    values.push(toDate);
  }

  if (client) {
    where.push("c.client_name LIKE ?");
    values.push(`%${client}%`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const listSql = fwdSQL.SELECT_RELEASE_LIST_ALL.replace("/*WHERE*/", whereSQL);

  const conn = await db.getConnection();
  try {
    const rows = await conn.query(listSql, values);
    return rows;
  } finally {
    conn.release();
  }
}

/**
 * 출고요청 상세 조회 (헤더 + 라인)
 * 라우터: GET /api/release/fwd/:releaseCode
 */
async function getReleaseDetail(releaseCode) {
  console.log("[getReleaseDetail] releaseCode:", releaseCode);
  const conn = await db.getConnection();

  try {
    const headerRows = await conn.query(fwdSQL.SELECT_RELEASE_HEADER, [
      releaseCode,
    ]);

    if (!headerRows || headerRows.length === 0) {
      return null;
    }

    const h = headerRows[0];

    const header = {
      releaseCode: h.releaseCode,
      releaseDate: h.releaseDate,
      orderCode: h.orderCode,
      client: h.client,
      remark: h.remark,
      orderRemark: h.orderRemark,
      status: h.status,
      orderDate: h.orderDate,
      registrantCode: h.registrantCode,
      registrantName: h.registrantName,
      orderManagerCode: h.order_manager_code,
      orderManagerName: h.order_manager_name,
    };

    const lineRows = await conn.query(fwdSQL.SELECT_RELEASE_LINES, [
      releaseCode,
    ]);

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
 *  제품 목록 조회 (출고제품 모달)
 *  라우터: GET /api/release/fwd/products
 *  query: keyword
 * =========================== */
async function getProductList(keyword = "") {
  const conn = await db.getConnection();

  try {
    const kw = `%${(keyword || "").trim()}%`;
    const rows = await conn.query(fwdSQL.SELECT_PRODUCT_LIST, [kw, kw]);
    console.log("[getProductList] rows.length =", rows.length);
    return rows; // [{ productCode, productName, ... }]
  } finally {
    conn.release();
  }
}

/* ===========================
 *  거래처 목록 조회 (거래처 모달)
 *  라우터: GET /api/release/fwd/clients
 *  query: keyword
 * =========================== */
async function getClientList(keyword = "") {
  const conn = await db.getConnection();

  try {
    const kw = `%${(keyword || "").trim()}%`;
    const rows = await conn.query(fwdSQL.SELECT_CLIENT_LIST, [kw, kw]);
    console.log("[getClientList] rows.length =", rows.length);
    return rows; // [{ clientCode, clientName, ... }]
  } finally {
    conn.release();
  }
}

/* ===========================
 *  출고요청 조회 (ForwardingCheck)
 *  라우터: GET /api/release/fwd/check
 *  query: releaseNo, productName, qtyFrom, qtyTo, dateFrom, dateTo, manager, client
 * =========================== */
async function getForwardingCheckList(params = {}) {
  const {
    releaseNo = "",
    productName = "",
    productCode = "", // 🔹 프론트에서 같이 넘겨주는 코드
    qtyFrom = "",
    qtyTo = "",
    dateFrom = "",
    dateTo = "",
    manager = "",
    client = "",
  } = params;

  const where = [];
  const values = [];

  // 출고번호
  if (releaseNo) {
    where.push("orq.out_req_code LIKE ?");
    values.push(`%${releaseNo}%`);
  }

  // 🔹 제품 조건: "이 출고요청(orq.out_req_code)에 이 제품이 하나라도 있냐?"
  //    - productCode가 있으면 코드로 체크
  //    - 없고 productName만 있으면 이름 LIKE로 체크
  if (productCode) {
    where.push(`
      EXISTS (
        SELECT 1
        FROM out_req_d_tbl ord2
        WHERE ord2.out_req_code = orq.out_req_code
          AND ord2.prod_code = ?
      )
    `);
    values.push(productCode);
  } else if (productName) {
    where.push(`
      EXISTS (
        SELECT 1
        FROM out_req_d_tbl ord2
        JOIN prod_tbl p2
          ON p2.prod_code = ord2.prod_code
        WHERE ord2.out_req_code = orq.out_req_code
          AND p2.prod_name LIKE ?
      )
    `);
    values.push(`%${productName}%`);
  }

  // 수량
  if (qtyFrom !== "" && qtyFrom != null) {
    where.push("ord.out_req_d_amount >= ?");
    values.push(Number(qtyFrom));
  }
  if (qtyTo !== "" && qtyTo != null) {
    where.push("ord.out_req_d_amount <= ?");
    values.push(Number(qtyTo));
  }

  // 일자
  if (dateFrom) {
    where.push("orq.out_req_date >= ?");
    values.push(dateFrom);
  }
  if (dateTo) {
    where.push("orq.out_req_date <= ?");
    values.push(dateTo);
  }

  // 담당자 / 거래처
  if (manager) {
    where.push("e.emp_name LIKE ?");
    values.push(`%${manager}%`);
  }
  if (client) {
    where.push("c.client_name LIKE ?");
    values.push(`%${client}%`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const listSql = fwdSQL.SELECT_FORWARDING_CHECK_LIST.replace(
    "/*WHERE*/",
    whereSQL
  );

  const conn = await db.getConnection();
  try {
    const rows = await conn.query(listSql, values);
    console.log("[getForwardingCheckList] rows.length =", rows.length);
    // 👉 여기 rows는 "조건에 맞는 출고전표의 모든 제품 라인"
    return rows; // [{ releaseNo, productName, qty, date, manager, client, status }]
  } finally {
    conn.release();
  }
}

/* ===========================
 *   출고요청 생성/수정/삭제
 * =========================== */

async function createRelease({ header, lines }) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const { orderCode, registrant } = header;

    if (!orderCode) {
      throw new Error("orderCode is required for createRelease.");
    }

    if (!registrant) {
      throw new Error("registrant(mcode) is required for createRelease.");
    }

    // 주문에서 client_code 조회
    const orderRows = await conn.query(fwdSQL.SELECT_ORDER_CLIENT_CODE, [
      orderCode,
    ]);

    if (!orderRows || orderRows.length === 0) {
      throw new Error(
        `ord_tbl에서 orderCode ${orderCode}에 해당하는 데이터를 찾을 수 없습니다.`
      );
    }

    const clientCode = orderRows[0].client_code;

    // 출고요청 자동채번 번호 만들어서 outReqCode 에 넣기
    const outReqCodeRows = await conn.query(fwdSQL.GENERATE_OUT_REQ_CODE);
    const outReqCode = outReqCodeRows[0].out_req_code;

    // 납기일 계산: 라인 dueDate 중 가장 빠른 날짜
    let predictDate = header.releaseDate || null;
    for (const line of lines) {
      if (line.dueDate) {
        const d = new Date(line.dueDate);
        if (!predictDate || d < new Date(predictDate)) {
          predictDate = line.dueDate;
        }
      }
    }

    const outReqDate = header.releaseDate || new Date(); // 출고요청일

    // 출고요청 헤더 INSERT (out_req_tbl)
    await conn.query(fwdSQL.INSERT_OUT_REQ, [
      outReqCode, // out_req_code
      outReqDate, // out_req_date
      predictDate || outReqDate, // ord_predict_date
      header.remark || null, // note
      orderCode, // ord_code
      header.registrant, // mcode (담당자)
      clientCode, // client_code
    ]);

    // 출고요청 상세 INSERT (out_req_d_tbl)
    for (const line of lines) {
      // 출고요청 수량이 0 이하인 경우는 무시
      if (!line.releaseQty || line.releaseQty <= 0) continue;

      // 출고요청 상세 자동채번 번호 만들어서 outReqDCodeRows 에 넣기
      const outReqDCodeRows = await conn.query(fwdSQL.GENERATE_OUT_REQ_D_CODE);
      const outReqDCode = outReqDCodeRows[0].out_req_d_code;

      await conn.query(fwdSQL.INSERT_OUT_REQ_D, [
        outReqDCode, // out_req_d_code
        line.releaseQty, // out_req_d_amount (요청수량 = 화면 출고수량)
        line.orderQty || 0, // ord_amount (주문수량)
        outReqCode, // out_req_code (헤더 FK)
        line.productCode, // prod_code
        line.type || null, // com_value (완제품 유형)
      ]);
    }

    await conn.commit();

    return {
      outReqCode,
      message: "출고요청이 성공적으로 생성되었습니다.",
    };
  } catch (err) {
    await conn.rollback();
    console.error("[createRelease] error:", err);
    throw err;
  } finally {
    conn.release();
  }
}

async function updateRelease(releaseCode, { header, lines }) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    if (!releaseCode) {
      throw new Error("releaseCode is required for updateRelease.");
    }

    const { orderCode, registrant } = header;

    if (!orderCode) {
      throw new Error("orderCode is required for updateRelease.");
    }

    if (!registrant) {
      throw new Error("registrant(mcode) is required for updateRelease.");
    }

    // 예측납기일: 라인 dueDate 중 가장 빠른 날짜
    let predictDate = header.releaseDate || null;
    for (const line of lines) {
      if (line.dueDate) {
        const d = new Date(line.dueDate);
        if (!predictDate || d < new Date(predictDate)) {
          predictDate = line.dueDate;
        }
      }
    }

    const outReqDate = header.releaseDate || new Date(); // 출고요청일

    // 헤더 업데이트 (out_req_tbl)
    await conn.query(fwdSQL.UPDATE_OUT_REQ, [
      outReqDate, // out_req_date
      predictDate || outReqDate, // ord_predict_date
      header.remark || null, // note
      registrant, // mcode
      releaseCode, // WHERE out_req_code = ?
    ]);

    // 기존 라인들 삭제 (out_req_d_tbl)
    await conn.query(fwdSQL.DELETE_OUT_REQ_D_BY_HEADER, [releaseCode]);

    // 새로운 라인들 INSERT (out_req_d_tbl)
    for (const line of lines) {
      // 출고요청 수량이 0 이하인 경우는 무시
      if (!line.releaseQty || line.releaseQty <= 0) continue;

      // 새 상세 코드 자동채번
      const outReqDCodeRows = await conn.query(fwdSQL.GENERATE_OUT_REQ_D_CODE);
      const outReqDCode = outReqDCodeRows[0].out_req_d_code;

      await conn.query(fwdSQL.INSERT_OUT_REQ_D, [
        outReqDCode, // out_req_d_code
        line.releaseQty, // out_req_d_amount
        line.orderQty || 0, // ord_amount
        releaseCode, // out_req_code (헤더 FK)
        line.productCode, // prod_code
        line.type || null, // com_value (완제품 유형 코드)
      ]);
    }

    await conn.commit();

    return {
      outReqCode: releaseCode,
      message: "출고요청이 성공적으로 수정되었습니다.",
    };
  } catch (err) {
    await conn.rollback();
    console.error("[updateRelease] error:", err);
    throw err;
  } finally {
    conn.release();
  }
}

async function deleteRelease(releaseCode) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 상세 삭제 (FK 제약조건 때문에 상세 먼저 삭제)
    const detailResult = await conn.query(fwdSQL.DELETE_OUT_REQ_D_BY_HEADER, [
      releaseCode,
    ]);

    // 헤더 삭제
    const headerResult = await conn.query(fwdSQL.DELETE_OUT_REQ_HEADER, [
      releaseCode,
    ]);

    await conn.commit();

    return {
      releaseCode,
      deletedDetails: detailResult.affectedRows ?? 0,
      deletedHeader: headerResult.affectedRows ?? 0,
      message: "출고요청이 성공적으로 삭제되었습니다.",
    };
  } catch (err) {
    await conn.rollback();
    console.error("[deleteRelease] error:", err);
    throw err;
  } finally {
    conn.release();
  }
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
  getForwardingCommonCodes,
  getProductList,
  getClientList,
  getForwardingCheckList,
  getReleaseListAll,
};
