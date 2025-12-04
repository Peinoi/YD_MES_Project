const { getConnection, query } = require("../database/mapper.js");
const sql = require("../database/sqls/bom.js"); // 🔹 bom.js import

/** 전체 BOM 제품 조회 (그대로 둬도 됨) */
const getBomList = async () => {
  try {
    const rows = await query("bomProducts", []); // alias 방식
    return rows;
  } catch (err) {
    console.error("[bomService] getBomList Error:", err);
    throw err;
  }
};
const getBomMatList = async (prodCode) => {
  try {
    const rows = await query("bom_mat", [prodCode]);
    return rows;
  } catch (err) {
    console.error("[bomService] getBomMaterials Error:", err);
    throw err;
  }
};

const prodSelect = async () => {
  try {
    const rows = await query("prodSelect", []); // alias 방식
    return rows;
  } catch (err) {
    console.error("[bomService] getProdSelect Error:", err);
    throw err;
  }
};

/** 🔥 검색용: 동적 WHERE → raw SQL + getConnection 사용 */
const searchBom = async (conditions) => {
  const { itemCode, itemName, startDate, endDate, useYn } = conditions;

  let sqlQuery = sql.prod_filter; // 🔹 bom.js에서 문자열 가져오기
  const params = [];

  if (itemCode) {
    sqlQuery += " AND prod_code LIKE ?";
    params.push(`%${itemCode}%`);
  }

  if (itemName) {
    sqlQuery += " AND prod_name LIKE ?";
    params.push(`%${itemName}%`);
  }

  if (startDate) {
    sqlQuery += " AND regdate >= ?";
    params.push(startDate);
  }

  if (endDate) {
    sqlQuery += " AND regdate <= ?";
    params.push(endDate);
  }

  if (useYn) {
    sqlQuery += " AND is_used = ?";
    params.push(useYn);
  }

  const conn = await getConnection(); // 🔹 여기서 raw query 실행
  try {
    const rows = await conn.query(sqlQuery, params);
    return rows;
  } finally {
    conn.release();
  }
};
const allBomMatList = async () => {
  try {
    const rows = await query("select_bom_mat", []);
    return rows;
  } catch (err) {
    console.error("[bomService] allBomMatList Error:", err);
    throw err;
  }
};

module.exports = {
  getBomList,
  getBomMatList,
  prodSelect,
  searchBom,
  allBomMatList,
};
