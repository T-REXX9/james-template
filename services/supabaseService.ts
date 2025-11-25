
import { supabase } from '../lib/supabaseClient';
import { Contact, PipelineDeal, Product } from '../types';

// With our local mock DB, we can just query directly.
// The Mock DB handles the seeding from constants, so we trust it returns data.

export const fetchContacts = async (): Promise<Contact[]> => {
  try {
    const { data, error } = await supabase.from('contacts').select('*');
    if (error) throw error;
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
        // Mock query builder update isn't sophisticated for "IN" clauses in this demo
        // so we loop. In real Supabase: .in('id', ids).update(updates)
        for (const id of ids) {
            await updateContact(id, updates);
        }
    } catch (err) {
        console.error("Error bulk updating contacts:", err);
        throw err;
    }
}

export const fetchDeals = async (): Promise<PipelineDeal[]> => {
  try {
    const { data, error } = await supabase.from('deals').select('*');
    if (error) throw error;
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
