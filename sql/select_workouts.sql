SELECT
  awm.workout.workout_date AS date,
  awm.workout.id AS wrk_id,
  awm.set.id AS set_id,
  awm.block.id AS blk_id,
  awm.workout.seqno AS wrk_no,
  awm.block.seqno AS blk_no,
  awm.set_group.seqno AS grp_no,
  awm.set.setno AS set_no,
  awm.set.set_type AS set_type,
  awm.set.notes AS set_notes,
  awm.set.exercise AS set_exercise,
  awm.set.weight AS set_weight,
  awm.set.unit AS set_unit,
  awm.set.reps AS set_reps,
  awm.set.duration AS set_duration,
  awm.set.distance AS set_distance,
  awm.set_group.style AS grp_style,
  awm.block.block_type AS blk_type,
  awm.block.notes AS blk_notes,
  CASE awm.block.block_type
    WHEN 'HIC' THEN concat(awm.hic_block.style, awm.fbt_block.style)
    WHEN 'FBT' THEN concat(awm.fbt_block.style, awm.hic_block.style)
  END AS blk_style,
  CASE awm.block.block_type
    WHEN 'SE' THEN awm.se_block.duration
    WHEN 'HIC' THEN awm.hic_block.duration
    WHEN 'FBT' THEN awm.fbt_block.duration
  END AS blk_duration,
  CASE awm.block.block_type
    WHEN 'FBT' THEN awm.fbt_block.exercise
  END AS blk_exercise,
  CASE awm.block.block_type
    WHEN 'HIC' THEN awm.hic_block.distance
  END AS blk_distance,
  awm.workout.created
FROM
  awm.workout
INNER JOIN
  awm.block ON awm.workout.id = awm.block.workout_id
INNER JOIN
  awm.set_group ON awm.block.id = awm.set_group.block_id
INNER JOIN
  awm.set ON awm.set_group.id = awm.set.group_id
LEFT JOIN
  awm.se_block ON awm.block.id = awm.se_block.id AND awm.block.block_type = 'SE'
LEFT JOIN
  awm.hic_block ON awm.block.id = awm.hic_block.id AND awm.block.block_type = 'HIC'
LEFT JOIN
  awm.fbt_block ON awm.block.id = awm.fbt_block.id AND awm.block.block_type = 'FBT'
WHERE
  awm.workout.id
IN (
  SELECT
    awm.workout.id
  FROM
    awm.workout
  ${where:raw}
  ORDER BY
    awm.workout.workout_date DESC
  ${limit:raw}
  ${offset:raw}
)
ORDER BY
  awm.workout.workout_date DESC,
  awm.workout.seqno,
  awm.block.seqno,
  awm.set_group.seqno,
  awm.set.setno