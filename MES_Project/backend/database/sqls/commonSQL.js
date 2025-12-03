// backend/database/sqls/commonSQL.js
module.exports = {
  // 공통 코드 note 가져오기
  selectNote: `
  SELECT note
  FROM common_code
  WHERE group_value = ?
  AND com_value = ?
`,

  // 공통 코드 note 목록 가져오기 (ex.select 박스)
  selectNoteList: `
  SELECT com_value, note
  FROM common_code
  WHERE group_value = ?
  ORDER BY com_value ASC
`,
};
