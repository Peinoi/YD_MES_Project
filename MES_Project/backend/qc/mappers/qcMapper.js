const pool = require('../config/db');
const qcSQL = require('../sql/qcSQL');

async function testMapper() {
  try {
    return await pool.query(qcSQL.TEST_SELECT);
  } catch (err) {
    throw err;
  }
}

module.exports = { testMapper };
