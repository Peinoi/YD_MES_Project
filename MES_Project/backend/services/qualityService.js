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
exports.getMpo_dList = async () => {
  try {
    const result = await query("findAllMpo_d", []);
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
exports.getQIODetail = async (qio_code, prdr_code, mpo_d_code) => {
  const conn = await getConnection(); // 트랜잭션용 연결
  const result = [];
  try {
    await conn.beginTransaction();

    // 작업지시 전체 목록 조회
    if (
      (prdr_code != null && mpo_d_code == null) ||
      (prdr_code == null && mpo_d_code != null)
    ) {
      if (prdr_code != null) {
        const prdr = await conn.query(sqlList.findPrdrByQIO, [prdr_code]);
        result.push(prdr);
      } else if (mpo_d_code != null) {
        const mpo_d = await conn.query(sqlList.findMpo_dByQIO, [mpo_d_code]);
        result.push(mpo_d);
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

// 6. 품질검사 지시 생성
exports.createQuailityInstructionOrder = async (data) => {
  // 1. 프론트엔드에서 받은 데이터 분해 할당
  const { insp_date, prdr_code, mpo_d_code, emp_code, insp_vol, qcr_codes } =
    data;

  const conn = await getConnection(); // 트랜잭션용 연결
  try {
    await conn.beginTransaction();

    // 2. 새로운 qio_code를 생성하고 가져온다. (SELECT ... FOR UPDATE 사용)
    // 서브쿼리를 사용하여, 조건에 맞는 데이터가 없을 때도 항상 1개의 row를 반환하도록 보장
    const getNewQioCodeSql = `
      SELECT CONCAT(
          'QIO-',
          DATE_FORMAT(?, '%Y%m%d'),
          '-',
          LPAD(
              IFNULL((SELECT MAX(SUBSTR(qio_code, -3))
                      FROM qio_tbl
                      WHERE SUBSTR(qio_code, 5, 8) = DATE_FORMAT(?, '%Y%m%d')
                      FOR UPDATE), 0) + 1,
              3, '0'
          )
      ) as new_qio_code;
    `;

    // conn.query가 row의 배열을 반환
    const rows = await conn.query(getNewQioCodeSql, [insp_date, insp_date]);

    // 배열의 첫번째 요소를 안전하게 확인하고 qio_code를 추출
    if (!rows || rows.length === 0) {
      throw new Error("PK 생성 쿼리가 결과를 반환하지 않았습니다.");
    }
    const qio_code = rows[0].new_qio_code;

    // 3. 생성된 qio_code를 사용하여 qio_tbl에 데이터 추가
    await conn.query(sqlList.createQuailityInstructionOrder, [
      qio_code, // 생성된 PK
      insp_date,
      prdr_code,
      mpo_d_code,
      emp_code,
      insp_vol,
    ]);

    // 4. qir_tbl에 qcr_codes 배열을 순회하며 데이터 추가
    for (const item of qcr_codes) {
      // 4-1. 각 항목에 대한 qir_code 생성
      const getNewQirCodeSql = `
        SELECT CONCAT(
            'QIR-',
            LPAD(
                IFNULL(
                    (SELECT MAX(CAST(SUBSTR(qir_code, 5) AS UNSIGNED)) FROM qir_tbl FOR UPDATE),
                    0
                ) + 1,
                3, '0'
            )
        ) as new_qir_code;
      `;
      const qirRows = await conn.query(getNewQirCodeSql);
      if (!qirRows || qirRows.length === 0) {
        throw new Error("QIR PK 생성 쿼리가 결과를 반환하지 않았습니다.");
      }
      const qir_code = qirRows[0].new_qir_code;

      // 4-2. 생성된 qir_code와 함께 데이터 추가
      await conn.query(sqlList.createQuailityInstructionResult, [
        qir_code, // 새로 생성된 QIR PK
        insp_date, // start_date (검사 시작일)
        insp_date, // end_date (검사 종료일)
        qio_code, // FK
        emp_code, // qir_emp_code (검사 담당자)
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

// 7. 품질검사 지시 수정
exports.updateQuailityInstructionOrder = async (data) => {
  // 1. 프론트엔드에서 받은 데이터 분해 할당
  const {
    qio_code,
    insp_date,
    prdr_code,
    mpo_d_code,
    emp_code,
    insp_vol,
    qcr_codes,
  } = data;

  const conn = await getConnection(); // 트랜잭션용 연결
  try {
    await conn.beginTransaction();

    // 2. 기존의 qir_tbl 상세 데이터들을 삭제
    await conn.query(sqlList.deleteQuailityInstructionResultsByQIO, [qio_code]);

    // 3. qio_tbl 마스터 데이터를 업데이트
    await conn.query(sqlList.updateQuailityInstructionOrder, [
      insp_date,
      prdr_code,
      mpo_d_code,
      emp_code,
      insp_vol,
      qio_code, // WHERE 절에 들어갈 PK
    ]);

    // 4. 새로운 qcr_codes 배열을 순회하며 qir_tbl에 데이터 추가 (create 로직 재사용)
    for (const item of qcr_codes) {
      // 4-1. 각 항목에 대한 새로운 qir_code 생성
      const getNewQirCodeSql = `
        SELECT CONCAT(
            'QIR-',
            LPAD(
                IFNULL(
                    (SELECT MAX(CAST(SUBSTR(qir_code, 5) AS UNSIGNED)) FROM qir_tbl FOR UPDATE),
                    0
                ) + 1,
                3, '0'
            )
        ) as new_qir_code;
      `;
      const qirRows = await conn.query(getNewQirCodeSql);
      if (!qirRows || qirRows.length === 0) {
        throw new Error("QIR PK 생성 쿼리가 결과를 반환하지 않았습니다.");
      }
      const qir_code = qirRows[0].new_qir_code;

      // 4-2. 생성된 qir_code와 함께 데이터 추가
      await conn.query(sqlList.createQuailityInstructionResult, [
        qir_code, // 새로 생성된 QIR PK
        insp_date, // start_date (검사 시작일)
        insp_date, // end_date (검사 종료일)
        qio_code, // FK
        emp_code, // qir_emp_code (검사 담당자)
        item, // qcr_code (FK)
      ]);
    }

    await conn.commit(); // 모든 쿼리가 성공하면 트랜잭션 커밋
    return { qio_code }; // 수정된 qio_code를 프론트엔드로 반환
  } catch (err) {
    await conn.rollback(); // 오류 발생 시 롤백
    console.error("품질검사지시 수정 중 오류:", err);
    throw new Error("품질검사지시 수정 중 오류가 발생했습니다.");
  } finally {
    conn.release();
  }
};
