import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { lostAPI, foundAPI, matchAPI, claimAPI, notifAPI, adminAPI } from "@/lib/api";

/* ── Stats ── */
export function useStats() {
  return useQuery({
    queryKey:  ["stats"],
    queryFn:   () => api.get("/stats").then(r => r.data),
    staleTime: 20_000,
  });
}

/* ── Lost Items ── */
export function useLostItems(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["items", "lost", params],
    queryFn:  () => lostAPI.list(params).then(r => {
      // Handle both old (array) and new (paginated) response
      const d = r.data;
      return Array.isArray(d) ? d : (d.items ?? []);
    }),
  });
}

export function useLostItem(id: number) {
  return useQuery({
    queryKey: ["items", "lost", id],
    queryFn:  () => lostAPI.get(id).then(r => r.data),
    enabled: !!id,
  });
}

/* ── Found Items ── */
export function useFoundItems(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["items", "found", params],
    queryFn:  () => foundAPI.list(params).then(r => {
      const d = r.data;
      return Array.isArray(d) ? d : (d.items ?? []);
    }),
  });
}

/* ── All Items (combined, server-side search) ── */
export function useAllItems(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["items", "all", params],
    queryFn: async () => {
      const [lostRes, foundRes] = await Promise.all([
        lostAPI.list(params),
        foundAPI.list(params),
      ]);
      const lostData  = lostRes.data;
      const foundData = foundRes.data;
      const lost  = Array.isArray(lostData)  ? lostData  : (lostData.items  ?? []);
      const found = Array.isArray(foundData) ? foundData : (foundData.items ?? []);

      const tagged = [
        ...lost.map( (i: any) => ({ ...i, _type: "lost"  as const })),
        ...found.map((i: any) => ({ ...i, _type: "found" as const })),
      ];
      tagged.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return tagged;
    },
  });
}

/* ── Create Lost Item ── */
export function useCreateLostItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | object) => lostAPI.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

/* ── Create Found Item ── */
export function useCreateFoundItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | object) => foundAPI.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

/* ── Update Item ── */
export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, data }: { type: "lost" | "found"; id: number; data: object }) =>
      type === "lost"
        ? lostAPI.update(id, data).then(r => r.data)
        : foundAPI.update(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

/* ── Delete Item ── */
export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "lost" | "found"; id: number }) =>
      type === "lost"
        ? lostAPI.delete(id).then(r => r.data)
        : foundAPI.delete(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

/* ── Matches ── */
export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn:  () => matchAPI.list().then(r => r.data),
  });
}

export function useConfirmMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => matchAPI.confirm(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRejectMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => matchAPI.reject(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

/* ── Claims ── */
export function useClaims() {
  return useQuery({
    queryKey: ["claims"],
    queryFn:  () => claimAPI.list().then(r => r.data),
  });
}

export function useSubmitClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ match_id, message }: { match_id: number; message: string }) =>
      claimAPI.submit(match_id, message).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claims"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      claimAPI.update(id, status).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["claims"] });
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

/* ── Notifications ── */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn:  () => notifAPI.list().then(r => r.data),
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn:  () => notifAPI.unreadCount().then(r => r.data.count as number),
    refetchInterval: 15_000,
  });
}

export function useMarkNotifRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notifAPI.markRead(id).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      // Also invalidate unread count badge
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notifAPI.markAllRead().then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });
}

/* ── Activity Logs (works for both admin + regular users) ── */
export function useActivityLogs() {
  return useQuery({
    queryKey: ["activity"],
    queryFn:  () => adminAPI.activity().then(r => r.data),
  });
}

/* ── Admin ── */
export function useAdminStats() {
  return useQuery({
    queryKey: ["stats", "admin"],
    queryFn:  () => adminAPI.stats().then(r => r.data),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn:  () => adminAPI.users().then(r => r.data),
  });
}
