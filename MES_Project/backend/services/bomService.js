const { getConnection, query } = require("../database/mapper.js");
const sql = require("../database/sqls/bom.js");

/** 전체 BOM 제품 조회 */
const getBomList = async () => {
  return await query("bomProducts");
};

/** 선택한 제품의 BOM 자재 목록 */
const getBomMatList = async (prodCode) => {
  return await query("bom_mat", [prodCode]);
};

/** 제품 선택 모달용 목록 */
const prodSelect = async () => {
  return await query("prodSelect");
};

/** BOM 검색 */
const searchBom = async (conditions) => {
  const { itemCode, itemName, startDate, endDate, useYn } = conditions;

  let sqlQuery = sql.prod_filter;
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

  const conn = await getConnection();
  try {
    return await conn.query(sqlQuery, params);
  } finally {
    conn.release();
  }
};

/** 제품 + 자재 통합 목록 */
const allBomMatList = async () => {
  return await query("select_bom_mat");
};

/** 🔥 BOM 저장 (엑셀처럼 overwrite 하는 방식) */
const saveBomMaterials = async (bom_code, materials) => {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    // 기존 mat_code 목록 조회
    const oldRows = await conn.query(
      "SELECT mat_code FROM bom_mat WHERE bom_code = ?",
      [bom_code]
    );
    const oldSet = new Set(oldRows.map((r) => r.mat_code));

    // INSERT / UPDATE
    for (const m of materials) {
      if (oldSet.has(m.mat_code)) {
        // UPDATE
        await conn.query(sql.updateBomMat, [
          m.mat_name,
          m.mat_type,
          m.req_qtt,
          m.unit,
          m.loss_rate,
          bom_code,
          m.mat_code,
        ]);
      } else {
        // INSERT
        await conn.query(sql.insertBomMat, [
          m.mat_code,
          bom_code,
          m.mat_name,
          m.mat_type,
          m.req_qtt,
          m.unit,
          m.loss_rate,
        ]);
      }
    }

    await conn.commit();
    return { message: "BOM 저장 완료" };
  } catch (err) {
    await conn.rollback();
    console.error("saveBomMaterials ERROR:", err);
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  getBomList,
  getBomMatList,
  prodSelect,
  searchBom,
  allBomMatList,
  saveBomMaterials,
};
