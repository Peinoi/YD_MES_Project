const { getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 생산 진행 조회
exports.production_work = async (code) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.work, [code]);
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
exports.prdrInsert = async ({
  prdr_code,
  note,
  work_order_code,
  emp_code,
  prod_code,
  ord_qtt,
}) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.prdrInsert, [
      prdr_code,
      note,
      work_order_code,
      emp_code,
      prod_code,
      ord_qtt,
    ]);
    return { result };
  } finally {
    conn.release();
  }
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

// 공정 진행률 업데이트
exports.updateProcessRate = async ({ rate, start_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.update_process_rate, [
      rate,
      start_date,
      prdr_d_code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};

// 공정 완료 처리
exports.updateProcessEnd = async ({ end_date, prdr_d_code }) => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.update_process_end, [
      end_date,
      prdr_d_code,
    ]);
    return { result };
  } finally {
    conn.release();
  }
};
// 새로운 트랜잭션 서비스 함수 추가
exports.deductMaterialsTransaction = async ({
  prdr_code,
  prod_name,
  final_qty,
  wko_code,
}) => {
  const conn = await getConnection();
  await conn.beginTransaction(); // 👈 트랜잭션 시작

  try {
    // 1. BOM 기반 소요 자재 계산
    const materialsResult = await conn.query(sqlList.get_consumed_materials, [
      final_qty,
      prod_name,
    ]);

    // ------------------ [디버깅 코드 추가] ------------------
    // 실제 DB 쿼리가 어떤 결과를 반환하는지 확인
    console.log("[DEBUG] BOM 쿼리 결과 전체:", materialsResult);

    const materials = materialsResult[0]; // 👈 이 코드를 유지하고

    console.log("[DEBUG] 추출된 자재 배열 (materials):", materials);
    // ----------------------------------------------------

    if (!materials || materials.length === 0) {
      console.warn(`[WARN] No BOM materials found for Prod Name: ${prod_name}`);
      await conn.commit();
      return { result: { message: "No materials to deduct." } };
    }

    // 2. 자재별 재고 차감 및 이력 기록 (반복문 필요)
    for (const mat of materials) {
      // A. 재고 차감
      await conn.query(sqlList.update_stock_deduct, [
        mat.consumed_qtt,
        mat.mat_code,
      ]);

      // B. 재고 이력 기록
      await conn.query(sqlList.insert_stock_history, [
        mat.mat_code,
        mat.consumed_qtt,
        wko_code,
      ]);
    }

    // 3. 실적 상태 최종 완료로 업데이트 (b3: 생산완료)
    await conn.query(sqlList.prdrUpdate, ["b3", prdr_code]);

    await conn.commit(); // 👈 최종 커밋
    return { result: { message: "Material deduction successful." } };
  } catch (error) {
    await conn.rollback(); // 👈 오류 시 롤백
    throw error; // 오류를 다시 던져서 상위 핸들러가 처리하도록 함
  } finally {
    conn.release();
  }
};
