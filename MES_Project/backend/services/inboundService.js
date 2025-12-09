const { getConnection, query } = require("../database/mapper");
const sqlList = require("../database/sqlList");

// ID 생성 헬퍼
const generateSeq = (lastCode) => {
  if (!lastCode) return 1;
  const lastSeq = parseInt(lastCode.split("-").pop());
  return lastSeq + 1;
};

// 날짜 포맷 (YYYYMMDD) - ID 생성용
const getTodayStr = () => {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
};

// 날짜 포맷 (YYYY-MM-DD HH:mm:ss) - DB Insert용
const getNowDateTimeStr = () => {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// ... (Read 서비스들 유지) ...
const getMaterialList = async () => query("getMaterialList", []);
const getClientList = async () => query("getSupplierList", []);
const getEmployeeList = async () => query("getEmployeeList", []);

// [Write] 입고 등록
const registerInboundItems = async (items) => {
  console.log("Starting Transaction for Inbound Registration...");
  console.log("Received items:", JSON.stringify(items, null, 2));

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();
    console.log("Transaction started.");

    const todayStr = getTodayStr();

    const lastMinRows = await conn.query(sqlList.getLastMinbndSeq, [todayStr]);
    const lastLotRows = await conn.query(sqlList.getLastLotSeq, [todayStr]);
    const lastQioRows = await conn.query(sqlList.getLastQioSeq, [todayStr]);

    let minSeq = generateSeq(
      lastMinRows[0] ? lastMinRows[0].minbnd_code : null
    );
    let lotSeq = generateSeq(lastLotRows[0] ? lastLotRows[0].lot_num : null);
    let qioSeq = generateSeq(lastQioRows[0] ? lastQioRows[0].qio_code : null);

    const lotDataList = [];
    const inboundDataList = [];
    const qioDataList = [];

    console.log("Preparing data lists...");
    for (const item of items) {
      const seqStr = String(minSeq++).padStart(3, "0");
      const lotSeqStr = String(lotSeq++).padStart(3, "0");

      const newMinbndCode = `MIN-${todayStr}-${seqStr}`;
      const matTypePrefix = item.mat_type_code || "100";
      const newLotNum = `LOT-${matTypePrefix}-${todayStr}-${lotSeqStr}`;
      const nowDateTime = getNowDateTimeStr();

      lotDataList.push([newLotNum, nowDateTime, "i4", item.matCode]);

      let finalQioCode = item.qioCode;
      if (!finalQioCode) {
        const qioSeqStr = String(qioSeq++).padStart(3, "0");
        finalQioCode = `QIO-${todayStr}-${qioSeqStr}`;
        
        qioDataList.push([
          finalQioCode,
          new Date(), // insp_date
          item.manager, // emp_code
        ]);
      }
      
      inboundDataList.push([
        newMinbndCode,
        item.matCode,
        "i4",
        item.unit,
        Number(item.inQty),
        item.inboundDate,
        Number(item.inQty),
        finalQioCode,
        newLotNum,
        item.client,
        item.manager,
      ]);
    }
    console.log("Data preparation complete.");
    console.log("Prepared qioDataList:", JSON.stringify(qioDataList, null, 2));
    console.log("Prepared lotDataList:", JSON.stringify(lotDataList, null, 2));
    console.log("Prepared inboundDataList:", JSON.stringify(inboundDataList, null, 2));

    // 3. 실행 (batch 사용) - 순서 보장 및 개별 로깅
    try {
      if (lotDataList.length > 0) {
        console.log("Executing batch insert for mat_lot_tbl...");
        await conn.batch(sqlList.insertMatLot, lotDataList);
        console.log("Batch insert for mat_lot_tbl SUCCEEDED.");
      }
    } catch (err) {
      console.error("Batch insert for mat_lot_tbl FAILED:", err);
      throw err;
    }

    try {
      if (qioDataList.length > 0) {
        console.log("Executing batch insert for qio_tbl...");
        await conn.batch(sqlList.insertQio, qioDataList);
        console.log("Batch insert for qio_tbl SUCCEEDED.");
      }
    } catch (err) {
      console.error("Batch insert for qio_tbl FAILED:", err);
      throw err;
    }

    try {
      if (inboundDataList.length > 0) {
        console.log("Executing batch insert for minbnd_tbl...");
        await conn.batch(sqlList.insertMinbnd, inboundDataList);
        console.log("Batch insert for minbnd_tbl SUCCEEDED.");
      }
    } catch (err) {
      console.error("Batch insert for minbnd_tbl FAILED:", err);
      throw err;
    }

    await conn.commit();
    console.log("Transaction committed.");

    return {
      success: true,
      message: `${inboundDataList.length}건 입고 등록 완료`,
    };
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Inbound Transaction Error:", err);
    throw new Error(`입고 등록 실패: ${err.message}`);
  } finally {
    if (conn) conn.release();
  }
};

// 입출고내역 조회
const getHistoryList = async (params) => {
  try {
    let sql = sqlList.getHistoryList; // 위에서 정의한 기본 쿼리
    const values = [];

    // 2. 동적 쿼리 조립
    if (params.startDate && params.endDate) {
      sql += " AND procDate BETWEEN ? AND ?";
      values.push(params.startDate, params.endDate);
    }

    if (params.type && params.type !== "ALL") {
      sql += " AND type = ?";
      values.push(params.type);
    }

    if (params.keyword) {
      sql += " AND (matCode LIKE ? OR matName LIKE ?)";
      values.push(`%${params.keyword}%`, `%${params.keyword}%`);
    }

    if (params.status) {
      sql += " AND status = ?";
      values.push(params.status);
    }

    sql += " ORDER BY procDate DESC";

    // 3. 실행 (mapper.query 대신 getConnection으로 직접 실행)
    conn = await getConnection();
    const rows = await conn.query(sql, values);

    // MariaDB 결과 반환 (배열이 아닌 경우 처리)
    return Array.isArray(rows) ? rows : rows.slice(0, rows.length);
  } catch (err) {
    console.error("History Search Error:", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getMaterialList,
  getClientList,
  getEmployeeList,
  registerInboundItems,
  getHistoryList,
};
