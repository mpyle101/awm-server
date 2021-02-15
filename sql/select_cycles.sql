SELECT
  id,
  name,
  start_date,
  end_date
FROM
  awm.cycle
${where:raw}
ORDER BY
  start_date
${limit:raw}
${offset:raw}