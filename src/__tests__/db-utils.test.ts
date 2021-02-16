import { format } from 'date-fns'
import { where } from '../db-utils'

const POSTGRES_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"

describe('WHERE clause generation', () => {
  it('should handle a simple boolean', () => {
    const clause = where({ 'col': true })
    expect(clause).toEqual(`WHERE col = true`)
  })

  it('should handle a simple string', () => {
    const clause = where({ 'col': 'my-set-id' })
    expect(clause).toEqual(`WHERE col = 'my-set-id'`)
  })

  it('should handle a simple number', () => {
    const clause = where({ 'col': 5 })
    expect(clause).toEqual(`WHERE col = 5`)
  })

  it('should handle a simple date', () => {
    const now = new Date()
    const clause = where({ 'col': now })

    const iso = format(now, POSTGRES_DATE_FORMAT)
    expect(clause).toEqual(`WHERE col = '${iso}'`)
  })

  it('should handle simple null', () => {
    const clause = where({ 'col': null })
    expect(clause).toEqual(`WHERE col IS NULL`)
  })

  it('should handle simple number lists', () => {
    const clause = where({ 'col': [1, 2, 3] }, false)
    expect(clause).toEqual(`WHERE col IN (1,2,3)`)
  })

  it('should handle simple string lists', () => {
    const clause = where({ 'col': ['a', 'b', 'c'] }, false)
    expect(clause).toEqual(`WHERE col IN ('a','b','c')`)
  })

  it('should handle NOT null', () => {
    const clause = where({ 'col': { 'IS NOT': null } })
    expect(clause).toEqual(`WHERE col IS NOT NULL`)
  })

  it('should handle objects specifying operations', () => {
    const clause = where({ 'col': { '>=': 5 } })
    expect(clause).toEqual(`WHERE col >= 5`)
  })

  it('should handle number lists', () => {
    const clause = where({ 'col': { 'IN': [1, 2, 3] } }, false)
    expect(clause).toEqual(`WHERE col IN (1,2,3)`)
  })

  it('should handle NOT IN a list', () => {
    const clause = where({ 'col': { 'NOT IN': ['a', 'b', 'c'] } }, false)
    expect(clause).toEqual(`WHERE col NOT IN ('a','b','c')`)
  })

  it('should handle string lists', () => {
    const clause = where({ 'col': { 'IN': ['a', 'b', 'c'] } }, false)
    expect(clause).toEqual(`WHERE col IN ('a','b','c')`)
  })

  it('should handle multiple AND operations', () => {
    const clause = where({ 'col': { '>=': 5, '<': 10 } })
    expect(clause).toEqual(`WHERE col >= 5 AND col < 10`)
  })

  it('should handle multiple OR operations', () => {
    const clause = where({ 'col': { '>=': 5, '<': 10 } }, false)
    expect(clause).toEqual(`WHERE col >= 5 OR col < 10`)
  })
})
