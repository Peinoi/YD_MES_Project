const { getConnection } = require("../database/mapper.js");

// 1. MRP 계산 로직 (트랜잭션 적용)
exports.calculateMRP = async (planId) => {
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction(); // 트랜잭션 시작

    const [rows] = await conn.query("SELECT * FROM prod_plan WHERE planId = ?", [
      planId,
    ]);

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

// 2. 생산 계획 조회 로직 (트랜잭션 구조 유지, 현재는 더미 데이터 반환)
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
