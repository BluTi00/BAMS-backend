export const getPagination = (page: number, size: number) => {
  const limit: number = size ? +size : 10
  const offset: number = page ? page * limit : 0

  return { limit, offset }
}
export function validatePagination(
  pageCount: string,
  perPageData: string,
  searchQuery: string
) {
  const page: number = parseInt(pageCount) || 1
  const perPage: number = parseInt(perPageData) || 10
  const search: string = searchQuery || ''
  return { page, perPage, search }
}

export const getPagingData = (
  total: number,
  page: number,
  limit: number,
  searchQuery: string = ''
) => {
  const currentPage: number = page ? +page : 0
  const totalPages: number = Math.ceil(total / limit)

  return {
    total,
    totalPages,
    currentPage,
    perPage: limit,
    searchTerm: searchQuery,
  }
}
