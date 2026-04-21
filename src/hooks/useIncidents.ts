import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'mitigating' | 'resolved';
  affected_area: string;
  assigned_to: string | null;
  reported_by: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(async () => {
    if (!user) { setIncidents([]); setLoading(false); return; }
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setIncidents(data as unknown as Incident[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('incidents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchIncidents]);

  const createIncident = async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'resolved_at'>) => {
    const { data, error } = await supabase.from('incidents').insert(incident).select().single();
    if (error) throw error;
    return data;
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    const { error } = await supabase.from('incidents').update(updates).eq('id', id);
    if (error) throw error;
  };

  const resolveIncident = async (id: string) => {
    await updateIncident(id, { status: 'resolved', resolved_at: new Date().toISOString() } as Partial<Incident>);
  };

  return { incidents, loading, createIncident, updateIncident, resolveIncident, refresh: fetchIncidents };
}
