/* 
Attempt to create a constant time password hash check by
joining with a made up value so there's always a hash value
to crypt against. The LIMIT 1 gets us the real value when
the user exists and the null user when the user or password
check fails returning an empty result set on the join.
*/
SELECT
  awm.user.id, email, username, first_name, last_name
FROM (
  SELECT id
  FROM (
    SELECT id, password FROM awm.user WHERE lower(username) = ${username}
    UNION ALL
    SELECT null, crypt(gen_random_uuid()::text, gen_salt('bf'))
    LIMIT 1
  ) with_null
  WHERE password = crypt(${password}, password)
) test_user
LEFT JOIN awm.user ON awm.user.id = test_user.id
