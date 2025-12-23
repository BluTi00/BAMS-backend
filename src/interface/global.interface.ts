export interface IUser {
  userId: string
  role: string
}

export interface ISorting {
  sortId: string | null
  desc: boolean | null
}

export interface IPaginatedRequest {
  page: number
  perPage: number
  search: string
  sortId: string
  desc: boolean
}
