const qcMapper = require('../mappers/qcMapper');

async function testService() {
  try {
    return await qcMapper.testMapper();
  } catch (err) {
    throw err;
  }
}

module.exports = { testService };
