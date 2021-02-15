SELECT
  key,
  name,
  weight_unit as unit
FROM
  awm.exercise
${where:raw}
ORDER BY
  name
${limit:raw}
${offset:raw}
