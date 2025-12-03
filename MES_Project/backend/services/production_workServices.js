const { getConnection } = require("../database/production_workServices.js");

// 생산 진행 조회
exports.production_work = async () => {
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction(); // 트랜잭션 시작

    const [rows] = await conn.query("");

    if (rows.length > 0) {
      const plan = rows[0];

      await conn.commit(); // 트랜잭션 커밋
      return {
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
