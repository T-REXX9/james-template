
export enum DealStage {
  NEW = 'New',
  DISCOVERY = 'Discovery',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export enum CustomerStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PROSPECTIVE = 'Prospective',
  BLACKLISTED = 'Blacklisted'
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export interface Interaction {
  id: string;
  date: string;
  type: 'Email' | 'Call' | 'Meeting' | 'SMS';
  notes: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface Comment {
  id: string;
  author: string;
  role: string; // e.g., 'Owner', 'Sales Agent'
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface SalesRecord {
  id: string;
  date: string;
  product: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface ContactPerson {
  id: string;
  enabled: boolean;
  name: string;
  position: string;
  birthday: string;
  telephone: string;
  mobile: string;
  email: string;
}

// Redesigned Contact Schema
export interface Contact {
  id: string;
  
  // Core Identity
  company: string;          // Mapped from "customer_name"
  customerSince: string;    // Mapped from "since"
  status: CustomerStatus;   // Mapped from "status_filter"
  isHidden: boolean;        // Mapped from "hide_unhide" (true = Hidden, false = Unhidden)
  
  // Organization & Sales
  team: string;
  salesman: string;         // Assigned Agent
  referBy: string;
  
  // Location
  address: string;          // Official Address
  province: string;
  city: string;
  area: string;
  deliveryAddress: string;
  
  // Financials
  tin: string;
  priceGroup: string;       // "price_group" (AA, BB, etc.)
  businessLine: string;
  terms: string;
  transactionType: string;
  vatType: 'Inclusive' | 'Exclusive';
  vatPercentage: string;    // e.g., "12"
  
  // Dealership / Credit
  dealershipTerms: string;
  dealershipSince: string;
  dealershipQuota: number;
  creditLimit: number;
  debtType: 'Good' | 'Bad';
  
  // Meta
  comment: string;
  
  // Nested Data
  contactPersons: ContactPerson[]; // Array of persons
  
  // Legacy / UI Helpers (kept for compatibility with Dashboard/Pipeline components)
  name: string; // Primary contact display name
  avatar: string;
  totalSales?: number;
  balance?: number;
  salesByYear?: Record<string, number>;
  
  // Pipeline specific (optional)
  stage?: DealStage;
  dealValue?: number;
  interactions: Interaction[];
  comments: Comment[];
  salesHistory: SalesRecord[];
  topProducts: string[];
  assignedAgent?: string; // Syncs with salesman
  
  // AI fields
  aiScore?: number;
  winProbability?: number;
  aiReasoning?: string;
}

export interface LeadScoreResult {
  score: number;
  winProbability: number;
  reasoning: string;
  nextBestAction: string;
  riskFactors: string[];
}

// Pipeline Types
export interface PipelineDeal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  avatar: string;
  value: number;
  currency: string;
  stageId: string;
  ownerName?: string;
  daysInStage?: number;
  isOverdue?: boolean;
  isWarning?: boolean;
}

export interface PipelineColumn {
  id: string;
  title: string;
  color: string; 
  accentColor: string;
}

// Product Database Type
export interface Product {
  id: string;
  part_no: string;
  oem_no: string;
  brand: string;
  barcode: string;
  no_of_pieces_per_box: number;
  item_code: string;
  description: string;
  size: string;
  reorder_quantity: number;
  status: 'Active' | 'Inactive' | 'Discontinued';
  category: string;
  descriptive_inquiry: string;
  no_of_holes: string;
  replenish_quantity: number;
  original_pn_no: string;
  application: string;
  no_of_cylinder: string;

  // Price Groups
  price_aa: number;
  price_bb: number;
  price_cc: number;
  price_dd: number;
  price_vip1: number;
  price_vip2: number;

  // Warehouse Stocks
  stock_wh1: number;
  stock_wh2: number;
  stock_wh3: number;
  stock_wh4: number;
  stock_wh5: number;
  stock_wh6: number;
}
