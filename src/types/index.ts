// Types for the FIMS application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'AGENT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  phoneNumber: string;
  whatsAppNumber?: string;
  employmentStatus: string;
  highestQualification: string;
  maritalStatus: string;
}

export interface ContactInfo {
  address: string;
  state: string;
  localGovernment: string;
  ward: string;
  pollingUnit: string;
  cluster: string;
}

export interface BankInfo {
  bvn: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Referee {
  fullName: string;
  phoneNumber: string;
  relation: string;
}

export interface FarmCoordinates {
  latitude: number;
  longitude: number;
}

export interface FarmInfo {
  farmLocation?: string;
  farmSize?: string;
  farmCategory?: string;
  landforms?: 'lowland' | 'highland';
  farmOwnership?: string;
  farmState?: string;
  farmLocalGovt?: string;
  farmWard?: string;
  farmPollingUnit?: string;
  primaryCrop?: string;
  secondaryCrop?: string;
  farmSeason?: string;
  coordinates?: FarmCoordinates;
  farmPolygon?: FarmCoordinates[];
}

export interface Farmer {
  id: string;
  nin: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  bankInfo: BankInfo;
  referees: Referee[];
  farmInfo?: FarmInfo;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  farmerId: string;
  farmer: Farmer;
  issuedAt: string;
  issuedBy: string;
  certificateNumber: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface StoreState {
  farmers: Farmer[];
  loading: boolean;
  error: string | null;
  addFarmer: (farmer: Omit<Farmer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getFarmers: () => Promise<void>;
  searchFarmers: (query: string) => Promise<Farmer[]>;
  getFarmerByNin: (nin: string) => Promise<Farmer | null>;
}
