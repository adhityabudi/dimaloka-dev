import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

export function CategoryIcon({ icon: name, ...props }: { icon?: string | null } & Omit<LucideProps, "name">) {
  const I = (name && (Icons as any)[name]) || Icons.Sparkles;
  if (name && !(Icons as any)[name] && name.length <= 4) return <span className="text-2xl leading-none">{name}</span>;
  return <I {...props} />;
}
