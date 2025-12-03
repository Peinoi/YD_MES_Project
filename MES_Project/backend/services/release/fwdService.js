// MES_Project/backend/services/release/fwdService.js
const db = require("../../database/mapper.js");
const fwdSQL = require("../../database/sqlList.js");

/* ===========================
 *  주문 관련 서비스
 * =========================== */

/**
 * 주문 목록 조회 (모달용)
 * 라우터: GET /api/release/fwd/orders
 */
async function getOrderList(params) {
  const {
    keyword = "",
    fromDate = "",
    toDate = "",
    client = "",
    status = "",
  } = params;

  const conn = await db.getConnection();

  try {
    const where = [];
    const values = [];

    if (keyword) {
      where.push(
        `(o.order_no LIKE ? OR o.order_name LIKE ? OR c.client_name LIKE ?)`
      );
      const like = `%${keyword}%`;
      values.push(like, like, like);
    }

    if (fromDate) {
      where.push(`o.order_date >= ?`);
      values.push(fromDate);
    }

    if (toDate) {
      where.push(`o.order_date <= ?`);
      values.push(toDate);
    }

    if (client) {
      where.push(`c.client_name LIKE ?`);
      values.push(`%${client}%`);
    }

    if (status) {
      where.push(`o.status = ?`);
      values.push(status);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const listSql = fwdSQL.SELECT_ORDER_LIST.replace("/*WHERE*/", whereSQL);
    const [rows] = await conn.query(listSql, values);

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
    // 헤더
    const [headerRows] = await conn.query(fwdSQL.SELECT_ORDER_HEADER, [
      orderNo,
    ]);
    if (!headerRows.length) return null;

    const header = headerRows[0];

    // 라인(아이템)
    const [itemRows] = await conn.query(fwdSQL.SELECT_ORDER_ITEMS, [orderNo]);

    return {
      header: {
        orderNo: header.order_no,
        orderDate: header.order_date,
        client: header.client_name,
        dueDate: header.due_date,
        status: header.status,
        priority: header.priority,
      },
      items: itemRows.map((r) => ({
        productCode: r.product_code,
        productName: r.product_name,
        type: r.product_type,
        spec: r.spec,
        unit: r.unit,
        orderQty: r.order_qty,
        currentStock: r.current_stock,
        notReleasedQty: r.not_released_qty,
        dueDate: r.due_date,
      })),
    };
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
 */
async function getReleaseList(params) {
  const {
    keyword = "",
    fromDate = "",
    toDate = "",
    client = "",
    status = "",
  } = params;

  const conn = await db.getConnection();

  try {
    const where = [];
    const values = [];

    if (keyword) {
      where.push(
        `(r.release_code LIKE ? OR r.order_code LIKE ? OR c.client_name LIKE ?)`
      );
      const like = `%${keyword}%`;
      values.push(like, like, like);
    }

    if (fromDate) {
      where.push(`r.release_date >= ?`);
      values.push(fromDate);
    }

    if (toDate) {
      where.push(`r.release_date <= ?`);
      values.push(toDate);
    }

    if (client) {
      where.push(`c.client_name LIKE ?`);
      values.push(`%${client}%`);
    }

    if (status) {
      where.push(`r.status = ?`);
      values.push(status);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const listSql = fwdSQL.SELECT_RELEASE_LIST.replace("/*WHERE*/", whereSQL);
    const [rows] = await conn.query(listSql, values);

    return rows;
  } finally {
    conn.release();
  }
}

/**
 * 출고전표 상세 조회 (헤더 + 라인)
 * 라우터: GET /api/release/fwd/:releaseCode
 */
async function getReleaseDetail(releaseCode) {
  const conn = await db.getConnection();

  try {
    const [headerRows] = await conn.query(fwdSQL.SELECT_RELEASE_HEADER, [
      releaseCode,
    ]);
    if (!headerRows.length) return null;
    const header = headerRows[0];

    const [lineRows] = await conn.query(fwdSQL.SELECT_RELEASE_LINES, [
      releaseCode,
    ]);

    return {
      header: {
        releaseCode: header.release_code,
        releaseDate: header.release_date,
        orderCode: header.order_code,
        client: header.client_name,
        remark: header.remark,
        status: header.status,
      },
      lines: lineRows.map((r) => ({
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
      })),
    };
  } finally {
    conn.release();
  }
}

/**
 * 출고전표 생성
 * 라우터: POST /api/release/fwd
 */
async function createRelease(payload) {
  const { header, lines } = payload;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) 출고번호 채번 (프로젝트 규칙에 맞게 구현)
    const [codeRows] = await conn.query(fwdSQL.GENERATE_RELEASE_CODE);
    const releaseCode = codeRows[0].release_code;

    // 2) 헤더 저장
    const headerParams = [
      releaseCode,
      header.orderCode,
      header.releaseDate,
      header.client,
      header.registrant,
      header.remark || "",
      header.status || "완료", // 상태 기본값 예시
    ];

    await conn.query(fwdSQL.INSERT_RELEASE_HEADER, headerParams);

    // 3) 라인 저장
    for (const line of lines) {
      const lineParams = [
        releaseCode,
        line.productCode,
        line.orderQty,
        line.releaseQty,
        line.stockQty,
        line.dueDate,
      ];
      await conn.query(fwdSQL.INSERT_RELEASE_LINE, lineParams);

      // 🔸 TODO: 재고 차감 / 주문 미출고수량 업데이트 등의 로직이 필요하면 여기서 추가
      // await conn.query(fwdSQL.UPDATE_STOCK_BY_RELEASE, [line.releaseQty, line.productCode]);
      // await conn.query(fwdSQL.UPDATE_ORDER_NOT_RELEASED_QTY, [line.releaseQty, header.orderCode, line.productCode]);
    }

    await conn.commit();

    return {
      releaseCode,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 출고전표 수정
 * 라우터: PUT /api/release/fwd/:releaseCode
 */
async function updateRelease(releaseCode, payload) {
  const { header, lines } = payload;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) 헤더 수정
    const headerParams = [
      header.releaseDate,
      header.client,
      header.remark || "",
      header.status || "완료",
      releaseCode,
    ];
    await conn.query(fwdSQL.UPDATE_RELEASE_HEADER, headerParams);

    // 2) 기존 라인 삭제 후 재입력 (간단하게 가는 방식)
    await conn.query(fwdSQL.DELETE_RELEASE_LINES, [releaseCode]);

    for (const line of lines) {
      const lineParams = [
        releaseCode,
        line.productCode,
        line.orderQty,
        line.releaseQty,
        line.stockQty,
        line.dueDate,
      ];
      await conn.query(fwdSQL.INSERT_RELEASE_LINE, lineParams);

      // 🔸 TODO: 재고/주문 상태 재조정 필요 시 이 부분 구현
    }

    await conn.commit();

    return {
      releaseCode,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 출고전표 삭제 (또는 취소 처리)
 * 라우터: DELETE /api/release/fwd/:releaseCode
 */
async function deleteRelease(releaseCode) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 🔹 실제 삭제가 싫으면 UPDATE 로 상태만 '취소' 처리하는 SQL을 만들어도 됨
    await conn.query(fwdSQL.DELETE_RELEASE_LINES, [releaseCode]);
    const [result] = await conn.query(fwdSQL.DELETE_RELEASE_HEADER, [
      releaseCode,
    ]);

    await conn.commit();

    return {
      affectedRows: result.affectedRows,
    };
  } catch (err) {
    await conn.rollback();
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
};
