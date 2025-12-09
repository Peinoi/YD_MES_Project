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
WHERE prdr.prdr_code  NOT IN (SELECT prdr_code FROM qio_tbl where prdr_code IS NOT NULL)
AND prdr.stat = 'b3'
`,
  findAllMpo_d: `
  SELECT 
  mpo_d.mpo_d_code -- 자재 발주서 상세 PK, 회사가 들여온 각 자재의 코드(QIO가 FK로땡기고있음)
  , mpo_d.purchase_code -- 복수의 자재 발주서 상세 정보를 담을 하나의 자재 발주서, 발주완료 여부를 땡겨올때 씀
  , mpo_d.mat_code -- 자재의 정보를 담고 있는 FK mat_tbl과 조인할때 씀
  
  , mpo_d.req_qtt -- 회사로 들여온 자재의 개수(QIO에서 품질검사 할 때 이 갯수를 넘길 수 없음)
  , mpo_d.deadline 
  , mpo_d.client_code 
  , mat.mat_name
  , mat.material_type_code -- t1 원자재, t2부자재
  , mat.is_used -- f1 미사용, f2 사용중
  , cc.note
FROM mpo_d_tbl mpo_d
JOIN mat_tbl mat
ON mpo_d.mat_code = mat.mat_code
JOIN mpo_tbl mpo -- 복수의 자재발주상세를 담은 발주서의 정보, mpo_tbl.stat 이 c1인거 땡겨올거임
ON mpo_d.purchase_code = mpo.purchase_code -- 발주서 정보가 존재하는 발주상세 끌어옴
JOIN common_code cc
ON mat.material_type_code = cc.com_value
WHERE mpo.stat = 'c1' -- 발주 완료 상태인 발주서의 발주상세정보 목록을 출력
`,
  findPrdrByQIO: `
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
  WHERE prdr.prdr_code = ?
`,
  findMpr_dByQIO: `
SELECT mpo_d_code
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
WHERE mpo_d_code = ?
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
  , DATE_FORMAT(qio.insp_date, '%Y-%m-%d') AS insp_date
  , qio.prdr_code
  , qio.mpo_d_code
  , qio.insp_vol
  , DATE_FORMAT(qio.qio_date, '%Y-%m-%d') AS qio_date
  , emp.emp_name
  FROM qio_tbl qio
  JOIN emp_tbl emp
  ON emp.emp_code = qio.emp_code
  WHERE emp.dept_code = 'DEPT-5'
  AND emp.emp_job_id = 'm1'
  AND (qio.prdr_code IS NOT NULL OR qio.mpo_d_code IS NOT NULL)
`,
  findQIRsByQIO: `
select qcr.qcr_code
  , qcr.inspection_item
  , qcr.range_top
  , qcr.range_bot
  , cc.note -- 공통코드 테이블
from qir_tbl qir
join qcr_tbl qcr
on qcr.qcr_code = qir.qcr_code
JOIN
    common_code cc 
ON qcr.unit = cc.com_value
where qir.qio_code =  ?
`,
  createQuailityInstructionOrder: `
  INSERT INTO qio_tbl (qio_code, qio_date, insp_date, prdr_code, mpo_d_code, emp_code, insp_vol) 
VALUES (
?  -- PK 생성해서 넣어줌
, CURDATE()
, ? -- 검사 지시 일자 NotNull
, ? -- 생산실적 코드 NullAble
, ? -- 발주서 코드 NullAble - 생산실적과 발주서 중 둘중 하나만 FK있어야 함.
, ? -- 사원 코드 NotNull
, ? -- 검사량  
)`,
  createQuailityInstructionResult: `
  INSERT INTO qir_tbl (qir_code, start_date, end_date, result, note, qio_code, qir_emp_code, qcr_code) 
  VALUES (? -- qir_code 애플리케이션에서 생성
  , ? -- 검사 시작일 - 검사 지시 일자 값으로 초기값 주면됨
  , ? -- 검사 종료일 - 검사 지시 일자 값으로 초기값 주면됨
  , 'g0' -- 검사결과 인데 notNull로만들어놔서 검사전 상태를 의미하는 g0을 임의로 추가함.
  , null -- 비고 검사결과 작성한 담당자가 적을거라서 null로 줌
  , ? -- qio_code - 어떤 검사지시서의 검사 문항인지 알아야 함.
  , ? -- qir_emp_code - 검사결과지 작성자 정보 넣어야되는데 이게왜 NotNull인데, 덮어써야해서 품질팀 관리자 PK넣어줌
  , ? -- qcr_code - 검사 항목 상세정보의 기준이 되는 값을 저장하고있는 테이블의 PK
  )`,
  updateQuailityInstructionOrder: `
  UPDATE qio_tbl
  SET
    insp_date = ?,
    prdr_code = ?,
    mpo_d_code = ?,
    emp_code = ?,
    insp_vol = ?
  WHERE qio_code = ?
  `,
  updateQuailityInstructionResult: `
  UPDATE qir_tbl
  SET
    start_date = ?,
    end_date = ?,
    result = ?,
    note = ?,
    qir_emp_code = ?
  WHERE qir_code = ?
  `,
  deleteQuailityInstructionResultsByQIO: `
  DELETE FROM qir_tbl WHERE qio_code = ?
  `,
};
