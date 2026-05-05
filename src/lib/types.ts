export type PaymentStatus = 'pending' | 'validated' | 'rejected';
export type AttendanceStatus = 'absent' | 'present';
export type MembershipStatus = 'active' | 'inactive';
export type UserType = 'Joven' | 'Adulto';

export interface Participant {
  id: string;
  fullName: string;
  dni: string;
  email: string;
  scoutGroup: string;
  userType: UserType;
  bankReference: string;
  paymentDate: string;
  amount: number;
  receiptUrl: string;
  status: PaymentStatus;
  membershipStatus: MembershipStatus;
  attendance: AttendanceStatus;
  qrCode?: string;
}

export interface RegistrationFormData {
  fullName: string;
  dni: string;
  email: string;
  scoutGroup: string;
  userType: UserType;
  bankReference: string;
  paymentDate: string;
  amount: string;
  receiptImage?: string; // Data URI
}
