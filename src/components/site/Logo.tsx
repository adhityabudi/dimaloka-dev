import logo from "@/assets/dimaloka-logo.png.asset.json";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link to="/" aria-label="Dimaloka beranda" className="inline-flex items-center">
      <img src={logo.url} alt="Dimaloka" className={`${className} w-auto`} width={640} height={119} />
    </Link>
  );
}
