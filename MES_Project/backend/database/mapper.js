const mariadb = require('mariadb');
const sqlList = require('./sqlList.js');

const pool = mariadb.createPool({
  port: process.env.PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  permitSetMultiParamEntries: true,
  connectTimeout: 10000,
  // DML(insert, update, delete)를 실행할 경우
  // 반환되는 Object의 insertId 속성을 Number 타입으로 자동 변환
  insertIdAsNumber: true,

  // MariaDB의 데이터 타입 중 bigInt 타입을 Javascript의 Number 타입으로 자동 변환
  // 해당 타입을 Javascript에선 자동으로 변환하지 못함
  bigIntAsNumber: true,

  // logger 등록
  logger: {
    // 실제 실행되는 SQL문이 console.log로 출력되도록 설정
    query: console.log,
    // error 발생 시 처리함수
    error: console.log,
  },
});
const query = async (alias, values) => {
  let conn = null;
  try {
    // ConnectionPool에서 Connection 객체를 가져옴
    conn = await pool.getConnection();
    // SQL문 선택
    let executeSql = sqlList[alias];
    // SQL문을 실행할 결과를 처리
    let result = await conn.query(executeSql, values);
    return result;
  } finally {
    if (conn) conn.release(); // Release to pool
  }
};
// 트랜잭션을 위한 커넥션 가져오기
const getConnection = async () => {
  const conn = await pool.getConnection();
  return conn;
};

module.exports = {
  query,
  getConnection,
};
