// Rethrow / throw errors to stop jest
export const expect_error = (msg: string) =>
  (err: Error) => () => expect(err.message).toEqual(msg)
