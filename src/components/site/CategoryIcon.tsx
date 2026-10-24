import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

export function CategoryIcon({ name, ...props }: { name?: string | null } & LucideProps) {
  const I = (name && (Icons as any)[name]) || Icons.Sparkles;
  if (name && !(Icons as any)[name] && name.length <= 4) return <span className="text-2xl leading-none">{name}</span>;
  return <I {...props} />;
}
