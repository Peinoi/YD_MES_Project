// backend/database/sqls/quality.js
module.exports = {
  findAllQCR: `
  SELECT
    qcr.qcr_code
  , qcr.inspection_item
  , qcr.range_top
  , qcr.range_bot
  , cc.note -- 공통코드 테이블
  FROM
    qcr_tbl qcr -- 품질검사 기준정보 + 검사항목 + 검사상세항목 합쳐진 테이블
  JOIN
    common_code cc ON qcr.unit = cc.com_value -- qcr의 '단위'와 cc의 '코드값'을 연결
`,
  findAllQIO: `
  SELECT *
  FROM qio_tbl
`,
};
