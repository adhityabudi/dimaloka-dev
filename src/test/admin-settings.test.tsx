import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const settings = vi.hoisted(() => ({ data: undefined as Record<string, unknown> | undefined, isPending: true, isError: false, save: vi.fn(), refetch: vi.fn() }));
vi.mock("@/components/admin/useSettings", () => ({ useSettings: () => settings }));
vi.mock("@/components/admin/fields", () => ({
  Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PageHeader: ({ action }: { action: React.ReactNode }) => <div>{action}</div>,
}));
import { Route } from "@/routes/_authenticated/admin/setting";

describe("Settings loading protection", () => {
  beforeEach(() => { settings.data = undefined; settings.isPending = true; settings.isError = false; });
  it("cannot save empty settings before the existing values load", () => {
    const Page = Route.options.component;
    if (!Page) throw new Error("Settings page missing");
    render(<Page />);
    expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });
  it("cannot save when settings failed to load", () => {
    settings.isPending = false; settings.isError = true;
    const Page = Route.options.component;
    if (!Page) throw new Error("Settings page missing");
    render(<Page />);
    expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeEnabled();
  });
});