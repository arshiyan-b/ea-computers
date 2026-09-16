import { apiFetch } from './api';

export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export function submitLead(input: CreateLeadInput) {
  return apiFetch<{ id: string }>('/leads', { method: 'POST', body: JSON.stringify(input), noStore: true });
}
