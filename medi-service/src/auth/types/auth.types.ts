export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface JwtPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expiresIn: number;
}

export interface DeviceInfo {
  device_type?: string;
  os?: string;
  browser?: string;
  [key: string]: any;
}
