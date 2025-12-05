const { query, getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 생산 계획/작업지시 목록을 조회하는 함수
const getProductionPlan = async () => {
  try {
    const result = await query("plan", []);

    return result;
  } catch (error) {
    console.error("생산 계획 목록 조회 중 DB 오류 발생:", error);
    throw new Error("데이터베이스 오류로 생산 계획 목록 조회에 실패했습니다.");
  }
};

// 🔍 특정 workOrderNo 존재 여부 확인 함수
const checkProductionPlanExists = async (workOrderNo) => {
  try {
    const result = await query("planCheck", [workOrderNo]);

    // result = [ { cnt: 0 } ] 형태라고 가정
    const exists = result[0].cnt > 0;

    return { exists };
  } catch (error) {
    console.error("생산 계획 존재 여부 조회 중 DB 오류 발생:", error);
    throw new Error("데이터베이스 오류로 존재 여부 조회에 실패했습니다.");
  }
};

// 🔄 작업지시 업데이트 (두 테이블 동시)
const updateProductionPlan = async (data) => {
  const conn = await getConnection(); // 트랜잭션용 연결
  console.log("data is:", data);
  try {
    await conn.beginTransaction();

    // 1️⃣ wko_tbl 업데이트 (작업지시 정보)

    await conn.query(sqlList.updateWko, [
      data.wko_qtt || 0, // undefined 방지
      data.start_date || null,
      data.end_date || null,
      data.stat || "",
      data.line_code || "",
      data.wko_code,
    ]);

    // 2️⃣ prdp_tbl 업데이트 (계획 정보, 계획번호, 계획일자는 변경하지 않음)
    await conn.query(sqlList.updatePrdp, [
      data.due_date || null,
      data.prdp_code,
    ]);
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    console.error("업데이트 중 DB 오류:", err);
    throw new Error("업데이트 중 오류가 발생했습니다.");
  } finally {
    conn.release();
  }
};

module.exports = {
  getProductionPlan,
  checkProductionPlanExists,
  updateProductionPlan, // 여기 추가
};
