const QCR_CODE_LIST = `
SELECT 
	qcr_code,
  check_method
FROM qcr_tbl
`;

const QC_SEARCH = `
SELECT 
	qir_code,
  prod_code,
  prod_name,
  qcr_code,
  check_method,
  note,
  unit,
  result,
  DATE_FORMAT(start_date, '%y-%m-%d') AS start_date,
  source_type
FROM v_quality_result_all
WHERE qcr_code LIKE CONCAT('%', IFNULL(?, ''), '%')
AND (prod_code LIKE CONCAT('%', IFNULL(?, ''), '%') OR prod_code IS NULL)
AND (prod_code LIKE CONCAT('%', IFNULL(?, ''), '%') OR prod_code IS NULL)
AND check_method LIKE CONCAT('%', IFNULL(?, ''), '%')
AND result LIKE CONCAT('%', IFNULL(?, ''), '%')
AND start_date LIKE CONCAT('%', IFNULL(?, ''), '%')
ORDER BY start_date DESC;
`;

const QC_QIO_NULL_LIST = `
SELECT
  qio.qio_code,
  p.prod_name,
  qio.prdr_code,
  mat.mat_name,
  qio.mpr_d_code,
  qio.insp_vol
FROM qio_tbl qio
LEFT JOIN prdr_tbl prdr ON qio.prdr_code = prdr.prdr_code
LEFT JOIN prod_tbl p ON prdr.prod_code = p.prod_code
LEFT JOIN mpr_d_tbl mpr_d ON qio.mpr_d_code = mpr_d.mpr_d_code
LEFT JOIN mat_tbl mat ON mat.mat_code = mpr_d.mat_code
WHERE unpass_qtt IS NULL
AND pass_qtt IS NULL
`;

const QC_QIR_LIST = `
SELECT 
    qir.qir_code,
    qir.qio_code,
    qir.qcr_code,
    qcr.check_method,
    qcr.unit,
    qcr.range_top,
    qcr.range_bot,
    qir.result,
    qir.start_date,
    COALESCE(p.prod_name, mat.mat_name) AS item_name,
    qio.insp_vol,
    qio.prdr_code,
    qio.mpr_d_code,
    CASE 
        WHEN qio.prdr_code IS NOT NULL THEN 'prdr'
        WHEN qio.mpr_d_code IS NOT NULL THEN 'mpr'
        ELSE 'unknown'
    END AS type
FROM qir_tbl qir
JOIN qio_tbl qio ON qir.qio_code = qio.qio_code
LEFT JOIN prdr_tbl prdr ON qio.prdr_code = prdr.prdr_code
LEFT JOIN prod_tbl p ON prdr.prod_code = p.prod_code
LEFT JOIN mpr_d_tbl mpr_d ON qio.mpr_d_code = mpr_d.mpr_d_code
LEFT JOIN mat_tbl mat ON mat.mat_code = mpr_d.mat_code
JOIN qcr_tbl qcr ON qir.qcr_code = qcr.qcr_code
WHERE qio.qio_code = ?
`;

const QC_RESULT_SAVE = `
CALL UPDATE_QIR_RESULT(?, ?, ?, ?, ?, ?)
`;

const QC_RESULT_SAVE_MPR_D = `
UPDATE qir_tbl
SET 
  start_date = ?,
  end_date = ?,
  result = ?,
	note = ?,
  qir_emp_code = ?
WHERE qir_code = ?
`;

const QC_PASS_QTT = `
UPDATE qio_tbl
SET pass_qtt = ?
WHERE qio_code = ?
`;

const QC_UNPASS_QTT = `
UPDATE qio_tbl
SET unpass_qtt = ?
WHERE qio_code = ?
`;

const QC_RESULT_DELETE = `
DELETE FROM qir_tbl
WHERE qir_code = ?
`;

module.exports = {
  QCR_CODE_LIST,
  QC_SEARCH,
  QC_QIO_NULL_LIST,
  QC_QIR_LIST,
  QC_RESULT_SAVE,
  QC_RESULT_SAVE_MPR_D,
  QC_PASS_QTT,
  QC_UNPASS_QTT,
  QC_RESULT_DELETE,
};
