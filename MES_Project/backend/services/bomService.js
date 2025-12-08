const { getConnection, query } = require("../database/mapper.js");
const sql = require("../database/sqls/bom.js");
const ExcelJS = require("exceljs");

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

/** 🔥 BOM 저장 (삭제 + 업데이트 + 추가 처리 포함) */
const saveBomMaterials = async (bom_code, materials, deleted = []) => {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    /** 1) 삭제 수행 */
    if (deleted.length > 0) {
      for (const matCode of deleted) {
        await conn.query(sql.deleteBomMat, [bom_code, matCode]);
      }
    }

    /** 2) 기존 mat_code 목록 조회 */
    const oldRows = await conn.query(
      "SELECT mat_code FROM bom_mat WHERE bom_code = ?",
      [bom_code]
    );
    const oldSet = new Set(oldRows.map((r) => r.mat_code));

    /** 3) INSERT / UPDATE 수행 */
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

const bomExcelDownload = async () => {
  const workbook = new ExcelJS.Workbook();

  // ============================
  // 시트 1 : 제품 목록
  // ============================
  const sheet1 = workbook.addWorksheet("BOM");
  sheet1.columns = [
    { header: "품목코드", key: "prod_code", width: 15 },
    { header: "품목명", key: "prod_name", width: 30 },
    { header: "유형", key: "prod_type", width: 15 },
    { header: "사용여부", key: "is_used", width: 10 },
    { header: "등록일자", key: "regdate", width: 15 },
    { header: "유통기한", key: "edate", width: 15 },
  ];

  const prodList = await query("bomProducts");
  sheet1.addRows(prodList);

  // ============================
  // 시트 2 : 하위자재 전체
  // ============================
  const sheet2 = workbook.addWorksheet("하위자재");
  sheet2.columns = [
    { header: "품목코드", key: "prod_code", width: 15 },
    { header: "BOM 코드", key: "bom_code", width: 20 },
    { header: "자재코드", key: "mat_code", width: 15 },
    { header: "자재명", key: "mat_name", width: 28 },
    { header: "유형", key: "mat_type", width: 10 },
    { header: "수량", key: "req_qtt", width: 10 },
    { header: "단위", key: "unit", width: 10 },
    { header: "로스율", key: "loss_rate", width: 10 },
  ];

  const matList = await query("all_bom_mat");
  sheet2.addRows(matList);

  // ============================
  // 헤더 스타일
  // ============================
  [sheet1, sheet2].forEach((sheet) => {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4BACC6" },
    };
  });

  return workbook;
};

module.exports = {
  getBomList,
  getBomMatList,
  prodSelect,
  searchBom,
  allBomMatList,
  saveBomMaterials,
  bomExcelDownload,
};
