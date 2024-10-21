CREATE VIEW notification_view AS
SELECT *
FROM (
  -- Query untuk table lembur
  SELECT
    'lembur' AS tablename,
    wo.id,
    NULL AS status_indicatours, -- Placeholder untuk 'status' di tabel lembur
    wo.userid_created AS user_created,
    wo.user_adm AS user_1,
    wo.user_line AS user_2,
    wo.user_gm AS user_3,
    wo.user_hr AS user_4,
    wo.user_director AS user_5,
    wo.user_fat AS user_6,
    wo.admin_approved AS status_1,
    wo.line_approved AS status_2,
    wo.gm_approved AS status_3,
    wo.hrga_approved AS status_4,
    wo.director_approved AS status_5,
    wo.fat_approved AS status_6
  FROM work_overtime wo

  UNION ALL

  -- Query untuk table cuti
  SELECT
    'cuti' AS tablename,
    ct.id,
    NULL AS status_indicatours, -- Placeholder untuk 'status' di tabel cuti
    ct.user_id AS user_created,
    ct.user_line AS user_1,
    ct.user_hr AS user_2,
    NULL AS user_3,
    NULL AS user_4,
    NULL AS user_5,
    NULL AS user_6,
    ct.line_approved AS status_1,
    ct.hrga_approved AS status_2,
    NULL AS status_3,
    NULL AS status_4,
    NULL AS status_5,
    NULL AS status_6
  FROM cutis ct

  UNION ALL

  -- Query untuk table perubahan shift
  SELECT
    'perubahan-shift' AS tablename,
    ps.id,
    ps.status AS status_indicatours, -- Status di tabel perubahan shift
    ps.user_id AS user_created,
    ps.line_id AS user_1,
    ps.hr_id AS user_2,
    NULL AS user_3,
    NULL AS user_4,
    NULL AS user_5,
    NULL AS user_6,
    ps.line_approve AS status_1,
    ps.hr_approve AS status_2,
    NULL AS status_3,
    NULL AS status_4,
    NULL AS status_5,
    NULL AS status_6
  FROM perubahan_shifts ps

  UNION ALL

  -- Query untuk table koreksi absensi
  SELECT
    'koreksi-absensi' AS tablename,
    ka.id,
    ka.status AS status_indicatours, -- Status di tabel koreksi absensi
    ka.user_id AS user_created,
    ka.line_id AS user_1,
    ka.hr_id AS user_2,
    NULL AS user_3,
    NULL AS user_4,
    NULL AS user_5,
    NULL AS user_6,
    ka.line_approve AS status_1,
    ka.hr_approve AS status_2,
    NULL AS status_3,
    NULL AS status_4,
    NULL AS status_5,
    NULL AS status_6
  FROM koreksi_absens ka
) AS mixtable;
