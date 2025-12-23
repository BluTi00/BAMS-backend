import { ROLE } from '../../generated/client/client'

interface IAdmin {
  name: string
  nameNp?: string
  email: string
  password: string
  phone: string
  role: ROLE
}

export const adminSeedData: IAdmin[] = [
  {
    name: 'Sudo Admin',
    nameNp: 'सुडो एड्मिन',
    email: '',
    password: process.env.SUDO_ADMIN_PASSWORD || 'admin@321',
    phone: '9845941694',
    role: ROLE.SUDO_ADMIN,
  },
  {
    name: 'Super Admin',
    nameNp: 'सुपर एड्मिन',
    email: '',
    password: process.env.SUPER_USER_PASSWORD || 'admin@321',
    phone: '9826490038',
    role: ROLE.SUPER_ADMIN,
  },
]
