module.exports = {
  // 1) 생산 현황
  production: `
        SELECT 
            SUM(product_qtt) AS currentOutput,
            10000 AS dailyTarget
        FROM prdr_s_tbl
        WHERE DATE(start_time) = (
            SELECT MAX(DATE(start_time)) 
            FROM prdr_s_tbl
        );
    `,

  // 2) 라면 종류별 생산량
  ramen: `
    SELECT
        p.po_name AS name,
        s.po_code AS code,
        SUM(s.product_qtt) AS qty
    FROM prdr_s_tbl s
    JOIN po_tbl p ON s.po_code = p.po_code
    WHERE DATE(s.start_time) = (
        SELECT MAX(DATE(start_time))
        FROM prdr_s_tbl
    )
    GROUP BY s.po_code, p.po_name
    ORDER BY s.po_code;
`,

  // 3) 설비 가동 현황
  equipments: `
    SELECT
        s.prdr_s_code,
        s.op_time,
        s.down_time,
        s.po_code,
        p.po_name
    FROM prdr_s_tbl s
    JOIN po_tbl p ON s.po_code = p.po_code
    WHERE DATE(s.start_time) = (
        SELECT MAX(DATE(start_time))
        FROM prdr_s_tbl
    )
    ORDER BY s.prdr_s_code;
`,
  // 발주서
  dashOrder: `
        SELECT 
            mpo_d_code AS code,
            unit,
            req_qtt,
            deadline,
            purchase_code,
            client_code,
            mat_code
        FROM mpo_d_tbl
        ORDER BY deadline DESC
        LIMIT 10
    `,
};
