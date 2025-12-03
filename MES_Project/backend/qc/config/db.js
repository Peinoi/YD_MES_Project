const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

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
  insertIdAsNumber: true,
  bigIntAsNumber: true,
  logger: {
    query: console.log,
    error: console.log,
  },
});

// 연결 테스트
pool
  .getConnection()
  .then((conn) => {
    console.log('[ db.js  성공 ]');
    conn.release();
  })
  .catch((err) => {
    console.error('[ db.js  실패 ]', err.message);
  });

module.exports = pool;
