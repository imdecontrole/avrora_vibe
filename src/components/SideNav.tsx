"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: HomeIcon, label: "Главная" },
  { href: "/feed", icon: SearchIcon, label: "Лента" },
  { href: "/profile", icon: UserIcon, label: "Профиль" },
];

export default function SideNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <nav className="hidden md:flex fixed inset-y-0 left-0 z-40 w-20 flex-col items-center bg-white border-r border-line py-4">
      <Link href="/" aria-label="Avrora" className="mb-6">
        <Image src="/icon-512.png" alt="Avrora" width={36} height={36} className="rounded-xl" />
      </Link>
      <ul className="flex flex-col items-center gap-2">
        {items.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                title={label}
                className={`w-12 h-12 grid place-items-center rounded-2xl ${
                  active ? "bg-[#f1f1f1] text-ink" : "text-muted hover:bg-[#f7f7f7]"
                }`}
              >
                <Icon active={!!active} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor" style={{ opacity: active ? 1 : 0.85 }}>
      <path d="M490.134,185.472L338.966,34.304c-45.855-45.737-120.076-45.737-165.931,0L21.867,185.472C7.819,199.445-0.055,218.457,0,238.272v221.397C0.047,488.568,23.475,511.976,52.374,512h407.253c28.899-0.023,52.326-23.432,52.373-52.331V238.272C512.056,218.457,504.182,199.445,490.134,185.472z M448,448H341.334v-67.883c0-44.984-36.467-81.451-81.451-81.451h-7.765c-44.984,0-81.451,36.467-81.451,81.451V448H64V238.272c0.007-2.829,1.125-5.541,3.115-7.552L218.283,79.552c20.825-20.831,54.594-20.835,75.425-0.01c0.003,0.003,0.007,0.007,0.01,0.01L444.886,230.72c1.989,2.011,3.108,4.723,3.115,7.552V448z" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: active ? 1 : 0.85 }}>
      <path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: active ? 1 : 0.85 }}>
      <path d="M21,24H18V19a2,2,0,0,0-2-2H8a2,2,0,0,0-2,2v5H3V19a5.006,5.006,0,0,1,5-5h8a5.006,5.006,0,0,1,5,5Z" />
      <path d="M12,12a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,12Zm0-9a3,3,0,1,0,3,3A3,3,0,0,0,12,3Z" />
    </svg>
  );
}
