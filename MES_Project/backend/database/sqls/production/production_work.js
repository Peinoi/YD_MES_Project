//backend/database/production/production_work.js
module.exports = {
  //실적 조회
  prdr_info: `
    SELECT 
	max(prdr_code)
    FROM prdr_tbl;
  `,
  // 작업 공정
  work: `
  SELECT 
    pd.prdr_d_code,
    po.po_name AS 공정명,
    COALESCE(pd.proc_rate, 0) AS 진행률,
    eq.eq_code AS 설비코드,
    eq.eq_name AS 설비,
    pd.start_date AS 시작일시,
    pd.end_date AS 종료일시,
    pd.input_qtt AS 지시량,
    pd.def_qtt AS 불량,
    pd.make_qtt AS 생산량
FROM 
    prdr_d_tbl pd
    INNER JOIN prdr_tbl pr ON pd.prdr_code = pr.prdr_code
    INNER JOIN line_d_tbl ld ON pd.line_eq_code = ld.line_eq_code
    INNER JOIN prod_proc_d_tbl ppd ON ld.pp_code = ppd.pp_code
    INNER JOIN po_tbl po ON ppd.po_code = po.po_code
    LEFT JOIN eq_tbl eq ON ld.eq_code = eq.eq_code
WHERE 
    pd.prdr_code = ?
ORDER BY 
    ppd.no, pd.start_date;
`,
  // 작업진행목록
  task_all: `
    SELECT 
    wk.wko_code AS code,
    prod.prod_name AS name,
    wk.line_code AS line,
    wk.start_date AS start,
    wk.end_date AS end,
    wk.stat AS stat,
    prdr.prdr_code AS prdrcode,
    CASE 
        WHEN pp.po_type = 'p2' THEN '정형'
        ELSE '비정형'
    END AS process_type
FROM wko_tbl wk 
    INNER JOIN prod_tbl prod ON wk.prod_code = prod.prod_code
    INNER JOIN prdr_tbl prdr ON prdr.work_order_code = wk.wko_code
    LEFT JOIN prod_proc_tbl pp ON pp.prod_code = prod.prod_code 
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
  //   -- w1 : 사용 가능, w2 : 사용 중
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
  //b1 : 대기중, b2 : 생산중, b3 : 생산완료, b4 : 생산일시정지, b5 : 가동중지
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
  update_process_rate: `
  UPDATE prdr_d_tbl
  SET proc_rate = ?, start_date = ?
  WHERE prdr_d_code = ?;
`,
  update_process_end: `
  UPDATE prdr_d_tbl
  SET proc_rate = 100, end_date = ?
  WHERE prdr_d_code = ?;
`,

  // 자재 소비량 계산을 위한 BOM 조회 쿼리 추가
  get_consumed_materials: `
    SELECT
        bm.mat_code,
        (bm.req_qtt * ? * (1 + IFNULL(bm.loss_rate, 0) / 100)) AS consumed_qtt
    FROM bom_tbl bt
    INNER JOIN prod_tbl pt ON bt.prod_code = pt.prod_code
    INNER JOIN bom_mat bm ON bt.bom_code = bm.bom_code
    WHERE pt.prod_name = ?
      AND bt.is_used = 'f2'
      AND bm.mat_code LIKE 'MAT-%'; 
      -- 👈 추가: mat_code가 'MAT-'로 시작하는 항목만 필터링하여 중간 제품(PROD-) 제외
`,
  // 재고 차감 쿼리 (mat_stock_tbl은 가정)
  update_stock_deduct: `
    UPDATE mat_stock_tbl 
    SET stock_qtt = stock_qtt - ?  -- ? = 차감 수량 (Consumed QTT)
    WHERE mat_code = ?;            -- ? = 자재 코드 (MAT_CODE)
`,
  // 재고 이동 이력 기록 쿼리 (stock_hist_tbl은 가정)
  insert_stock_history: `
    INSERT INTO stock_hist_tbl (mat_code, hist_type, qtt, wko_code, hist_date)
    VALUES (?, 'O', ?, ?, NOW()); -- 'O' = Outbound(출고), ?=MAT_CODE, ?=QTT, ?=WKO_CODE
`,
};
