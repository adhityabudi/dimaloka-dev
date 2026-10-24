import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useSettings() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["adm-settings"],
    queryFn: async () => Object.fromEntries(((await supabase.from("site_settings").select("key,value")).data ?? []).map((r) => [r.key, r.value])) as Record<string, any>,
  });
  const save = async (values: Record<string, any>) => {
    const rows = Object.entries(values).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) return toast.error(error.message);
    toast.success("Setting disimpan");
    qc.invalidateQueries({ queryKey: ["adm-settings"] });
  };
  return { ...q, save };
}
