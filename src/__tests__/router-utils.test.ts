import { pipe } from 'fp-ts/function'
import { Option, fold, none } from 'fp-ts/Option'

import * as E from 'fp-ts/Either'

import { rethrow, throw_error, expect_error } from '../utilities/test-utils'
import { parse_query } from '../utilities/web-utils'

type Params = {
  limit:  Option<number>;
  offset: Option<number>;
  filter: Option<Record<string, string>>;
}

const check_value = <T>(params: Params, key: string, value: T) => {
  pipe(
    params[key],
    fold(
      throw_error(`${key} not found`),
      v => expect(v).toEqual(value)
    )
  )
}

describe('Router utilities', () => {

  it('should handle undefined query parameters', () => {
    const params = pipe(
      parse_query(undefined),
      E.getOrElseW(rethrow)
    )

    expect(params.limit).toEqual(none)
    expect(params.offset).toEqual(none)
    expect(params.filter).toEqual(none)
  })

  it('should handle empty query parameters', () => {
    const params = pipe(
      parse_query({}),
      E.getOrElseW(rethrow)
    )

    expect(params.limit).toEqual(none)
    expect(params.offset).toEqual(none)
    expect(params.filter).toEqual(none)
  })

  it('should handle query parameters with no filter', () => {
    const query = {
      limit: '5',
      offset: '10'
    };
    const params = pipe(
      parse_query(query),
      E.getOrElseW(rethrow)
    );

    check_value(params, 'limit', 5)
    check_value(params, 'offset', 10)
    expect(params.filter).toEqual(none)
  })

  it('should handle query parameters with only a filter', () => {
    const query = {
      param1: 'bob',
      param2: 'fred'
    };

    (pipe(
      parse_query(query),
      E.fold(
        rethrow,
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
      parse_query(query),
      E.fold(
        rethrow,
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
      limit: 'snafu'
    };

    (pipe(
      parse_query(query),
      E.fold(
        expect_error('Not a number: snafu'),
        throw_error('Should have failed: limit is "snafu"')
      )
    ))()
  })

  it('should fail on a bad offset value', () => {
    const query = {
      offset: 'bar'
    };

    (pipe(
      parse_query(query),
      E.fold(
        expect_error('Not a number: bar'),
        throw_error('Should have failed: offset is "bar"')
      )
    ))()
  })

  it('should fail if either limit or offset is bad', () => {
    const query = {
      limit: '5',
      offset: 'foo'
    };

    (pipe(
      parse_query(query),
      E.fold(
        expect_error('Not a number: foo'),
        throw_error('Should have failed: offset is "foo"')
      )
    ))()
  })
})
