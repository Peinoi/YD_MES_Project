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

  // 3. 등록용 INSERT 쿼리 (Bulk Insert)
  insertMatLot: `
    INSERT INTO mat_lot_tbl (
      lot_num, issdate, item_type_code, mat_code
    ) VALUES (?, ?, ?, ?)
  `,

  insertMinbnd: `
    INSERT INTO minbnd_tbl (
      minbnd_code, mat_code, mat_type, unit, 
      inbnd_qtt, inbnd_date, ord_qtt, 
      qio_code, lot_num, mat_sup, mcode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
};
