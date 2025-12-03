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
    let { purchase_code, stat, regdate, note, mcode } = header;

    stat = stat || "요청완료";
    regdate = regdate || new Date().toISOString().split("T")[0];

    // 1) purchase_code 없으면 새 번호 생성
    if (!purchase_code) {
      const rows = await conn.query(
        "SELECT IFNULL(MAX(purchase_code), 0) AS max_code FROM mpo_tbl"
      );
      const nextCode = (rows[0]?.max_code || 0) + 1;
      purchase_code = nextCode;

      // 헤더 INSERT
      await conn.query(sqlList.insertPoHeader, [
        purchase_code,
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
      "SELECT IFNULL(MAX(mpo_d_code), 0) AS max_dcode FROM mpo_d_tbl"
    );
    let nextDetailCode = (dRows[0]?.max_dcode || 0) + 1;

    if (Array.isArray(items)) {
      for (const item of items) {
        // 완전 빈 줄은 건너뛰기
        if (!item.unit && !item.needQty && !item.dueDate && !item.vendor) {
          continue;
        }

        const today = new Date().toISOString().split("T")[0];

        await conn.query(sqlList.insertPoDetail, [
          nextDetailCode++, // mpo_d_code
          item.unit, // unit
          item.needQty || 0, // req_qtt
          item.dueDate || today, // deadline
          purchase_code, // fk
          item.vendor || "CLIENT-001", // client_code
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

module.exports = {
  getPoByCode,
  savePo,
};
