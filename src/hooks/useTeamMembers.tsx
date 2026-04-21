import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TeamMember {
  id: string; // user_id
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  joinedAt: string;
}

interface TeamMembersContextValue {
  members: TeamMember[];
  loading: boolean;
  getUserById: (id: string) => TeamMember | undefined;
  refresh: () => Promise<void>;
}

const TeamMembersContext = createContext<TeamMembersContextValue>({
  members: [],
  loading: true,
  getUserById: () => undefined,
  refresh: async () => {},
});

export function TeamMembersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!user) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, avatar_url, created_at');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');

    if (profiles) {
      const mapped: TeamMember[] = profiles.map(p => {
        const userRole = roles?.find(r => r.user_id === p.user_id);
        const initials = (p.full_name || 'U')
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        return {
          id: p.user_id,
          name: p.full_name || 'Unnamed User',
          email: '',
          avatar: initials,
          role: (userRole?.role as TeamMember['role']) || 'member',
          joinedAt: p.created_at,
        };
      });
      setMembers(mapped);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const getUserById = useCallback(
    (id: string) => members.find(m => m.id === id),
    [members]
  );

  return (
    <TeamMembersContext.Provider value={{ members, loading, getUserById, refresh: fetchMembers }}>
      {children}
    </TeamMembersContext.Provider>
  );
}

export function useTeamMembers() {
  return useContext(TeamMembersContext);
}
