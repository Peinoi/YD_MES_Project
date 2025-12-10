module.exports = {
  prod_next_code: `
    SELECT LPAD(
        IFNULL(MAX(CAST(SUBSTRING(prod_code, 6) AS SIGNED)), 0) + 1,
        4,
        '0'
    ) AS nextSeq
    FROM prod_tbl;
`,

  prod_insert: `
    INSERT INTO prod_tbl
    (
        prod_code,
        prod_name,
        is_used,
        edate,
        unit,
        spec,
        note,
        com_value,
        reg,
        prod_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
  emp_list: `
    SELECT 
        e.emp_code,
        e.emp_name,
        e.emp_job_id
    FROM emp_tbl e
    WHERE e.emp_job_id = 'm1'
    ORDER BY e.emp_name;
  `,
};
