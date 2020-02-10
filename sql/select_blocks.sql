SELECT
  awm.workout.workout_date AS date,
  awm.workout.id AS wrk_id,
  awm.block.id AS blk_id,
  awm.workout.seqno AS wrk_no,
  awm.block.seqno AS blk_no,
  awm.block.block_type AS blk_type,
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
  awm.block
INNER JOIN
  awm.workout ON awm.block.workout_id = awm.workout.id
LEFT JOIN
  awm.se_block ON awm.block.id = awm.se_block.id AND awm.block.block_type = 'SE'
LEFT JOIN
  awm.hic_block ON awm.block.id = awm.hic_block.id AND awm.block.block_type = 'HIC'
LEFT JOIN
  awm.fbt_block ON awm.block.id = awm.fbt_block.id AND awm.block.block_type = 'FBT'
${where:raw}
ORDER BY
  awm.workout.workout_date DESC,
  awm.workout.seqno,
  awm.block.seqno
${limit:raw}
${offset:raw}
