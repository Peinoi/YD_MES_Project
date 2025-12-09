module.exports = {
  getProcessFlowList: `
    SELECT
            P.prod_proc_code AS processCode, -- 흐름도코드
            P.po_name        AS processName, -- 흐름도명
            D.prod_code      AS itemCode,    -- 제품코드
            D.prod_name      AS itemName,    -- 제품명
            P.reg            AS reg,         -- 등록자
            P.reg_date       AS regDate,     -- 등록일자
            P.note           AS remark       -- 비고
        FROM
            prod_proc_tbl AS P
        INNER JOIN
            prod_tbl AS D ON P.prod_code = D.prod_code
        WHERE 1 = 1
        
        /* 흐름도코드 */
        AND ( ? IS NULL OR ? = '' OR P.prod_proc_code LIKE CONCAT('%', ?, '%') )
        
        /* 흐름도명 */
        AND ( ? IS NULL OR ? = '' OR P.po_name LIKE CONCAT('%', ?, '%') )
        
        /* 제품코드 */
        AND ( ? IS NULL OR ? = '' OR D.prod_code LIKE CONCAT('%', ?, '%') )
        
        /* 제품명 */
        AND ( ? IS NULL OR ? = '' OR D.prod_name LIKE CONCAT('%', ?, '%') )
        
        /* 등록일자 (시작일) */
        AND ( ? IS NULL OR DATE(P.reg_date) >= ? )`,

  getSubProcessList: `
    SELECT 
            D.no AS no,
            D.po_code AS poCode,
            C.note AS remark,
            O.po_name AS poName,
            C.note AS machine
    FROM
            prod_proc_d_tbl AS D
    INNER JOIN
            po_tbl AS O ON D.po_code = O.po_code
    LEFT JOIN
            common_code AS C ON D.eq_type = C.com_value 
    AND 
            C.group_value = '1A'
    WHERE
            D.prod_proc_code = ?
    ORDER BY
            D.no ASC`,

  getSubProcessCode: `
    SELECT 
            po_code AS poCode, 
            po_name As poName, 
            note AS remark, 
            qcr_code AS qcr 
    FROM 
            po_tbl`,

  getLineFlowList: `
  SELECT 
            A.line_code AS lineCode, -- 라인코드
            A.line_name AS lineName, -- 라인명
            B.note AS lineType, -- 라인유형
            D.note AS useYn, -- 사용여부
            A.regdate_t AS regDate, -- 등록일자
            A.note AS remark, -- 비고
            C.dept_name AS mdept -- 담당부서
        FROM 
            line_tbl AS A
        INNER JOIN 
            common_code AS B ON A.line_type = B.com_value
        AND 
            B.group_value = '0S'
        INNER JOIN 
            common_code AS D ON A.is_used = D.com_value
        AND 
            D.group_value = '0F'
        INNER JOIN 
            dept_tbl AS C ON A.mdept_code = C.dept_code
        WHERE 
            (? IS NULL OR A.line_code = ?)
        ORDER BY 
            A.line_code ASC`,

  getLineDetailList: `
    SELECT
	    PD.no AS lineSeq,
        PT.po_name AS processName,
	    A.pp_code AS lineDetailCode,
        B.eq_code AS equipmentCode,
        B.eq_name AS equipmentName,
        C.note AS useYn
    FROM
	    line_d_tbl AS A
    INNER JOIN
	    prod_proc_d_tbl AS PD ON A.pp_code = PD.pp_code
    INNER JOIN
	    prod_proc_tbl AS PT ON PD.prod_proc_code = PT.prod_proc_code
    INNER JOIN
	    eq_tbl AS B ON A.eq_code = B.eq_code
    LEFT JOIN
	    common_code AS C ON B.is_used = C.com_value
    AND
	    C.group_value = '0F'
    WHERE
	    A.line_code = ?
    ORDER BY
	    PD.no ASC`,

  getItemList: `
    SELECT
        prod_code AS itemCode,
        prod_name AS itemName
    FROM
        prod_tbl`,
};
