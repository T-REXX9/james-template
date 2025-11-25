
import { supabase } from '../lib/supabaseClient';
import { Contact, PipelineDeal, Product } from '../types';
import { MOCK_CONTACTS, MOCK_PRODUCTS, MOCK_PIPELINE_DEALS } from '../constants';

// --- CONTACTS SERVICE ---

export const fetchContacts = async (): Promise<Contact[]> => {
  try {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) throw error;
    
    // Auto-seed if empty (Migration helper)
    if (!data || data.length === 0) {
       console.log("No contacts found. Seeding database...");
       await seedContacts();
       return MOCK_CONTACTS;
    }

    return (data as Contact[]) || [];
  } catch (err) {
    console.error("Error fetching contacts:", err);
    return [];
  }
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<void> => {
  try {
    const { error } = await supabase.from('contacts').insert(contact);
    if (error) throw error;
  } catch (err) {
    console.error("Error creating contact:", err);
    throw err;
  }
};

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<void> => {
    try {
      const { error } = await supabase.from('contacts').update(updates).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Error updating contact:", err);
      throw err;
    }
  };

export const bulkUpdateContacts = async (ids: string[], updates: Partial<Contact>): Promise<void> => {
    try {
        const { error } = await supabase
            .from('contacts')
            .update(updates)
            .in('id', ids);
            
        if (error) throw error;
    } catch (err) {
        console.error("Error bulk updating contacts:", err);
        throw err;
    }
}

// --- DEALS SERVICE ---

export const fetchDeals = async (): Promise<PipelineDeal[]> => {
  try {
    const { data, error } = await supabase.from('deals').select('*');
    if (error) throw error;
    
    // Auto-seed
    if (!data || data.length === 0) {
        await seedDeals();
        return MOCK_PIPELINE_DEALS;
    }

    return (data as PipelineDeal[]) || [];
  } catch (err) {
    console.error("Error fetching deals:", err);
    return [];
  }
};

// --- PRODUCT SERVICE ---

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;

    // Auto-seed
    if (!data || data.length === 0) {
        await seedProducts();
        return MOCK_PRODUCTS;
    }

    return (data as Product[]) || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  try {
    const { error } = await supabase.from('products').insert(product);
    if (error) throw error;
  } catch (err) {
    console.error("Error creating product:", err);
    throw err;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
};

// --- SEEDING HELPERS ---

const seedContacts = async () => {
    // We remove the ID to let Supabase generate new UUIDs, ensuring no conflicts
    const contactsPayload = MOCK_CONTACTS.map(({ id, ...rest }) => rest);
    const { error } = await supabase.from('contacts').insert(contactsPayload);
    if (error) console.error("Seed contacts error:", error);
}

const seedProducts = async () => {
    const productsPayload = MOCK_PRODUCTS.map(({ id, ...rest }) => rest);
    const { error } = await supabase.from('products').insert(productsPayload);
    if (error) console.error("Seed products error:", error);
}

const seedDeals = async () => {
    const dealsPayload = MOCK_PIPELINE_DEALS.map(({ id, ...rest }) => rest);
    const { error } = await supabase.from('deals').insert(dealsPayload);
    if (error) console.error("Seed deals error:", error);
}

// Public migration function
export const resetAndSeedDatabase = async () => {
    try {
        console.log("Starting database seed...");
        
        // Note: In a real production app, we would be careful about deleting data.
        // This is a migration helper for the initial setup.
        
        // 1. Seed Contacts
        await seedContacts();
        
        // 2. Seed Products
        await seedProducts();
        
        // 3. Seed Deals
        await seedDeals();
        
        return { success: true };
    } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error };
    }
};
