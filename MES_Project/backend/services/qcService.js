const { query } = require('../database/mapper.js');

async function testService() {
  try {
    return await query('QC_FIND_ALL');
  } catch (err) {
    throw err;
  }
}

module.exports = { testService };
