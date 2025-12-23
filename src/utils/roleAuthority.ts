import { ROLE } from '../generated/client/client'

const roleAuthority = {
  SUDO_ADMIN: 100,
  SUPER_ADMIN: 90,
  ADMIN: 80,
  COMMITTEE_ADMIN: 75,
  DATA_ENTRY: 70,
  USER: 60,
}

// check if user has permission to perform action
export const hasPermission = (
  userRole: string | undefined,
  candidateRole: string | undefined
): boolean => {
  if (
    !roleAuthority[userRole as keyof typeof roleAuthority] ||
    !roleAuthority[candidateRole as keyof typeof roleAuthority]
  ) {
    return false
  }

  return (
    roleAuthority[userRole as keyof typeof roleAuthority] >=
    roleAuthority[candidateRole as keyof typeof roleAuthority]
  )
}

// define a function to get the list of roles with lower authority
export const getLowerRoles = (userRole: string) => {
  const lowerRoles = Object.keys(roleAuthority).filter(
    (role) =>
      roleAuthority[role as keyof typeof roleAuthority] <
      roleAuthority[userRole as keyof typeof roleAuthority]
  )

  return lowerRoles as ROLE[]
}

// const officeLevelAuthority = {
//   FEDERAL: 80,
//   PROVINCE: 70,
//   DISTRICT: 60,
//   MUNICIPALITY: 50,
//   WARD: 40,
// }

// // define a function to check the permission of the user to create an office with a specific level
// export const checkOfficeLevelPermission = (
//   userRole: string | undefined,
//   officeLevel: string | undefined
// ): boolean => {
//   console.log('userRole', userRole)
//   console.log('officeLevel', officeLevel)
//   if (
//     !roleAuthority[userRole as keyof typeof roleAuthority] ||
//     !officeLevelAuthority[officeLevel as keyof typeof officeLevelAuthority]
//   ) {
//     return false
//   }

//   const userRoleIndex = roleAuthority[userRole as keyof typeof roleAuthority]
//   const officeLevelIndex =
//     officeLevelAuthority[officeLevel as keyof typeof officeLevelAuthority]

//   return userRoleIndex > officeLevelIndex
// }
