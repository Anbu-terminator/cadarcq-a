import { useQuery } from "@tanstack/react-query";

import { ApiError, api, type AdminUser } from "@/lib/api";

/** Current logged-in admin (null when logged out). Only called from admin pages. */
export function useMe() {
  return useQuery<AdminUser | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await api.me()).user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
}
