import { ISorting } from '../interface/global.interface'

export const validateSorting = (
  sortIdData: string | null,
  descData: string | null
): { sortId: string; desc: boolean } => {
  const sortId: string =
    sortIdData !== 'null' && sortIdData !== null ? sortIdData : 'createdAt'
  const desc: boolean = (descData ?? 'false') === 'true'
  return { sortId, desc }
}

export const includeOperationFields = (
  sorting: ISorting,
  operationFields: string[]
): boolean => {
  return sorting?.sortId !== null && operationFields.includes(sorting?.sortId)
}

export const buildOrderBy = (
  sortId?: string,
  desc?: boolean,
  defaultOrder = 'desc' as 'asc' | 'desc'
): any => {
  if (sortId) {
    return { [sortId]: desc ? 'desc' : 'asc' }
  }
  // default sort (newest first)
  return { createdAt: defaultOrder }
}
