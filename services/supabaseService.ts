import { supabase } from '../lib/supabaseClient';
import { Agent, CallLog, Contact, PipelineDeal, Product } from '../types';

// --- CONTACTS SERVICE ---

export const fetchContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase.from('contacts').select('*');
  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return (data as Contact[]) || [];
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<void> => {
  const { error } = await supabase.from('contacts').insert(contact);
  if (error) throw error;
};

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<void> => {
  const { error } = await supabase.from('contacts').update(updates).eq('id', id);
  if (error) throw error;
};

export const bulkUpdateContacts = async (ids: string[], updates: Partial<Contact>): Promise<void> => {
  const { error } = await supabase.from('contacts').update(updates).in('id', ids);
  if (error) throw error;
};

// --- DEALS SERVICE ---

export const fetchDeals = async (): Promise<PipelineDeal[]> => {
  const { data, error } = await supabase.from('deals').select('*');
  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
  return (data as PipelineDeal[]) || [];
};

// --- PRODUCT SERVICE ---

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return (data as Product[]) || [];
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<void> => {
  const { error } = await supabase.from('products').insert(product);
  if (error) throw error;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// --- AGENT SERVICE ---

export const fetchAgents = async (): Promise<Agent[]> => {
  const { data, error } = await supabase.from('agents').select('*');
  if (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
  return (data as Agent[]) || [];
};

// --- CALL LOG SERVICE ---

export const fetchCallLogs = async (): Promise<CallLog[]> => {
  const { data, error } = await supabase.from('call_logs').select('*');
  if (error) {
    console.error('Error fetching call logs:', error);
    return [];
  }
  return (data as CallLog[]) || [];
};
