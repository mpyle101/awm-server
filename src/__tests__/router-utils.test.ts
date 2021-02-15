import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { Option, fold, none } from 'fp-ts/lib/Option'

import { get_params } from '../routers/utils'

type Params = {
  limit: Option<number>;
  offset: Option<number>;
  filter: Option<Record<string, string>>;
}

const check_value = <T>(params: Params, key: string, value: T) => {
  pipe(
    params[key],
    fold(
      () => fail(),
      v  => expect(v).toEqual(value)
    )
  )
}

describe('Router utilities', () => {

  it('should handle undefined query parameters', () => {
    (pipe(
      get_params(undefined),
      E.fold(
        error  => () => fail(error),
        params => () => {
          expect(params.limit).toEqual(none)
          expect(params.offset).toEqual(none)
          expect(params.filter).toEqual(none)
        }
      )
    ))()
  })

  it('should handle empty query parameters', () => {
    (pipe(
      get_params({}),
      E.fold(
        error  => () => fail(error),
        params => () => {
          expect(params.limit).toEqual(none)
          expect(params.offset).toEqual(none)
          expect(params.filter).toEqual(none)
        }
      )
    ))()
  })

  it('should handle query parameters with no filter', () => {
    const query = {
      limit: '5',
      offset: '10'
    };

    (pipe(
      get_params(query),
      E.fold(
        error  => () => fail(error),
        params => () => {
          check_value(params, 'limit', 5)
          check_value(params, 'offset', 10)
          expect(params.filter).toEqual(none)
        }
      )
    ))()
  })

  it('should handle query parameters with only a filter', () => {
    const query = {
      param1: 'bob',
      param2: 'fred'
    };

    (pipe(
      get_params(query),
      E.fold(
        error  => () => fail(error),
        params => () => {
          expect(params.limit).toEqual(none)
          expect(params.offset).toEqual(none)
          check_value(params, 'filter', {
            param1: 'bob',
            param2: 'fred'
          })
        }
      )
    ))()
  })

  it('should handle query parameters with all params', () => {
    const query = {
      limit:  '5',
      offset: '10',
      param1: 'bob',
      param2: 'fred'
    };

    (pipe(
      get_params(query),
      E.fold(
        error  => () => fail(error),
        params => () => {
          check_value(params, 'limit', 5)
          check_value(params, 'offset', 10)
          check_value(params, 'filter', { 
            param1: 'bob',
            param2: 'fred'
          })
        }
      )
    ))()
  })

  it('should fail on a bad limit value', () => {
    const query = {
      limit: 'bad value'
    };

    (pipe(
      get_params(query),
      E.fold(
        err => () => expect(err.message).toEqual('Not a number: bad value'),
        params => () => fail(params.limit)
      )
    ))()
  })

  it('should fail on a bad offset value', () => {
    const query = {
      offset: 'bad value'
    };

    (pipe(
      get_params(query),
      E.fold(
        err => () => expect(err.message).toEqual('Not a number: bad value'),
        params => () => fail(params.offset)
      )
    ))()
  })

  it('should fail if either limit or offset is bad', () => {
    const query = {
      limit: '5',
      offset: 'bad value'
    };

    (pipe(
      get_params(query),
      E.fold(
        err => () => expect(err.message).toEqual('Not a number: bad value'),
        params => () => fail(params.offset)
      )
    ))()
  })
})
