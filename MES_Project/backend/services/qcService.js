const { query } = require('../database/mapper.js');

// 004 목록 조회
async function qcFindAllService(params) {
  try {
    const { qcrCore, prodCode, prodName, qcrCode, result, startDate } = params;
    return await query('QC_SEARCH', [
      qcrCore,
      qcrCore,
      prodCode,
      prodCode,
      prodName,
      prodName,
      qcrCode,
      qcrCode,
      result,
      result,
      startDate,
      startDate,
    ]);
  } catch (err) {
    throw err;
  }
}

// 005 검사결과 불러오기
async function pendingListService() {
  try {
    return await query('QC_PENDING_LIST');
  } catch (err) {
    throw err;
  }
}

// 005 검사지시 불러오기
async function findInstructionService(params) {
  try {
    const result = await query('QC_INSTRUCTION', [params.qir_code]);
    console.log(result);
    return result;
  } catch (err) {
    throw err;
  }
}

// 005 저장
async function saveInstructionService(data) {
  try {
    const resultData = Object.values(data);
    console.log(resultData);
    // return await query('QC_INSTRUCTION_SAVE', resultData);
  } catch (err) {
    throw err;
  }
}

async function deleteInstructionService(params) {
  try {
    console.log(params);
    // return await query('QC_INSTRUCTION_DELETE', params);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  qcFindAllService,
  pendingListService,
  findInstructionService,
  saveInstructionService,
  deleteInstructionService,
};
