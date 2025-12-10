const { getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 생산 진행 조회
exports.production_work = async (wko_code, prod_code) => {
  const conn = await getConnection();
  try {
    wko_code = "WKO-20250624-001";
    prod_code = "PROD-0001";
    const result = await conn.query(sqlList.work, [wko_code, prod_code]);
    console.log(result);
    return { result };
  } finally {
    conn.release();
  }
};

//실적 코드 생성용 조회
exports.prdr_info = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdr_info, []);
    return { result };
  } finally {
    conn.release();
  }
};

// 작업 진행 목록
exports.production_task = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.task_all);
    return { result };
  } finally {
    conn.release();
  }
};

// 생산 실적 목록
exports.production_performance = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.work_performance);
    return { result };
  } finally {
    conn.release();
  }
};

// 사용 가능 설비 목록
exports.availableEquipmentList = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.availableEquipment);
    return { result };
  } finally {
    conn.release();
  }
};

// 설비 상태 업데이트
exports.availableEquipmentUpdate = async ({ code, stat }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.availableEquipmentUpdate, [
      stat,
      code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// 실적 상태 업데이트
exports.prdrUpdate = async ({ prdr_code, stat }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdrUpdate, [stat, prdr_code]);
    return { result };
  } finally {
    conn.release();
  }
};

// 실적 등록
exports.prdrInsert = async (payload) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1) prdr_tbl INSERT
    await conn.query(sqlList.prdrInsert, [
      payload.prdr_code,
      payload.note,
      payload.work_order_code,
      payload.emp_code,
      payload.prod_code,
      payload.ord_qtt,
    ]);

    // 2) prdr_d_tbl 생성
    const created = await exports.createPrdrDetail(
      conn,
      payload.prdr_code,
      payload.prod_code
    );
    await conn.commit();
    return { prdr_code: payload.prdr_code, created };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

// prdr_d_tbl 자동 생성
exports.createPrdrDetail = async (conn, prdr_code) => {
  const TEMPLATE_PROD_CODE = "PROD-0001";

  // 1) 템플릿 조회
  const result = await conn.query(
    `
      SELECT ppd.pp_code, ld.line_eq_code
      FROM prod_proc_d_tbl ppd
      LEFT JOIN line_d_tbl ld ON ld.pp_code = ppd.pp_code
      WHERE ppd.prod_proc_code = (
          SELECT prod_proc_code
          FROM prod_proc_tbl
          WHERE prod_code = ?
      )
    `,
    [prdr_code]
  );

  const processList = Array.isArray(result[0]) ? result[0] : result;

  if (!Array.isArray(processList) || processList.length === 0) {
    console.warn("⚠ PROD-0001 템플릿 공정이 없습니다.");
    return 0;
  }

  // 2) next prdr_d_code 생성 함수
  async function getNextPrdrDCode(conn) {
    const res = await conn.query(`
      SELECT MAX(prdr_d_code) AS maxCode
      FROM prdr_d_tbl
    `);

    let rows = res;
    if (Array.isArray(res) && Array.isArray(res[0])) {
      rows = res[0];
    }
    if (!Array.isArray(rows)) {
      rows = [rows];
    }

    if (!rows[0] || !rows[0].maxCode) {
      return "PRDR-D-001";
    }

    const maxCode = rows[0].maxCode;
    const num = parseInt(maxCode.split("-")[2]);
    const nextNumber = num + 1;

    return `PRDR-D-${String(nextNumber).padStart(3, "0")}`;
  }

  // 3) 템플릿 기반으로 prdr_d_tbl 생성
  for (const p of processList) {
    const nextCode = await getNextPrdrDCode(conn);

    await conn.query(
      `
        INSERT INTO prdr_d_tbl(
          prdr_d_code,
          prdr_code,
          line_eq_code,
          proc_rate
        )
        VALUES (?, ?, ?, 0)
      `,
      [nextCode, prdr_code, p.line_eq_code]
    );
  }

  return processList.length;
};

// 작업 종료
exports.prdrEnd = async ({
  prdr_code,
  end_date,
  total_time,
  qtt,
  rate,
  stat,
}) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdrEnd, [
      end_date,
      total_time,
      qtt,
      rate,
      stat,
      prdr_code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// --------------------------------------------------
// 공정 진행률 업데이트 ★ 핵심
// --------------------------------------------------
exports.updateProcessRate = async ({ rate, qtt, start_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    return await conn.query(sqlList.update_process_rate, [
      rate,
      start_date,
      qtt,
      prdr_d_code,
    ]);
  } finally {
    conn.release();
  }
};

// 종료일시만 업데이트
exports.updateProcessEndDate = async ({ end_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    return await conn.query(sqlList.update_process_enddate, [
      end_date,
      prdr_d_code,
    ]);
  } finally {
    conn.release();
  }
};

// 공정 최종 완료 처리
exports.updateProcessEnd = async ({ end_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    return await conn.query(sqlList.update_process_end, [
      end_date,
      prdr_d_code,
    ]);
  } finally {
    conn.release();
  }
};
exports.finishAllProcesses = async ({ prdr_code, qtt }) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1) prdr_d_tbl 전체 완료 처리
    await conn.query(
      `
      UPDATE prdr_d_tbl
      SET proc_rate = 100,
          end_date = NOW()
      WHERE prdr_code = ?
    `,
      [prdr_code]
    );

    // 2) prdr_tbl 작업 종료 처리
    await conn.query(
      `
      UPDATE prdr_tbl
      SET production_qtt = ?,
          perform_rate = 100,
          end_date = NOW(),
          stat = 'b3'
      WHERE prdr_code = ?
    `,
      [qtt, prdr_code]
    );

    await conn.commit();
    return { prdr_code };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// 작업지시 상태 업데이트
exports.wkoUpdate = async ({ wko_code, stat }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(
      `UPDATE wko_tbl SET stat = ? WHERE wko_code = ?`,
      [stat, wko_code]
    );
    return { result };
  } finally {
    conn.release();
  }
};
