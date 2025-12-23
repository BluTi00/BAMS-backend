import { Prisma, ROLE } from '../generated/client/client'
import { db } from '../db/db.server'
import { ChangePasswordDto, UpdateUserDto, UserDto } from '../dto/user.dto'
import { messages } from '../constants/message'
import { IPaginatedRequest } from '../interface/global.interface'
import { BadRequestError } from '../errors'
import { comparePassword, hashPassword } from '../utils/helper'
// import generatePassword from '../utils/passwordGenerator'
// import sendMail from '../utils/sendMail'
import { getLowerRoles, hasPermission } from '../utils/roleAuthority'
import { TokenData } from '../server'

class UserService {
  async create(data: UserDto, user: TokenData): Promise<string> {
    const {
      name,
      nameNp,
      email,
      phone,
      role,
      gender,
      requireLoginVerification,
    } = data
    // check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        phone,
      },
    })
    if (existingUser) {
      throw new BadRequestError(`User with phone ${phone} already exists`)
    }

    // check role authority
    if (!hasPermission(user?.role, role)) {
      throw new BadRequestError(`You are not allowed to create ${role} `)
    }

    // create new user
    // const randomPassword = generatePassword()
    const randomPassword = process.env.DEFAULT_USER_PASSWORD || 'admin@321'
    const hashedPassword = await hashPassword(randomPassword)

    await db.user.create({
      data: {
        name,
        nameNp,
        email,
        password: hashedPassword,
        phone,
        role,
        gender,
        createdById: user?.userId,
        requireLoginVerification,
      },
    })

    // // send mail to the user telling that his account is created
    // sendMail(
    //   email,
    //   'Account Created',
    //   `Your account has been created. Your password is ${randomPassword}`,
    //   `<p>Your account has been created. Your password is <strong>${randomPassword}</strong>. Don't share this with anyone. We recommend you change the password to keep it more secure.</p>`
    // )

    return messages.created('User')
  }

  async getAll({
    paginationData,
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    const { page, perPage, search, sortId, desc } = paginationData
    const { user, role } = filters

    // build the search condition
    const searchCondition: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              nameNp: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    const lowerRoles = getLowerRoles(user.role)

    searchCondition.role = {
      in: lowerRoles,
    }

    if (role) {
      searchCondition.role = role as ROLE
    }

    searchCondition.deletedAt = null

    // get the total count of the records matching the condition
    const totalCount = await db.user.count({
      where: searchCondition,
    })

    const users = await db.user.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'desc' : 'asc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      users,
    }
  }

  async getById(id: string, userAdmin: TokenData): Promise<any> {
    if (!id) {
      throw new BadRequestError('User ID is required.')
    }

    const user = await db.user.findUnique({
      where: {
        id: id,
      },
    })

    if (!user) {
      throw new BadRequestError('User not found')
    }

    // check permission
    if (
      user?.id !== userAdmin?.userId &&
      !hasPermission(userAdmin?.role, user.role)
    ) {
      throw new BadRequestError(`You are not allowed to view this user`)
    }

    return user
  }

  async update(
    id: string,
    data: UpdateUserDto,
    userAdmin: TokenData
  ): Promise<string> {
    if (!id) {
      throw new BadRequestError('User ID is required')
    }

    const {
      name,
      nameNp,
      phone,
      gender,
      role,
      isBlocked,
      isDeactivated,
      email,
      requireLoginVerification,
    } = data

    // check if user exists
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      throw new BadRequestError('User not found')
    }
    const isSelf = user.id === userAdmin?.userId

    if (!isSelf) {
      // check role authority
      if (!hasPermission(userAdmin?.role, role)) {
        throw new BadRequestError(
          `You are not allowed to update role to ${role}`
        )
      }

      // check permission
      if (!hasPermission(userAdmin?.role, user.role)) {
        throw new BadRequestError(`You are not allowed to update this user`)
      }
    }

    // check if user already exists by phone
    const existingUser = await db.user.findUnique({
      where: {
        phone,
        ...(email && { email: email }),
        NOT: { id: id },
      },
    })
    if (existingUser) {
      throw new BadRequestError('User with this phone or email already exists')
    }

    await db.user.update({
      where: { id: id },
      data: {
        name,
        nameNp,
        gender,
        role,
        isBlocked,
        isDeactivated,
        email,
        requireLoginVerification,
      },
    })

    return messages.updated('User')
  }

  // delete user
  async delete(id: string, userAdmin: TokenData): Promise<string> {
    if (!id) {
      throw new BadRequestError('User ID is required')
    }

    if (id === userAdmin.userId) {
      throw new BadRequestError('You cannot delete yourself')
    }

    const user = await db.user.findUnique({ where: { id } })

    if (!user) {
      throw new BadRequestError('User not found')
    }

    // check permission
    if (!hasPermission(userAdmin.role, user.role)) {
      throw new BadRequestError(`You are not allowed to delete this user`)
    }

    await db.user.delete({
      where: { id: id },
    })

    return messages.deleted('User')
  }

  // change password
  async changePassword(id: string, data: ChangePasswordDto): Promise<string> {
    if (!id) {
      throw new BadRequestError('User ID is required')
    }
    const { oldPassword, newPassword } = data

    const user = await db.user.findUnique({ where: { id } })

    if (!user) {
      throw new BadRequestError('User not found')
    }

    const isMatch = await comparePassword(oldPassword, user.password)
    if (!isMatch) {
      throw new BadRequestError('Old password is incorrect')
    }

    const hashedPassword = await hashPassword(newPassword)

    await db.user.update({
      where: { id: id },
      data: {
        password: hashedPassword,
      },
    })

    return messages.updated('Password')
  }
}

export default UserService
