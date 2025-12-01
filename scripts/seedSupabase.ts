import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { MOCK_AGENTS, MOCK_CALL_LOGS, MOCK_CONTACTS, MOCK_PIPELINE_DEALS, MOCK_PRODUCTS } from '../constants';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const deterministicUuid = (seed: string) => {
  const hash = crypto.createHash('sha1').update(seed).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
};

const upsertAgents = async () => {
  const payload = MOCK_AGENTS.map(agent => ({
    id: deterministicUuid(agent.id),
    ...agent,
  }));

  const { data, error } = await supabase.from('agents').upsert(payload, { onConflict: 'name' }).select('id, name');
  if (error) throw error;
  return data || [];
};

const upsertContacts = async (agentLookup: Map<string, string>) => {
  const payload = MOCK_CONTACTS.map(({ id: _legacyId, assignedAgent, salesman, ...rest }) => ({
    ...rest,
    assignedAgent: assignedAgent || salesman,
    assigned_agent_id: agentLookup.get(assignedAgent || salesman) || null,
    contactPersons: rest.contactPersons || [],
    interactions: rest.interactions || [],
    comments: rest.comments || [],
    salesHistory: rest.salesHistory || [],
    topProducts: rest.topProducts || [],
    salesByYear: rest.salesByYear || {},
  }));

  const { error } = await supabase.from('contacts').upsert(payload, { onConflict: 'company' });
  if (error) throw error;
};

const upsertProducts = async () => {
  const payload = MOCK_PRODUCTS.map(({ id: _legacyId, ...rest }) => rest);
  const { error } = await supabase.from('products').upsert(payload, { onConflict: 'part_no' });
  if (error) throw error;
};

const upsertDeals = async () => {
  const payload = MOCK_PIPELINE_DEALS.map(({ id: _legacyId, ...rest }) => rest);
  const { error } = await supabase.from('deals').upsert(payload, { onConflict: 'title' });
  if (error) throw error;
};

const upsertCallLogs = async (agentLookup: Map<string, string>) => {
  const payload = MOCK_CALL_LOGS.map(({ id, agentName, ...rest }) => ({
    id: deterministicUuid(id),
    agentName,
    agent_id: agentLookup.get(agentName) || null,
    ...rest,
  }));

  const { error } = await supabase.from('call_logs').upsert(payload, { onConflict: 'agentName,contactName,time,type' });
  if (error) throw error;
};

const main = async () => {
  console.log('Seeding Supabase with legacy mock data...');

  const agents = await upsertAgents();
  const agentLookup = new Map(agents.map(a => [a.name, a.id]));

  await upsertContacts(agentLookup);
  await upsertProducts();
  await upsertDeals();
  await upsertCallLogs(agentLookup);

  console.log('Seeding completed successfully.');
};

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
