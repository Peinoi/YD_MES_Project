const { query, getConnection } = require("../database/mapper.js");

// 공통 코드 note 가져오기
exports.getNote = async (group_value, com_value) => {
  try {
    const rows = await query("selectNote", [group_value, com_value]);
    return rows.length > 0 ? rows[0].note : null;
  } catch (err) {
    console.error("[commonService.js || getNote 실패]", err.message);
    throw err;
  }
};

// 공통 코드 note 목록 가져오기 (ex.select 박스)
exports.getNoteList = async (group_value) => {
  try {
    const rows = await query("selectNoteList", [group_value]);
    return rows;
  } catch (err) {
    console.error("[commonService.js || getNoteList 실패]", err.message);
    throw err;
  }
};
