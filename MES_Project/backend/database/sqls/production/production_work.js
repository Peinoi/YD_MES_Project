const work = `
SELECT 
    po.po_name AS 공정명,
    COALESCE(pd.proc_rate, 0) AS 진행률,
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
`;
