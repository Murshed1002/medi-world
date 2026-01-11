export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface JwtPayload {
  user_id: string;
  phone_number: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface DeviceInfo {
  device_type?: string;
  os?: string;
  browser?: string;
  [key: string]: any;
}
