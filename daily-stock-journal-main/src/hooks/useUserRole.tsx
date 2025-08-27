import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // fallback to user role
        } else {
          setRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole('user');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      mounted = false;
    };
  }, [user]);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return {
    role,
    loading,
    isAdmin,
    isUser,
  };
}