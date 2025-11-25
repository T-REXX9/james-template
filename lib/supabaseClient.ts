
import { MOCK_CONTACTS, MOCK_PIPELINE_DEALS, MOCK_PRODUCTS } from '../constants';

// --- TYPES ---
type TableName = 'contacts' | 'deals' | 'users' | 'profiles' | 'products';

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
  password?: string; // Stored in plaintext for this local demo only
}

// --- LOCAL STORAGE HELPERS ---
const DB_PREFIX = 'nexus_crm_local_';
const DB_VERSION = '4.0'; // FORCED RESET to version 4.0 to fix schema

const getTable = <T>(table: TableName): T[] => {
  try {
    const stored = localStorage.getItem(DB_PREFIX + table);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setTable = (table: TableName, data: any[]) => {
  localStorage.setItem(DB_PREFIX + table, JSON.stringify(data));
};

// --- SEEDING ---
const seedData = () => {
  const currentVersion = localStorage.getItem(DB_PREFIX + 'version');
  let shouldSeed = false;

  // 1. Check version mismatch
  if (currentVersion !== DB_VERSION) {
    console.log(`Migrating Database from ${currentVersion} to ${DB_VERSION}... Hard Resetting Data.`);
    shouldSeed = true;
  }

  // 2. Check for data corruption (e.g. missing new fields)
  if (!shouldSeed) {
      const existingContacts = getTable<any>('contacts');
      if (existingContacts.length > 0 && !existingContacts[0].contactPersons) {
          console.warn("Detected legacy data schema. Forcing re-seed.");
          shouldSeed = true;
      }
  }

  if (shouldSeed) {
    localStorage.removeItem(DB_PREFIX + 'contacts');
    localStorage.removeItem(DB_PREFIX + 'deals');
    localStorage.removeItem(DB_PREFIX + 'products');
    localStorage.setItem(DB_PREFIX + 'version', DB_VERSION);
    
    setTable('contacts', MOCK_CONTACTS);
    setTable('deals', MOCK_PIPELINE_DEALS);
    setTable('products', MOCK_PRODUCTS);
  } else {
    // Ensure tables exist if empty
    if (!localStorage.getItem(DB_PREFIX + 'contacts')) setTable('contacts', MOCK_CONTACTS);
    if (!localStorage.getItem(DB_PREFIX + 'deals')) setTable('deals', MOCK_PIPELINE_DEALS);
    if (!localStorage.getItem(DB_PREFIX + 'products')) setTable('products', MOCK_PRODUCTS);
  }

  if (!localStorage.getItem(DB_PREFIX + 'users')) {
    // Create default admin user
    const adminId = 'user_admin_001';
    const adminUser: MockUser = {
      id: adminId,
      email: 'main@tnd-opc.com',
      password: '123456', 
      user_metadata: { full_name: 'James Quek', role: 'Owner', avatar_url: 'https://i.pravatar.cc/150?u=james' }
    };
    setTable('users', [adminUser]);
    setTable('profiles', [{
      id: adminId,
      email: adminUser.email,
      full_name: adminUser.user_metadata.full_name,
      avatar_url: adminUser.user_metadata.avatar_url,
      role: 'Owner'
    }]);
  }
};

// Initialize DB on load
if (typeof window !== 'undefined') {
  seedData();
}

// --- QUERY BUILDER ---
class MockQueryBuilder<T> {
  private data: T[];
  private error: any = null;
  private tableName: TableName;
  private operation: 'select' | 'update' | 'delete' = 'select';
  private updatePayload: any = null;
  private isSingle: boolean = false;

  constructor(tableName: TableName) {
    this.tableName = tableName;
    this.data = getTable<T>(tableName);
  }

  select(columns?: string) {
    this.operation = 'select';
    return this;
  }

  eq(column: string, value: any) {
    this.data = this.data.filter((item: any) => item[column] === value);
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async insert(row: any) {
    const currentData = getTable(this.tableName);
    if (!row.id) row.id = Math.random().toString(36).substr(2, 9);
    const newData = [...currentData, row];
    setTable(this.tableName, newData);
    return { data: [row], error: null };
  }

  update(updates: any) {
    this.operation = 'update';
    this.updatePayload = updates;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  then(resolve: (result: { data: any, error: any }) => void, reject?: (err: any) => void) {
    try {
        if (this.operation === 'select') {
             if (this.isSingle) {
                if (this.data.length === 0) {
                   resolve({ data: null, error: { message: 'No rows found' } });
                } else {
                   resolve({ data: this.data[0], error: null });
                }
             } else {
                resolve({ data: this.data, error: this.error });
             }
        } 
        else if (this.operation === 'update') {
            const idsToUpdate = (this.data as any[]).map(item => item.id);
            const fullTableData = getTable<any>(this.tableName);
            
            const updatedTableData = fullTableData.map(item => {
                if (idsToUpdate.includes(item.id)) {
                    return { ...item, ...this.updatePayload };
                }
                return item;
            });
    
            setTable(this.tableName, updatedTableData);
            resolve({ data: idsToUpdate, error: null });
        } 
        else if (this.operation === 'delete') {
            const idsToDelete = (this.data as any[]).map(item => item.id);
            const fullTableData = getTable<any>(this.tableName);
            
            const remainingData = fullTableData.filter(item => !idsToDelete.includes(item.id));
            
            setTable(this.tableName, remainingData);
            resolve({ data: idsToDelete, error: null });
        } else {
            resolve({ data: null, error: null });
        }
    } catch (e) {
        if (reject) reject(e);
    }
  }
}

// --- AUTH OBSERVER ---
const authSubscribers: Array<(event: string, session: any) => void> = [];

const notifySubscribers = (event: string, session: any) => {
  authSubscribers.forEach(callback => callback(event, session));
};

export const supabase = {
  from: (table: TableName) => new MockQueryBuilder(table),
  
  auth: {
    getSession: async () => {
      const sessionStr = localStorage.getItem(DB_PREFIX + 'session');
      return { data: { session: sessionStr ? JSON.parse(sessionStr) : null }, error: null };
    },
    
    getUser: async () => {
       const sessionStr = localStorage.getItem(DB_PREFIX + 'session');
       const session = sessionStr ? JSON.parse(sessionStr) : null;
       return { data: { user: session?.user || null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      authSubscribers.push(callback);
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {
              const index = authSubscribers.indexOf(callback);
              if (index > -1) authSubscribers.splice(index, 1);
            } 
          } 
        } 
      };
    },

    signUp: async ({ email, password, options }: any) => {
      const users = getTable<MockUser>('users');
      if (users.find(u => u.email === email)) {
        return { data: null, error: { message: 'User already exists' } };
      }

      const newUser: MockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        user_metadata: options?.data || {}
      };

      setTable('users', [...users, newUser]);
      
      // Also create profile
      const profiles = getTable('profiles');
      setTable('profiles', [...profiles, {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.user_metadata.full_name,
        role: 'sales_agent',
        avatar_url: newUser.user_metadata.avatar_url
      }]);

      return { data: { user: newUser, session: null }, error: null };
    },

    signInWithPassword: async ({ email, password }: any) => {
      const users = getTable<MockUser>('users');
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { data: { session: null }, error: { message: 'Invalid login credentials' } };
      }

      const session = {
        access_token: 'mock_token_' + Date.now(),
        user: user
      };
      localStorage.setItem(DB_PREFIX + 'session', JSON.stringify(session));
      notifySubscribers('SIGNED_IN', session);
      return { data: { session, user }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem(DB_PREFIX + 'session');
      notifySubscribers('SIGNED_OUT', null);
      return { error: null };
    }
  }
};
