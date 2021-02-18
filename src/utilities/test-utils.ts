// Rethrow / throw errors to stop jest
export const rethrow      = (err: Error)  => { throw (err) }
export const throw_error  = (msg: string) => () => { throw new Error(msg) }
export const expect_error = (msg: string) =>
  (err: Error) => () => expect(err.message).toEqual(msg)
