const { getConnection, query } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// sample. MRP 계산 로직 (트랜잭션 적용)
exports.calculateMRP = async (planId) => {
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction(); // 트랜잭션 시작

    const [rows] = await conn.query(
      "SELECT * FROM prod_plan WHERE planId = ?",
      [planId]
    );

    if (rows.length > 0) {
      const plan = rows[0];
      // 간단한 MRP 시뮬레이션: 수량의 10%를 요구사항으로 가정
      const generatedReqCount = Math.floor(plan.qty * 0.1);

      // (여기에서 실제 MRP 계산 및 DB 업데이트 로직 추가 가능)

      await conn.commit(); // 트랜잭션 커밋
      return {
        planId: plan.planId,
        item: plan.item,
        qty: plan.qty,
        generatedReqCount: generatedReqCount,
        status: "COMPLETED",
      };
    } else {
      await conn.rollback(); // 해당 planId 없으면 롤백
      return null; // 해당 planId를 가진 계획이 없을 경우
    }
  } catch (err) {
    if (conn) await conn.rollback(); // 오류 발생 시 롤백
    throw err;
  } finally {
    if (conn) conn.release(); // 커넥션 풀에 반환
  }
};

// sample. 생산 계획 조회 로직 (트랜잭션 구조 유지, 현재는 더미 데이터 반환)
exports.getProductionPlans = async () => {
  // 실제 DB 연결 대신 더미 데이터 반환
  // 트랜잭션 구조는 유지하되, 현재는 DB 쿼리 없음
  let conn;
  try {
    conn = await getConnection();
    // await conn.beginTransaction(); // 읽기 전용이므로 트랜잭션 시작은 선택 사항
    // const [rows] = await conn.query("SELECT * FROM prod_plan");
    // await conn.commit();
    return [
      { planId: "PLN-001", item: "신라면", qty: 1000 },
      { planId: "PLN-002", item: "너구리", qty: 500 },
    ];
  } catch (err) {
    if (conn) await conn.rollback(); // 오류 발생 시 롤백
    throw err;
  } finally {
    if (conn) conn.release(); // 커넥션 풀에 반환
  }
};

// 0. 품질검사 지시 조회 페이지에서 등록된 품질검사기준 목록들을 전체 조회
exports.getQCRList = async () => {
  try {
    const result = await query("findAllQCR", []);
    return result;
  } catch (err) {
    throw err;
  }
};

// 1. 생산실적 테이블 조회
exports.getPrdrList = async () => {
  try {
    const result = await query("findAllPrdr", []);
    return result;
  } catch (err) {
    throw err;
  }
};

// 2. 발주서 사본 테이블 조회
exports.getMpr_dList = async () => {
  try {
    const result = await query("findAllMpr_d", []);
    return result;
  } catch (err) {
    throw err;
  }
};

// 3. 품질팀 사원 전체 조회.
exports.getQualityEmployeeList = async () => {
  try {
    const result = await query("findQualityEmployeeList", []);
    return result;
  } catch (err) {
    throw err;
  }
};

// 4. 기존의 품질검사 지시 목록을 조회.
exports.getQIOList = async () => {
  try {
    const result = await query("findAllQIO", []);
    return result;
  } catch (err) {
    throw err;
  }
};

// 5. 기존의 품질검사 단건에 해당하는 prdr||mpr_d, qir && qcr 조회
exports.getQIODetail = async (qio_code, prdr_code, mpr_d_code) => {
  const conn = await getConnection(); // 트랜잭션용 연결
  const result = [];
  try {
    await conn.beginTransaction();

    // 작업지시 전체 목록 조회
    if (
      (prdr_code != null && mpr_d_code == null) ||
      (prdr_code == null && mpr_d_code != null)
    ) {
      if (prdr_code != null) {
        const prdr = await conn.query(sqlList.findPrdrByQIO, [prdr_code]);
        result.push(prdr);
      } else if (mpr_d_code != null) {
        const mpr_d = await conn.query(sqlList.findMpr_dByQIO, [mpr_d_code]);
        result.push(mpr_d);
      } else {
        throw new Error("조회중 오류 발생");
      }
    }

    const qir = await conn.query(sqlList.findQIRsByQIO, [qio_code]);
    result.push(qir);

    await conn.commit(); // conn.commit();
    return { ...result };
  } catch (err) {
    await conn.rollback();
    console.error("조회 중 오류:", err);
    throw new Error("조회 중 오류가 발생했습니다.");
  } finally {
    conn.release();
  }
};

exports.createQuailityInstructionOrder = async (data) => {
  // 1. 프론트엔드에서 받은 데이터 분해 할당
  const { insp_date, prdr_code, mpr_d_code, emp_code, insp_vol, qcr_codes } =
    data;

  const conn = await getConnection(); // 트랜잭션용 연결
  try {
    await conn.beginTransaction();

    // 2. qio_tbl에 데이터 추가
    await conn.query(sqlList.createQuailityInstructionOrder, [
      insp_date,
      prdr_code,
      mpr_d_code,
      emp_code,
      insp_vol,
    ]);
    const rows = await conn.query(
      `SELECT qio_code FROM qio_tbl WHERE qio_code = LAST_INSERT_ID()`,
      []
    );
    //QIO-DEFAULT-TEMP
    const qio_code = rows[0].qio_code; // ex) 'QIO-20251208-002'

    // 4. qir_tbl에 qcr_codes 배열을 순회하며 데이터 추가
    for (const item of qcr_codes) {
      await conn.query(sqlList.createQuailityInstructionResult, [
        insp_date, // insp_result_date (검사 결과일) - 초기에는 지시일자와 동일하게 설정
        insp_date, // insp_date (검사일) - 초기에는 지시일자와 동일하게 설정
        qio_code, // FK
        emp_code, // FK
        item, // qcr_code (FK)
      ]);
    }

    await conn.commit(); // 모든 쿼리가 성공하면 트랜잭션 커밋
    return { qio_code }; // 생성된 qio_code를 프론트엔드로 반환
  } catch (err) {
    await conn.rollback(); // 오류 발생 시 롤백
    console.error("품질검사지시 생성 중 오류:", err);
    throw new Error("품질검사지시 생성 중 오류가 발생했습니다.");
  } finally {
    conn.release();
  }
};
