const { getConnection } = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");
// 생산 진행 조회
exports.production_work = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.work, []);
    console.log(result);
    return {
      result,
    };
  } finally {
    conn.release();
  }
};
exports.production_task = async () => {
  const conn = await getConnection();
  try {
    const result = await conn.query(sqlList.task_all, []);
    console.log(result);
    return {
      result,
    };
  } finally {
    conn.release();
  }
};
