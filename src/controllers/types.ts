import { Option} from 'fp-ts/lib/Option'

export type QueryParams = {
  limit:  Option<number>
  offset: Option<number>
  filter: Option<Record<string, string>>
}