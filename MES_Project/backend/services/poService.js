const { getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

function safeJSON(v) {
  return JSON.parse(
    JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x))
  );
}

// 단일 발주 조회
async function getPoByCode(purchaseCode) {
  const conn = await getConnection();
  try {
    const headerRows = await conn.query(sqlList.selectPoHeaderByCode, [
      purchaseCode,
    ]);

    if (!headerRows.length) {
      return null;
    }

    const header = headerRows[0];

    const detailRows = await conn.query(sqlList.selectPoDetailsByCode, [
      purchaseCode,
    ]);

    return {
      header,
      items: detailRows,
    };
  } finally {
    conn.release();
  }
}

// 발주 저장 (신규/수정 공통)
async function savePo(poDto) {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const { header, items } = poDto;
    if (!header) {
      throw new Error("header 데이터가 없습니다.");
    }

    let {
      purchase_code,
      purchase_req_date,
      stat,
      regdate,
      note,
      mcode,
      mpr_code,
    } = header;

    const today = new Date().toISOString().split("T")[0];

    // 기본값 처리
    stat = stat || "c1";
    regdate = regdate || today;
    purchase_req_date = purchase_req_date || today;

    const isNew = !purchase_code;

    if (isNew) {
      const rows = await conn.query(
        `
        SELECT
          CONCAT(
            'BJ',
            LPAD(
              IFNULL(MAX(CAST(SUBSTRING(purchase_code, 3) AS UNSIGNED)), 0) + 1,
              4,
              '0'
            )
          ) AS next_code
        FROM mpo_tbl
        WHERE purchase_code LIKE 'BJ%';
        `
      );

      purchase_code = rows[0]?.next_code || "BJ0001";

      await conn.query(sqlList.insertPoHeader, [
        purchase_code,
        purchase_req_date,
        stat,
        regdate,
        note || null,
        mcode,
      ]);

      if (mpr_code) {
        const mapRows = await conn.query(
          `
          SELECT
            CONCAT(
              'MAP',
              LPAD(
                IFNULL(MAX(CAST(SUBSTRING(mapp_code, 4) AS UNSIGNED)), 0) + 1,
                4,
                '0'
              )
            ) AS next_code
          FROM mpr_mapp_tbl
          WHERE mapp_code LIKE 'MAP%';
          `
        );

        const mapp_code = mapRows[0]?.next_code || "MAP0001";

        await conn.query(sqlList.insertMprMap, [
          mapp_code,
          mpr_code,
          purchase_code,
        ]);
      }
    } else {
      await conn.query(sqlList.updatePoHeader, [
        stat,
        regdate,
        note || null,
        mcode,
        purchase_code,
      ]);

      await conn.query(sqlList.deletePoDetailsByCode, [purchase_code]);
    }

    let localSeq = 0;

    if (Array.isArray(items) && items.length) {
      for (const item of items) {
        const hasValue =
          item.unit ||
          item.needQty ||
          item.req_qtt ||
          item.dueDate ||
          item.vendorCode ||
          item.vendor ||
          item.code ||
          item.mat_code;

        if (!hasValue) continue;

        // 발주별 0001, 0002... 로 번호 부여
        localSeq += 1;
        const detailCode = `${purchase_code}-${String(localSeq).padStart(
          4,
          "0"
        )}`;

        const unit = item.unit || null;

        const needQty =
          item.needQty !== undefined &&
          item.needQty !== null &&
          item.needQty !== ""
            ? Number(item.needQty)
            : item.req_qtt !== undefined &&
              item.req_qtt !== null &&
              item.req_qtt !== ""
            ? Number(item.req_qtt)
            : 0;

        const deadline = item.dueDate || today;

        let clientCode = item.vendorCode || item.client_code || null;
        if (!clientCode) {
          if (item.vendor && /^[A-Z]+-\d+$/.test(item.vendor)) {
            clientCode = item.vendor;
          } else {
            clientCode = "CLIENT-001";
          }
        }

        const matCode = item.code || item.mat_code || "MAT-0001";

        await conn.query(sqlList.insertPoDetail, [
          detailCode,
          unit,
          needQty,
          deadline,
          purchase_code,
          clientCode,
          matCode,
        ]);
      }
    }

    await conn.commit();
    return { purchase_code };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 발주서 목록 조회
async function getPoList(purchaseCode) {
  let conn;
  try {
    conn = await getConnection();

    const keyword =
      purchaseCode && String(purchaseCode).trim()
        ? String(purchaseCode).trim()
        : null;

    const rows = await conn.query(sqlList.selectPoList, [keyword, keyword]);
    return rows;
  } catch (err) {
    console.error("getPoList error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// 자재 목록 조회 / 모달
async function getMateList(keyword) {
  let conn;
  try {
    conn = await getConnection();

    const k = keyword && String(keyword).trim() ? String(keyword).trim() : null;

    const rows = await conn.query(sqlList.selectMateList, [k, k, k]);
    return rows;
  } catch (err) {
    console.error("getMateList error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

//발주 삭제
async function deletePo(purchaseCode) {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1. 상세 먼저 삭제
    await conn.query(sqlList.deletePoDetailsByCode, [purchaseCode]);

    // 2. 매핑 테이블 삭제 (mpr_mapp_tbl)
    await conn.query(sqlList.deleteMprMappByPurchaseCode, [purchaseCode]);

    // 3. 헤더 삭제
    await conn.query(sqlList.deletePoHeaderByCode, [purchaseCode]);

    await conn.commit();

    return { purchase_code: purchaseCode };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 발주 자재별 목록 조회
async function getPoListFlat(purchaseCode) {
  let conn;
  try {
    conn = await getConnection();

    const keyword =
      purchaseCode && String(purchaseCode).trim()
        ? String(purchaseCode).trim()
        : null;

    const rows = await conn.query(sqlList.selectPoListFlat, [keyword, keyword]);
    return rows;
  } catch (err) {
    console.error("getPoListFlat error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

//구매 요청 코드 pk 가져오기
async function getNextReqCode() {
  const conn = await getConnection();
  try {
    const rows = await conn.query(
      `SELECT IFNULL(MAX(mpr_code), 'PRQ0000') AS max_code
   FROM mpr_tbl
   WHERE mpr_code LIKE 'PRQ%'`
    );
    const maxCode = rows[0]?.max_code || "PRQ0000";

    const num = parseInt(maxCode.substring(3), 10) || 0;

    const nextCode = "PRQ" + String(num + 1).padStart(4, "0");

    return nextCode;
  } finally {
    conn.release();
  }
}

//직원 부서명
async function getDeptByEmpCode(empCode) {
  const conn = await getConnection();
  try {
    const rows = await conn.query(sqlList.selectDeptName, [empCode]);

    return rows[0]?.deptName || null;
  } finally {
    conn.release();
  }
}

// 자재 구매 요청 저장
async function saveMpr(mprDto) {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const { header, items } = mprDto;
    if (!header) {
      throw new Error("header 데이터가 없습니다.");
    }

    let { mpr_code, reqdate, deadline, mrp_code, mcode } = header;

    if (!mpr_code) {
      throw new Error("요청번호(mpr_code)가 없습니다.");
    }

    // 기본값 처리
    const today = new Date().toISOString().split("T")[0];
    reqdate = reqdate || today;
    deadline = deadline || null;
    mrp_code = mrp_code || "MRP-20250624-001"; // 나중에 수정
    mcode = mcode || null;

    await conn.query(sqlList.insertMprHeader, [
      mpr_code,
      reqdate,
      deadline,
      mrp_code,
      mcode,
    ]);

    const rows = await conn.query(
      `SELECT IFNULL(MAX(mpr_d_code), 'PRQd0000') AS max_code
     FROM mpr_d_tbl
     WHERE mpr_d_code LIKE 'PRQd%'`
    );
    const maxCode = rows[0]?.max_code || "PRQd0000";

    const num = parseInt(maxCode.substring(4), 10) || 0;

    let nextNum = num;
    // 상세 저장
    if (Array.isArray(items)) {
      for (const item of items) {
        // 완전 빈 줄은 스킵
        if (
          !item.mat_code &&
          !item.req_qtt &&
          !item.unit &&
          !item.mat_sup &&
          !item.note
        ) {
          continue;
        }

        nextNum += 1;
        const detailCode = "PRQd" + String(nextNum).padStart(4, "0");

        const req_qtt = item.req_qtt ? Number(item.req_qtt) : 0;
        const unit = item.unit || null;
        const note = item.note || null;
        const mat_sup = item.mat_sup || null;
        const mat_code = item.mat_code || null;

        await conn.query(sqlList.insertMprDetail, [
          detailCode,
          req_qtt,
          unit,
          note,
          mpr_code,
          mat_sup,
          mat_code,
        ]);
      }
    }

    await conn.commit();

    return { mpr_code };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 자재 구매요청서 목록 조회
async function getMprList(mprCode) {
  const conn = await getConnection();
  try {
    const keyword =
      mprCode && String(mprCode).trim() ? String(mprCode).trim() : null;

    const rows = await conn.query(sqlList.selectMprList, [keyword, keyword]);
    return rows;
  } finally {
    conn.release();
  }
}

// 자재 구매요청서 단건 조회 (헤더 + 상세)
async function getMprByCode(mprCode) {
  const conn = await getConnection();
  try {
    const headerRows = await conn.query(sqlList.selectMprHeaderByCode, [
      mprCode,
    ]);

    if (!headerRows.length) {
      return null;
    }

    const header = headerRows[0];

    const detailRows = await conn.query(sqlList.selectMprDetailsByCode, [
      mprCode,
    ]);

    return {
      header,
      items: detailRows,
    };
  } finally {
    conn.release();
  }
}

// 공급업체 목록
async function getClientList(keyword) {
  const conn = await getConnection();
  try {
    let sql = sqlList.selectClientList;

    const params = [];

    // 검색어가 있을 때
    if (keyword) {
      sql += `
        AND (
          client_code LIKE ?
          OR client_name LIKE ?
        )
      `;
      params.push(`%${keyword}%`);
      params.push(`%${keyword}%`);
    }

    sql += " ORDER BY client_code ASC";

    const rows = await conn.query(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

async function getMprRequestItemList() {
  const conn = await getConnection();
  try {
    const rows = await conn.query(sqlList.getMprRequestItemList);
    return rows;
  } finally {
    conn.release();
  }
}
// 요청 상세 헤더
async function getMprDetailHeader(mprCode) {
  const conn = await getConnection();
  try {
    const rows = await conn.query(sqlList.selectMprDetailHeader, [mprCode]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

// 요청상세 아이템 + 상태 이력
async function getMprDetailItems(mprCode) {
  const conn = await getConnection();
  try {
    const rows = await conn.query(sqlList.selectMprDetailItems, [mprCode]);
    const historyRows = await conn.query(sqlList.getMprHistory, [
      mprCode,
      mprCode,
    ]);

    return {
      items: rows || [],
      history: historyRows || [],
    };
  } finally {
    conn.release();
  }
}

//작성자 목록 조회
async function getEmpList(keyword = "") {
  const conn = await getConnection();
  try {
    let query = sqlList.selectEmpListBase;
    const params = [];

    if (keyword) {
      const like = `%${keyword}%`;
      query += `
        WHERE 
          e.emp_code LIKE ?
          OR e.emp_name LIKE ?
          OR d.dept_name LIKE ?`;
      params.push(like, like, like);
    }

    query += " ORDER BY e.emp_code";

    const rows = await conn.query(query, params);
    return safeJSON(rows);
  } finally {
    conn.release();
  }
}

// 발주완료 제외 요청서 목록
async function getMprListForPo(mprCode) {
  const conn = await getConnection();
  try {
    const rows = await conn.query(sqlList.selectMprListForPo, [
      mprCode || null,
      mprCode || null,
    ]);
    return rows || [];
  } finally {
    conn.release();
  }
}

module.exports = {
  getPoByCode,
  savePo,
  getPoList,
  getMateList,
  deletePo,
  getPoListFlat,
  getNextReqCode,
  getDeptByEmpCode,
  saveMpr,
  getMprList,
  getMprByCode,
  getClientList,
  getMprRequestItemList,
  getMprDetailHeader,
  getMprDetailItems,
  getEmpList,
  getMprListForPo,
};
