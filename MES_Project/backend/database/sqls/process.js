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
            D.no,
            D.po_code,
            C.note AS eq_type_name,
            O.po_name
    FROM
            prod_proc_d_tbl AS D
    INNER JOIN
            po_tbl AS O ON D.po_code = O.po_code
    LEFT JOIN
            common_code AS C ON D.eq_type = C.com_value AND C.group_value = '1A'
    WHERE
            D.prod_proc_code = ?
    ORDER BY
            D.no ASC`,
};
