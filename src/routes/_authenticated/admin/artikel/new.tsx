import { createFileRoute } from "@tanstack/react-router";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const Route = createFileRoute("/_authenticated/admin/artikel/new")({ component: () => <ArticleForm /> });
