const { getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

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
    let { purchase_code, purchase_req_date, stat, regdate, note, mcode } =
      header;

    stat = stat || "요청완료";
    regdate = regdate || new Date().toISOString().split("T")[0];

    // 1) purchase_code 없으면 새 번호 생성
    if (!purchase_code) {
      const rows = await conn.query(
        `
    SELECT IFNULL(
             MAX(CAST(SUBSTRING(purchase_code, 3) AS UNSIGNED)),
             0
           ) AS max_seq
    FROM mpo_tbl
    WHERE purchase_code LIKE 'BJ%'
    `
      );

      const nextSeq = (rows[0]?.max_seq || 0) + 1;

      // BJ + 4자리 패딩
      purchase_code = "BJ" + String(nextSeq).padStart(4, "0");

      // 헤더 INSERT
      await conn.query(sqlList.insertPoHeader, [
        purchase_code,
        purchase_req_date,
        stat,
        regdate,
        note || null,
        mcode,
      ]);
    } else {
      // 수정 모드라면 UPDATE + 상세 삭제
      await conn.query(sqlList.updatePoHeader, [
        stat,
        regdate,
        note || null,
        mcode,
        purchase_code,
      ]);
      await conn.query(sqlList.deletePoDetailsByCode, [purchase_code]);
    }

    // 2) 상세 코드(mpo_d_code)도 직접 채우기
    const dRows = await conn.query(
      `
  SELECT IFNULL(
           MAX(CAST(SUBSTRING(mpo_d_code, 4) AS UNSIGNED)),
           0
         ) AS max_seq
  FROM mpo_d_tbl
  WHERE mpo_d_code LIKE 'BJd%'
  `
    );
    let nextDetailSeq = (dRows[0]?.max_seq || 0) + 1;

    if (Array.isArray(items)) {
      for (const item of items) {
        // 완전 빈 줄은 건너뛰기
        if (!item.unit && !item.needQty && !item.dueDate && !item.vendor) {
          continue;
        }

        const today = new Date().toISOString().split("T")[0];
        const detailCode = "BJd" + String(nextDetailSeq++).padStart(4, "0");

        await conn.query(sqlList.insertPoDetail, [
          detailCode,
          item.unit, // unit
          item.needQty || item.req_qtt || 0, // req_qtt
          item.dueDate || today, // deadline
          purchase_code, // fk
          item.vendor || "CLIENT-001", // client_code
          item.code || "MAT-0001", // mat_code
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

    // 2. 헤더 삭제
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
      "SELECT IFNULL(MAX(mpr_code), 'PRQ0000') AS max_code FROM mpr_tbl"
    );
    const maxCode = rows[0]?.max_code || "PRQ0000";

    // 'PRQ0007' → 7
    const num = parseInt(maxCode.replace(/^PRQ/, ""), 10) || 0;
    const nextNum = num + 1;

    const nextCode = "PRQ" + String(nextNum).padStart(4, "0"); // PRQ0001

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
      "SELECT IFNULL(MAX(mpr_d_code), 'PRQd0000') AS max_code FROM mpr_d_tbl"
    );
    const maxCode = rows[0]?.max_code || "PRQd0000";

    let num = parseInt(maxCode.replace(/^PRQd/, ""), 10) || 0;

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

        num += 1;
        const detailCode = "PRQd" + String(num).padStart(4, "0"); // PRQd0001

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
};
