SELECT
  DISTINCT ON (set.reps, set.weight)
  set.id as set_id,
  set.setno AS set_no,
  set.set_type AS set_type,
  set.notes AS set_notes,
  set.exercise AS set_exercise,
  set.weight AS set_weight,
  set.unit AS set_unit,
  set.reps AS set_reps,
  set.duration AS set_duration,
  set.distance AS set_distance
FROM awm.set
JOIN (
  SELECT
    exercise, reps, MAX(weight) as weight
  FROM
    awm.set
  ${where:raw}
  GROUP BY
    exercise, reps
  HAVING
    reps > 0
  ORDER BY
    reps
  ${limit:raw}
) topsets
  ON set.exercise = topsets.exercise 
  AND set.reps = topsets.reps
  AND set.weight = topsets.weight
ORDER BY
  set.reps,
  set.weight,
  set.id DESC

