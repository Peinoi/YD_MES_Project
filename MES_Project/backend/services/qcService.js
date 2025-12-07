const { query } = require('../database/mapper.js');

// 004 목록 조회
async function findQcListService(params) {
  try {
    return await query('QC_SEARCH', params);
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
    return result;
  } catch (err) {
    throw err;
  }
}

// 005 저장
async function saveResultService(data) {
  try {
    const params = [
      data.qir_code,
      data.start_date,
      data.end_date,
      data.result,
      data.qir_emp_code,
    ];
    return await query('QC_RESULT_SAVE', params);
  } catch (err) {
    throw err;
  }
}

async function deleteResultService(params) {
  try {
    console.log(params);
    // return await query('QC_RESULT_DELETE', params);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  findQcListService,
  pendingListService,
  findInstructionService,
  saveResultService,
  deleteResultService,
};
