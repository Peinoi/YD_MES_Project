module.exports = {
  // 공통 코드 note 가져오기
  bomProducts: `
    SELECT 
        prod_code, 
        prod_name, 
        is_used, 
        DATE_FORMAT(DATE_ADD(regdate, INTERVAL 180 DAY), '%Y-%m-%d') AS edate,
        unit, 
        spec, 
        DATE_FORMAT(regdate, '%Y-%m-%d') AS regdate,
        note, 
        com_value, 
        reg,
        prod_type
    FROM prod_tbl
`,
  prodSelect: `
SELECT
prod_code, prod_name, com_value
From prod_tbl;`,
  prod_filter: `  SELECT 
        prod_code, 
        prod_name, 
        is_used, 
        DATE_FORMAT(DATE_ADD(regdate, INTERVAL 180 DAY), '%Y-%m-%d') AS edate,
        unit, 
        spec, 
        DATE_FORMAT(regdate, '%Y-%m-%d') AS regdate,
        note, 
        com_value, 
        reg,
        prod_type
    FROM prod_tbl
       WHERE 1=1
`,
  bom_mat: `SELECT 
    bm.mat_code,
    bm.mat_name,
    bm.mat_type,
    bm.req_qtt,
    bm.unit,
    bm.loss_rate
FROM bom_mat bm
JOIN bom_tbl bt ON bm.bom_code = bt.bom_code
JOIN prod_tbl pt ON bt.prod_code = pt.prod_code
WHERE pt.prod_code = ?;`,
  select_bom_mat: `(
    SELECT mat_code, mat_name, material_type_code AS prod_type, unit
    FROM mat_tbl
    WHERE material_type_code IN ('t1', 't2')
)
UNION ALL
(
    SELECT prod_code AS mat_code, prod_name AS mat_name, prod_type, unit
    FROM prod_tbl
    WHERE prod_type = 'i2'
)`,
};
