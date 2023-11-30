export interface UserI {
  id?: number;
  fullName?: string;
  email?: string;
  password?: string;
  gender?: string
  city?: string
  district?: string
  ward?: string
  streetAddress?: string
  birthYear?: number
  avatar?: string
  avatarId?: string
  phone?: string
  operatingStatus?: boolean
  hashedRt?: string
  roleId?: number
  clinicId?: number
  tokenGoogle?: string
  createdAt?: Date
}