SELECT
  workout.workout_date AS date,
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
INNER JOIN
  awm.set_group ON awm.set.group_id = awm.set_group.id
INNER JOIN
  awm.block ON awm.set_group.block_id = awm.block.id
INNER JOIN
  awm.workout ON awm.block.workout_id = awm.workout.id
${where:raw}
ORDER BY
  set.weight DESC,
  workout.workout_date DESC,
  set.id
LIMIT 1

