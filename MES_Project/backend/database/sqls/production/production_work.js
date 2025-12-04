//backend/database/production/production_work.js
module.exports = {
  // 공통 코드 note 가져오기
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
    pd.prdr_code = 'PRDR-001'
ORDER BY 
    ppd.no, pd.start_date;
`,
  task_all: `
    select 
	wk.wko_code as code,
    prod_name as name,
    wk.line_code as line,
    wk.start_date as start,
    wk.end_date as end,
    wk.stat as stat
from
    wko_tbl wk INNER JOIN prod_tbl prod on wk.prod_code = prod.prod_code;
    `,
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
};
