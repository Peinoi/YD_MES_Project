module.exports = {
  // 1. 모달창 조회용 쿼리
  getMaterialList: `
    SELECT mat_code AS matCode, 
           mat_name AS matName, 
           unit, 
           spec,
           material_type_code AS category 
    FROM mat_tbl 
    WHERE is_used = 'f2'
  `,

  getSupplierList: `
    SELECT client_code AS clientCode, 
           client_name AS clientName, 
           client_type AS type
    FROM client_tbl 
    WHERE client_type = 'l2'
  `,

  getEmployeeList: `
    SELECT e.emp_code AS empCode, 
           e.emp_name AS empName, 
           d.dept_name AS deptName
    FROM emp_tbl e
    LEFT JOIN dept_tbl d ON e.dept_code = d.dept_code
    WHERE e.emp_stat = 'f2'
  `,

  // 2. ID 자동생성용 조회
  getLastMinbndSeq: `
    SELECT minbnd_code 
    FROM minbnd_tbl 
    WHERE minbnd_code LIKE CONCAT('MIN-', ?, '-%')
    ORDER BY minbnd_code DESC 
    LIMIT 1
    FOR UPDATE
  `,

  getLastLotSeq: `
    SELECT lot_num 
    FROM mat_lot_tbl 
    WHERE lot_num LIKE CONCAT('LOT-%-', ?, '-%')
    ORDER BY lot_num DESC 
    LIMIT 1
    FOR UPDATE
  `,

  getLastQioSeq: `
    SELECT qio_code 
    FROM qio_tbl 
    WHERE qio_code LIKE CONCAT('QIO-', ?, '-%')
    ORDER BY qio_code DESC 
    LIMIT 1
    FOR UPDATE
  `,

  // 3. 등록용 INSERT 쿼리 (Bulk Insert)
  insertMatLot: `
    INSERT INTO mat_lot_tbl (
      lot_num, issdate, item_type_code, mat_code
    ) VALUES (?, ?, ?, ?)
  `,

  insertQio: `
    INSERT INTO qio_tbl (qio_code, insp_date, emp_code) 
    VALUES (?, ?, ?)
  `,

  insertMinbnd: `
    INSERT INTO minbnd_tbl (
      minbnd_code, mat_code, mat_type, unit, 
      inbnd_qtt, inbnd_date, ord_qtt, 
      qio_code, lot_num, mat_sup, mcode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  //입출고 내역 조회
  getHistoryList: `
    SELECT * FROM (
        -- 입고 내역
        SELECT 
            'IN' AS type,
            m.minbnd_code AS id,
            m.inbnd_date AS procDate,
            mat.mat_code AS matCode,
            mat.mat_name AS matName,
            mat.spec,
            m.ord_qtt AS reqQty,
            m.inbnd_qtt AS procQty,
            (SELECT note FROM common_code WHERE com_value = m.unit) as unit,
            e.emp_name AS manager,
            'COMPLETED' AS status, -- 입고 테이블에 있으면 완료로 간주
            '' AS remark
        FROM minbnd_tbl m
        JOIN mat_tbl mat ON m.mat_code = mat.mat_code
        LEFT JOIN emp_tbl e ON m.mcode = e.emp_code

        UNION ALL

        -- 출고 내역
        SELECT 
            'OUT' AS type,
            mo.moutbnd_code AS id,
            mo.moutbnd_date AS procDate,
            mat.mat_code AS matCode,
            mat.mat_name AS matName,
            mat.spec,
            mo.order_qtt AS reqQty,
            mo.outbnd_qtt AS procQty,
            (SELECT note FROM common_code WHERE com_value = mat.unit) as unit,
            e.emp_name AS manager,
            'COMPLETED' AS status,
            '' AS remark
        FROM moutbnd_tbl mo
        JOIN mat_tbl mat ON mo.mat_code = mat.mat_code
        LEFT JOIN emp_tbl e ON mo.emp_code = e.emp_code
    ) AS history
    WHERE 1=1
  `,
};
