const testService = require('./services/qcService');

async function nodeTestService() {
  const testData = {
    result: 'g1',
    qir_code: 'QIR-002',
  };

  testService.saveInstructionService(testData);
}

nodeTestService();
