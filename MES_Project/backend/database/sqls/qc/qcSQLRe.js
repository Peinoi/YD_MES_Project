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

const QC_PENDING_LIST = `
SELECT 
  qir_code,
  note
FROM qir_tbl
WHERE result = 'g0'
`;

const QC_INSTRUCTION = `
SELECT 
	qir.qir_code,
  qir.qcr_code,
	qio.qio_code,
  qio.insp_vol,
  p.prod_name,
  qcr.check_method,
  qcr.range_top,
  qcr.range_bot,
  c.note AS unit
FROM qir_tbl qir
JOIN qio_tbl qio ON qir.qio_code = qio.qio_code
JOIN qcr_tbl qcr ON qcr.qcr_code = qir.qcr_code
JOIN prdr_tbl prdr ON prdr.prdr_code = qio.prdr_code
JOIN prod_tbl p ON p.prod_code = prdr.prod_code
JOIN common_code c ON c.com_value = qcr.unit
WHERE qir.qir_code = ?
`;

const QC_INSTRUCTION_MPR_D = `
SELECT 
	qir.qir_code,
  qir.qcr_code,
	qio.qio_code,
  qio.insp_vol,
  qcr.check_method,
  qcr.range_top,
  qcr.range_bot,
  c.note AS unit
FROM qir_tbl qir
JOIN qio_tbl qio ON qir.qio_code = qio.qio_code
JOIN qcr_tbl qcr ON qcr.qcr_code = qir.qcr_code
JOIN mpr_d_tbl mpr ON mpr.mpr_d_code = qio.mpr_d_code
JOIN common_code c ON c.com_value = qcr.unit
WHERE qir.qir_code = ?
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

const QC_RESULT_DELETE = `
DELETE FROM qir_tbl
WHERE qir_code = ?
`;

module.exports = {
  QCR_CODE_LIST,
  QC_SEARCH,
  QC_PENDING_LIST,
  QC_INSTRUCTION,
  QC_INSTRUCTION_MPR_D,
  QC_RESULT_SAVE,
  QC_RESULT_SAVE_MPR_D,
  QC_RESULT_DELETE,
};
