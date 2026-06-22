export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  createdAt?: Date;
  lastLoginAt?: Date;
}