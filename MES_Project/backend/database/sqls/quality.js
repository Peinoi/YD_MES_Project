// backend/database/sqls/quality.js
module.exports = {
  // 품질기준정보 테이블 전체조회
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
  findAllPrdr: `
  SELECT prdr.prdr_code
  , prdr.production_qtt -- 생산수량: 이거개수를 주문수량이넘을수가없음
  , prdr.stat -- b3 = 생산 완료 생산실적
  , prod.prod_name -- 생산 완료된 완제품 이름
  , prod.unit -- h5 box, h4 ea
  , prod.note -- 비고
  , prod.com_value -- j1 봉지라면, j2 컵라면
  , prod.prod_type -- i1 완제품, i4 원자재
  FROM prdr_tbl prdr
  JOIN prod_tbl prod
  ON prdr.prod_code = prod.prod_code
`,
  findAllMpr_d: `
  SELECT mpr_d_code
  , req_qtt
  , mpr_d.unit AS 'mpr_d_unit'
  , mat.unit AS 'mat_unit'
  , mpr_d.note AS 'mpr_d_note'
  , mat.note AS 'mat_note'
  , mpr_code
  , mat_sup
  , mat.mat_code
  , mat.mat_name -- 발주 품목 이름
  , mat.material_type_code -- t1 원자재, t2부자재
  , mat.is_used -- f1 미사용, f2 사용중
FROM mpr_d_tbl mpr_d
JOIN mat_tbl mat
ON mat.mat_code = mpr_d.mat_code
WHERE mpr_d_code NOT IN (SELECT mpr_d_code FROM qio_tbl where mpr_d_code IS Not Null);
`,
  findQualityEmployeeList: `
  SELECT emp.emp_code
  , cc.note
  , emp.emp_name
  , emp.hdate
  , emp.ledate
  , emp.regdate
  , emp.auth
  , emp.reg
  , emp.emp_stat
  , emp.emp_job_id
FROM emp_tbl emp
JOIN common_code cc
ON cc.com_value = emp.emp_job_id -- emp_job_id // m1 = 관리자, m2 사원
WHERE emp.dept_code = 'DEPT-5'
`,
  findAllQIO: `
  SELECT qio.qio_code
  , qio.emp_code
  , qio.insp_date
  , qio.prdr_code
  , qio.mpr_d_code
  , qio.insp_vol
  , qio.qio_date
  , emp.emp_name
  FROM qio_tbl qio
  JOIN emp_tbl emp
  ON emp.emp_code = qio.emp_code
  WHERE emp.dept_code = 'DEPT-5'
  AND emp.emp_job_id = 'm1';
`,
};
