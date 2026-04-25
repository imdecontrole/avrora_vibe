import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { cloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Hard-coded mapping: human category name -> image URL
const COVERS: { name: string; url: string }[] = [
  { name: "ФУТБОЛКИ И ПОЛО", url: "https://static.tildacdn.com/tild3532-6634-4535-a435-306437633363/__.jpg" },
  { name: "ЛОНГСЛИВЫ", url: "https://static.tildacdn.com/tild6638-6135-4338-b162-376631303530/photo.jpg" },
  { name: "РУБАШКИ", url: "https://static.tildacdn.com/tild3634-3938-4563-a631-356464356565/photo.jpg" },
  { name: "ХУДИ И ТОЛСТОВКИ", url: "https://static.tildacdn.com/tild3161-3664-4834-b538-363366656639/__.jpg" },
  { name: "СВИТШОТЫ", url: "https://static.tildacdn.com/tild6632-3564-4234-a434-393439333434/photo.jpg" },
  { name: "КУРТКИ И ЖИЛЕТЫ", url: "https://static.tildacdn.com/tild6663-6537-4664-b464-353838303834/__.jpg" },
  { name: "ВЕТРОВКИ И ДОЖДЕВИКИ", url: "https://static.tildacdn.com/tild6335-3761-4366-a664-636130663538/__.jpg" },
  { name: "ТРИКОТАЖ", url: "https://static.tildacdn.com/tild3032-3965-4430-b861-323832663733/photo.jpg" },
  { name: "ТРЭВЕЛ И ОТДЫХ", url: "https://static.tildacdn.com/tild6430-6534-4631-b431-303038613130/__.jpg" },
  { name: "АКСЕССУАРЫ", url: "https://static.tildacdn.com/tild6636-6135-4135-b061-666361356638/photo.jpg" },
  { name: "ДЖОГГЕРЫ И ШОРТЫ", url: "https://static.tildacdn.com/tild6139-6165-4439-a434-316665376563/__.jpg" },
];

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const allCats = await prisma.category.findMany();
  const catBySlug = new Map(allCats.map((c) => [c.slug, c]));

  const applied: { slug: string; name: string; status: string }[] = [];

  for (const entry of COVERS) {
    const slug = slugify(entry.name);
    const cat = catBySlug.get(slug);
    if (!cat) {
      applied.push({ slug, name: entry.name, status: "no-such-category" });
      continue;
    }
    try {
      const up = await cloudinary.uploader.upload(entry.url, {
        folder: "avrora/categories",
        resource_type: "image",
      });
      await prisma.category.update({
        where: { id: cat.id },
        data: { coverUrl: up.secure_url, coverType: "image" },
      });
      applied.push({ slug, name: entry.name, status: "ok" });
    } catch (e) {
      applied.push({ slug, name: entry.name, status: `err: ${String(e).slice(0, 80)}` });
    }
  }

  return NextResponse.json({ ok: true, applied });
}
