import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { readSessionId } from "@/lib/session";
import MasonryGrid from "@/components/MasonryGrid";
import type { PinCardData } from "@/components/PinCard";

export const dynamic = "force-dynamic";

type Tab = "saved" | "liked" | "viewed";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: Tab }>;
}) {
  const sp = await searchParams;
  const tab: Tab = sp.tab ?? "saved";
  const sessionId = await readSessionId();

  let pins: PinCardData[] = [];
  if (sessionId) {
    if (tab === "saved") {
      const rows = await prisma.wishlist.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        include: { pin: true },
        take: 200,
      });
      pins = rows.map((r) => ({ ...r.pin, wishlisted: true }));
    } else if (tab === "liked") {
      const rows = await prisma.like.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        include: { pin: true },
        take: 200,
      });
      pins = rows.map((r) => ({ ...r.pin, liked: true }));
    } else {
      const rows = await prisma.view.findMany({
        where: { sessionId },
        orderBy: { viewedAt: "desc" },
        distinct: ["pinId"],
        include: { pin: true },
        take: 200,
      });
      pins = rows.map((r) => ({ ...r.pin }));
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-ink text-white grid place-items-center font-bold text-xl">
            A
          </div>
          <div>
            <div className="text-lg font-semibold">Гость</div>
            <div className="text-sm text-muted">Твои сохранения и лайки</div>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 bg-white px-4 py-3">
        <div className="flex gap-2 text-sm">
          <TabLink tab="saved" active={tab}>Вишлист</TabLink>
          <TabLink tab="viewed" active={tab}>Просмотренное</TabLink>
          <TabLink tab="liked" active={tab}>Нравится</TabLink>
        </div>
      </nav>

      <div className="pt-3">
        <MasonryGrid pins={pins} />
      </div>
    </div>
  );
}

function TabLink({ tab, active, children }: { tab: Tab; active: Tab; children: React.ReactNode }) {
  const on = tab === active;
  return (
    <Link
      href={`/profile?tab=${tab}`}
      className={`px-4 py-2 rounded-full font-medium ${
        on ? "bg-ink text-white" : "bg-[#f1f1f1] text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
