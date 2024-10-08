-- query untuk table lembur::start
SELECT
'lembur' as tablename,
wo.id,
wo.userid_created as user_created,
wo.user_adm as user_1,
wo.user_line as user_2,
wo.user_gm as user_3,
wo.user_hr as user_4,
wo.user_director as user_5,
wo.user_fat as user_6,
wo.admin_approved as status_1,
wo.line_approved as status_2,
wo.gm_approved as status_3,
wo.hrga_approved as status_4,
wo.director_approved as status_5,
wo.fat_approved as status_6
from work_overtime wo
-- query untuk table lembur::end

-- query untuk table cuti::start
SELECT
'cuti' as tablename,
ct.`id`,
ct.user_id as user_created,
ct.user_line as user_1,
ct.user_hr as user_2,
NULL as user_3,
NULL as user_4,
NULL as user_5,
NULL as user_6,
ct.line_approved as status_1,
ct.hrga_approved as status_2,
NULL as status_3,
NULL as status_4,
NULL as status_5,
NULL as status_6
from cutis ct
-- query untuk table cuti::end

-- query untuk table perubahan-shift::start
SELECT
'perubahan-shift' as tablename,
ps.id,
ps.user_id as user_created,
ps.line_id as user_1,
ps.hr_id as user_2,
NULL as user_3,
NULL as user_4,
NULL as user_5,
NULL as user_6,
ps.line_approve as status_1,
ps.hr_approve as status_2,
NULL as status_3,
NULL as status_4,
NULL as status_5,
NULL as status_6
from perubahan_shifts ps
-- query untuk table perubahan-shift::end

-- gabungkan seluruh query ini menjadi 1 view dengan fungsi union all
-- contoh
SELECT *
FROM (
  SELECT
    'lembur' AS tablename,
    wo.id,
    NULL AS status_indicatours, -- Placeholder for 'status' to match other SELECTs
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

  SELECT
    'cuti' AS tablename,
    ct.id,
    NULL AS status_indicatours, -- Placeholder for 'status'
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

  SELECT
    'perubahan-shift' AS tablename,
    ps.id,
    ps.status AS status_indicatours, -- Placeholder for 'status'
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

  SELECT
    'koreksi-absensi' AS tablename,
    ka.id,
    ka.status AS status_indicatours,
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
