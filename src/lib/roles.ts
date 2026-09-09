import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** Roles of the signed-in user, read through RLS ("read own roles"). */
export function useRoles() {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role");
      if (error) throw error;
      return data.map((r) => r.role as string);
    },
  });
  return {
    roles: q.data ?? [],
    isAdmin: (q.data ?? []).includes("admin"),
    isPro: (q.data ?? []).includes("pro"),
    loading: q.isLoading,
  };
}
