module.exports = {
  //실적 조회
  prdr_info: `
    SELECT 
	max(prdr_code)
    FROM prdr_tbl;
  `,
  // 작업 공정 (✅ prdr_d_code 추가)
  work: `
  SELECT
    ppd.pp_code,
    po.po_name AS 공정명,
    -- 집계 함수를 사용하여 중복되는 값 중 하나를 선택
    MIN(COALESCE(pd.proc_rate, 0)) AS 진행률,
    MIN(eq.eq_code) AS 설비코드,
    MIN(eq.eq_name) AS 설비,
    MIN(pd.start_date) AS 시작일시,
    MIN(pd.end_date) AS 종료일시,
    MIN(COALESCE(pd.input_qtt, 0)) AS 지시량,
    MIN(COALESCE(pd.def_qtt, 0)) AS 불량,
    MIN(COALESCE(pd.make_qtt, 0)) AS 생산량,
    MIN(pd.prdr_d_code) AS prdr_d_code
FROM prod_proc_tbl ppt
INNER JOIN prod_proc_d_tbl ppd 
    ON ppt.prod_proc_code = ppd.prod_proc_code

LEFT JOIN line_d_tbl ld 
    ON ld.pp_code = ppd.pp_code
LEFT JOIN eq_tbl eq 
    ON eq.eq_code = ld.eq_code

-- prdr_tbl의 work_order_code를 기준으로 실적을 찾습니다.
LEFT JOIN prdr_tbl pr 
    ON pr.work_order_code = ?

-- prdr_d_tbl은 실적 테이블과 라인/설비 코드를 기준으로 조인됩니다.
LEFT JOIN prdr_d_tbl pd 
    ON pd.line_eq_code = ld.line_eq_code
    AND pd.prdr_code = pr.prdr_code

INNER JOIN po_tbl po 
    ON po.po_code = ppd.po_code

WHERE ppt.prod_code = ?
  AND (pd.prdr_d_code IS NOT NULL OR pr.prdr_code IS NULL)
-- ✅ 핵심 수정: 공정과 공정명을 기준으로 그룹화하여 중복 제거
GROUP BY 
    ppd.pp_code, 
    po.po_name, 
    ppd.no 
ORDER BY ppd.no;
`,
  // 작업진행목록
  task_all: `
SELECT
    wk.wko_code AS code,
    prod.prod_name AS name,
    prod.prod_code AS prod_code,
    wk.line_code AS line,
    wk.wko_qtt AS wko_qtt,
    wk.start_date AS start,
    wk.end_date AS end,
    wk.stat AS stat,
    -- prdr_code가 여러 개일 경우, 가장 작은(첫 번째) 코드를 선택합니다.
    MIN(prdr.prdr_code) AS prdrcode 
FROM wko_tbl wk 
    INNER JOIN prod_tbl prod ON wk.prod_code = prod.prod_code
    LEFT JOIN prdr_tbl prdr ON prdr.work_order_code = wk.wko_code
    -- prod_proc_tbl 조인은 중복 발생의 주요 원인이 아니므로 유지합니다.
    LEFT JOIN prod_proc_tbl pp ON pp.prod_code = prod.prod_code 
-- wk.wko_code를 기준으로 그룹화하여 중복 행을 하나로 묶습니다.
GROUP BY 
    wk.wko_code, 
    prod.prod_name, 
    prod.prod_code, 
    wk.line_code, 
    wk.wko_qtt, 
    wk.start_date, 
    wk.end_date, 
    wk.stat
ORDER BY wk.wko_code ASC;
    `,
  // 생산실적
  work_performance: `
SELECT 
    prdr.prdr_code AS code,
    prdr.end_date AS cr_date,
    prod.prod_name AS name,
    prdr.work_order_code AS order_num,  
    prdr.production_qtt AS qtt,
    COALESCE(SUM(prdrd.def_qtt), 0) AS notqtt,  
    li.line_code AS linecode,
    co.note AS stat,
    lo.lot_num as lotnum
FROM prdr_tbl prdr
INNER JOIN common_code co ON prdr.stat = co.com_value 
INNER JOIN prod_tbl prod ON prdr.prod_code = prod.prod_code
LEFT JOIN prdr_d_tbl prdrd ON prdr.prdr_code = prdrd.prdr_code 
INNER JOIN line_d_tbl lid ON lid.line_eq_code = prdrd.line_eq_code
INNER JOIN line_tbl li ON li.line_code = lid.line_code
inner join lot_tbl lo on lo.prod_code = prdr.prod_code
GROUP BY 
    prdr.prdr_code,
    prdr.end_date,
    prod.prod_name,
    prdr.work_order_code,
    prdr.production_qtt,
    li.line_code,
    co.note
ORDER BY prdr.prdr_code DESC;
`,

  //사용 가능 설비
  availableEquipment: `
    select 
	eq_code,
	eq_name,
    is_used,
    stat
 from eq_tbl;
`,
  // 설비 사용 상태 업데이트
  availableEquipmentUpdate: `
    update eq_tbl 
    set stat = ? 
    where eq_code = ?;
`,
  // 실적 상태 업데이트
  prdrUpdate: `
    update prdr_tbl 
    set stat = ? 
    where prdr_code = ?;
`,
  // 실적 등록
  prdrInsert: `
    insert into
    prdr_tbl(
    prdr_code,
    start_date,
    note,
    work_order_code,
    emp_code,
    prod_code,
    perform_rate,
    stat,
    ord_qtt
    )
    values (?,now(),?,?,?,?,0,'b1',?);
`,
  // 작업 종료
  prdrEnd: `
    update prdr_tbl 
    set 
    end_date = ? ,
    total_time = ?,
    production_qtt = ?,
    perform_rate = ?,
    stat = ? 
    where prdr_code = ?;
`,

  // 자재 출고 기록 삽입
  insert_material_outbound: `
    INSERT INTO moutbnd_tbl (
      moutbnd_code,
      mat_code,
      mat_unit,
      outbnd_qtt,
      moutbnd_date,
      emp_code,
      prdr_code
    ) VALUES (?, ?, ?, ?, NOW(), ?, ?);
  `,

  get_consumed_materials: `
    SELECT
      bm.mat_code,
      bm.mat_name,
      bm.unit,
      CEILING(bm.req_qtt * (? / 1000) * (1 + IFNULL(bm.loss_rate, 0) / 100)) AS consumed_qtt
    FROM bom_tbl bt
    INNER JOIN bom_mat bm ON bt.bom_code = bm.bom_code
    WHERE bt.prod_code = ?
      AND bt.is_used = 'f2'
      AND bm.mat_code LIKE 'MAT-%'
  `,

  // 중간 제품(반제품) 조회
  get_intermediate_products: `
    SELECT
      bm.mat_code AS prod_code,
      pt.prod_name,
      CEILING(bm.req_qtt * (? / 1000) * (1 + IFNULL(bm.loss_rate, 0) / 100)) AS required_prod_qtt
    FROM bom_tbl bt
    INNER JOIN bom_mat bm ON bt.bom_code = bm.bom_code
    INNER JOIN prod_tbl pt ON bm.mat_code = pt.prod_code
    WHERE bt.prod_code = ?
      AND bt.is_used = 'f2'
      AND bm.mat_code LIKE 'PROD-%'
  `,

  get_next_moutbnd_code: `
    SELECT CONCAT('MOUT-', DATE_FORMAT(NOW(), '%Y%m%d'), '-',
           LPAD(IFNULL(MAX(CAST(SUBSTRING(moutbnd_code, 17) AS UNSIGNED)), 0) + 1, 3, '0'))
           AS next_code
    FROM moutbnd_tbl
    WHERE moutbnd_code LIKE CONCAT('MOUT-', DATE_FORMAT(NOW(), '%Y%m%d'), '-%');
  `,

  get_material_info: `
    SELECT mat_code, unit
    FROM mat_tbl
    WHERE mat_code = ?;
  `,

  get_prod_name_by_code: `
    SELECT prod_code, prod_name
    FROM prod_tbl
    WHERE prod_code = ?;
  `,
};
