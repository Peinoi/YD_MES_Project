const { query } = require("../database/mapper.js");

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

module.exports = {
  getProductionPlan,
};
