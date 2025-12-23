import { StatusCodes } from 'http-status-codes'
import UserService from '../services/user.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'
import { Request, Response } from 'express'

const userService = new UserService()
// get all users
const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { page, perPage, search } = validatePagination(
    req.query.currentPage as string,
    req.query.perPage as string,
    req.query.searchTerm as string
  )
  const { sortId, desc } = validateSorting(
    req.query.id as string,
    req.query.desc as string
  )

  const filters = {
    user: req?.user as any,
    role: req.query.role as string,
    accountStatus: req.query.accountStatus as string,
  }

  const { users, totalCount } = await userService.getAll({
    paginationData: {
      page,
      perPage,
      search,
      sortId,
      desc,
    },
    filters,
  })
  res.status(StatusCodes.OK).json({
    data: users,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createUser = async (req: Request, res: Response): Promise<void> => {
  const message = await userService.create(req.body, req?.user as any)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleUser = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getById(req.params.id, req?.user)
  res.status(StatusCodes.OK).json({ data: user })
}

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const message = await userService.update(req.params.id, req.body, req?.user)
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const message = await userService.delete(req.params.id, req?.user as any)
  res.status(StatusCodes.OK).json({ msg: message })
}

const changePassword = async (req: Request, res: Response): Promise<void> => {
  const message = await userService.changePassword(
    req?.user?.userId as string,
    req.body
  )
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getUsers,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
  changePassword,
}
