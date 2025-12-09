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

  // 규격은 4개 그룹을 하나로 합치기
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

    const lines = (lineRows || []).map((r, idx) => {
      const requestQty = r.requestQty ?? r.releaseQty ?? 0;
      const shippedQty = r.shippedQty ?? 0;

      return {
        no: idx + 1, // 라인 번호는 프론트에서 seq로
        productCode: r.product_code,
        productName: r.product_name,
        type: r.product_type,
        spec: r.spec,
        unit: r.unit,

        orderQty: r.order_qty || 0,
        requestQty,
        shippedQty,
        remainingQty: Math.max(0, requestQty - shippedQty),

        stockQty: r.current_stock ?? 0,
        dueDate: r.due_date,
      };
    });

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
 * =========================== */
async function getForwardingCheckList(params = {}) {
  const {
    releaseNo = "",
    productName = "",
    productCode = "",
    qtyFrom = "",
    qtyTo = "",
    dateFrom = "",
    dateTo = "",
    manager = "",
    client = "",
  } = params;

  const where = [];
  const having = [];
  const values = [];
  const havingValues = [];

  // 출고번호
  if (releaseNo) {
    where.push("orq.out_req_code LIKE ?");
    values.push(`%${releaseNo}%`);
  }

  // 🔹 제품 조건: "이 출고요청에 이 제품이 하나라도 포함되어 있냐?"
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

  // 출고요청 수량 범위 (출고번호 단위 합계 기준)
  if (qtyFrom !== "" && qtyFrom != null) {
    having.push("SUM(ord.out_req_d_amount) >= ?");
    havingValues.push(Number(qtyFrom));
  }
  if (qtyTo !== "" && qtyTo != null) {
    having.push("SUM(ord.out_req_d_amount) <= ?");
    havingValues.push(Number(qtyTo));
  }

  // 출고요청일
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
  const havingSQL = having.length ? `HAVING ${having.join(" AND ")}` : "";

  const listSql = fwdSQL.SELECT_FORWARDING_CHECK_LIST.replace(
    "/*WHERE*/",
    whereSQL
  ).replace("/*HAVING*/", havingSQL);

  const conn = await db.getConnection();
  try {
    const rows = await conn.query(listSql, [...values, ...havingValues]);
    console.log("[getForwardingCheckList] rows.length =", rows.length);

    // 👉 여기 rows 는 이제 "출고번호 1건당 1행" 형태
    // 프론트에서 그대로:
    //  - releaseNo, releaseDate,
    //  - firstProductName, productCount,
    //  - requestedQty, shippedQty, remainingQty,
    //  - manager, client, status, statusCode
    return rows;
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

/* ===========================
 *  실출고 생성 (poutbnd_tbl)
 *  라우터: POST /api/release/fwd/outbound
 *  payload:
 *    header: { releaseCode, releaseDate, orderCode, registrant, ... }
 *    lines:  [{ productCode, orderQty, releaseQty, stockQty, dueDate, ... }]
 * =========================== */
async function createOutboundRelease({ header, lines }) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const { releaseCode, releaseDate, orderCode, registrant } = header;

    if (!releaseCode) {
      throw new Error(
        "releaseCode(out_req_code) is required for createOutboundRelease."
      );
    }
    if (!orderCode) {
      throw new Error("orderCode is required for createOutboundRelease.");
    }
    if (!registrant) {
      throw new Error(
        "registrant(mcode) is required for createOutboundRelease."
      );
    }

    // 출고할 라인(출고수량 > 0)만 필터
    const validLines = (lines || []).filter(
      (l) => l.releaseQty && Number(l.releaseQty) > 0
    );
    if (!validLines.length) {
      throw new Error(
        "출고수량이 0입니다. 최소 1개 이상의 출고수량이 필요합니다."
      );
    }

    // 출고요청 코드 기준으로 주문/거래처 다시 확인
    const relRows = await conn.query(fwdSQL.SELECT_RELEASE_ORDER_CLIENT, [
      releaseCode,
    ]);

    if (!relRows || relRows.length === 0) {
      throw new Error(
        `출고요청 코드 ${releaseCode} 에 해당하는 주문 정보를 찾을 수 없습니다.`
      );
    }

    const { ord_code, client_code } = relRows[0];

    if (ord_code !== orderCode) {
      throw new Error(
        `헤더의 orderCode(${orderCode}) 와 출고요청의 주문코드(${ord_code})가 일치하지 않습니다.`
      );
    }

    const clientCode = client_code;
    const outDate = releaseDate || new Date();

    const insertedCodes = [];

    for (const line of validLines) {
      const qty = Number(line.releaseQty) || 0;
      const stockQty = Number(line.stockQty ?? line.currentStock ?? 0);

      if (qty <= 0) continue;

      // 🔹 1) 이 출고요청 + 제품 기준으로 "요청/누적출고/남은수량" 조회
      const summaryRows = await conn.query(fwdSQL.SELECT_RELEASE_LINE_SUMMARY, [
        releaseCode,
        line.productCode,
        releaseCode,
        line.productCode,
      ]);

      if (!summaryRows || summaryRows.length === 0) {
        throw new Error(
          `출고요청 ${releaseCode} 에 제품 ${line.productCode} 에 대한 요청 정보가 없습니다.`
        );
      }

      const summary = summaryRows[0];
      const requestedQty = Number(summary.requestedQty) || 0;
      const shippedQty = Number(summary.shippedQty) || 0;
      const remainingQty = Number(summary.remainingQty) || 0;

      // 🔹 2) 재고/남은요청 수량 검증
      if (qty > remainingQty) {
        throw new Error(
          `제품(${line.productCode})의 출고수량이 남은 요청수량을 초과했습니다. (출고: ${qty}, 남은요청: ${remainingQty})`
        );
      }

      if (qty > stockQty) {
        throw new Error(
          `제품(${line.productCode})의 출고수량이 재고수량을 초과했습니다. (출고: ${qty}, 재고: ${stockQty})`
        );
      }

      const newShippedTotal = shippedQty + qty;

      // 🔹 3) 이번 출고 이후 상태코드 결정 (0Q)
      // q1: 출고 대기 (실제론 출고 안 했을 때만)
      // q2: 부분 출고 (누적 < 요청)
      // q3: 출고 완료 (누적 == 요청)
      let lineStatus = "q2";
      if (newShippedTotal >= requestedQty) {
        lineStatus = "q3";
      } else if (newShippedTotal <= 0) {
        lineStatus = "q1";
      }

      // 🔹 4) 실출고 코드 자동채번
      const poutCodeRows = await conn.query(fwdSQL.GENERATE_POUTBND_CODE);
      const poutbndCode = poutCodeRows[0].poutbnd_code;

      const deadline = line.dueDate || outDate;
      const lotNum = null; // lot 관리 나중에 붙이면 여기 수정

      await conn.query(fwdSQL.INSERT_POUTBND, [
        poutbndCode, // poutbnd_code
        qty, // req_qtt  (이번 요청 기준 수량)
        qty, // outbnd_qtt
        deadline, // deadline
        lineStatus, // stat (0Q: q2 or q3)
        releaseCode, // outbound_request_code
        lotNum, // lot_num
        line.productCode, // prod_code
        clientCode, // client_code
        registrant, // mcode
      ]);

      insertedCodes.push(poutbndCode);
    }

    await conn.commit();

    return {
      releaseCode,
      orderCode,
      clientCode,
      poutbndCodes: insertedCodes,
      message: "실출고가 성공적으로 처리되었습니다.",
    };
  } catch (err) {
    await conn.rollback();
    console.error("[createOutboundRelease] error:", err);
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
  createOutboundRelease,
};
