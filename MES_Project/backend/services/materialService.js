const { getConnection, query } = require("../database/mapper");
const sqlList = require("../database/sqlList");

// [재고 목록 조회]
const getStockList = async (params) => {
  let conn = null;
  try {
    let sql = sqlList.stockList;
    const values = [];

    // 1. 키워드 검색
    if (params.keyword) {
      sql += ` AND (m.mat_name LIKE ? OR m.mat_code LIKE ?)`;
      values.push(`%${params.keyword}%`, `%${params.keyword}%`);
    }

    // 2. 분류 필터 (한글명 '원자재' -> 공통코드 매핑 필요)
    if (params.type && params.type !== "ALL") {
      // common_code 테이블의 note 컬럼(원자재, 부자재)과 비교
      sql += ` AND m.material_type_code = (SELECT com_value FROM common_code WHERE note = ?)`;
      values.push(params.type);
    }

    // 3. 상태 필터 (status는 Alias 컬럼이므로 HAVING 절 사용)
    if (params.status && params.status !== "ALL") {
      sql += ` HAVING status = ?`;
      values.push(params.status);
    }

    sql += ` ORDER BY m.mat_code ASC`;

    conn = await getConnection();
    const rows = await conn.query(sql, values);

    return Array.isArray(rows) ? rows : rows.slice(0, rows.length);
  } catch (err) {
    console.error("Material Stock List Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// [재고 상세 조회] (이전과 동일하지만 SQL이 수정되어 정상 작동함)
const getStockDetail = async (matCode) => {
  let conn = null;
  try {
    conn = await getConnection();

    const baseRows = await conn.query(sqlList.stockBasicInfo, [matCode]);

    if (!baseRows || baseRows.length === 0) return null;
    const baseInfo = Array.isArray(baseRows) ? baseRows[0] : baseRows;

    const detailRows = await conn.query(sqlList.stockDetailBySupplier, [
      matCode,
    ]);
    const historyRows = await conn.query(sqlList.stockHistory, [
      matCode,
      matCode,
    ]);

    return {
      ...baseInfo,
      details: Array.isArray(detailRows) ? detailRows : [],
      history: Array.isArray(historyRows) ? historyRows : [],
    };
  } catch (err) {
    console.error("Material Detail Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getStockList,
  getStockDetail,
};
