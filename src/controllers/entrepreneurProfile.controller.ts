import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import EntrepreneurProfileService from '../services/entrepreneurProfile.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const entrepreneurProfileService = new EntrepreneurProfileService()

const getEntrepreneurProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    applicationId: req.query.applicationId as string,
  }

  const { entrepreneurProfiles, totalCount } =
    await entrepreneurProfileService.getAll({
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
    data: entrepreneurProfiles,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createEntrepreneurProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await entrepreneurProfileService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleEntrepreneurProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const entrepreneurProfile = await entrepreneurProfileService.getById(
    req.params.id
  )
  res.status(StatusCodes.OK).json({ data: entrepreneurProfile })
}

const updateEntrepreneurProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await entrepreneurProfileService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteEntrepreneurProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await entrepreneurProfileService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getEntrepreneurProfiles,
  createEntrepreneurProfile,
  getSingleEntrepreneurProfile,
  updateEntrepreneurProfile,
  deleteEntrepreneurProfile,
}
