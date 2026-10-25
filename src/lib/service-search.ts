export function filterServices<T extends { title: string; short_description?: string | null; categories?: { name: string } | null; tags?: string[] }>(services: T[], query: string): T[] {
  const words = query.trim().toLocaleLowerCase("id-ID").split(/\s+/).filter(Boolean);
  return services.filter(service => {
    const text = [service.title, service.short_description, service.categories?.name, ...(service.tags ?? [])].join(" ").toLocaleLowerCase("id-ID");
    return words.every(word => text.includes(word));
  });
}