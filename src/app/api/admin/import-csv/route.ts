import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { cloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Row = Record<string, string>;

function pickMainCategory(raw: string): string | null {
  if (!raw) return null;
  // CSV field may contain multiple categories separated by ';', and portfolio
  // folders marked with 'ТОВАРЫ В ПОРТФОЛИО>>>'. We want the first "real" category.
  const parts = raw.split(";").map((s) => s.trim()).filter(Boolean);
  const clean = parts.find((p) => !p.toUpperCase().includes("ПОРТФОЛИО"));
  return clean ?? null;
}

function firstImageUrl(raw: string): string | null {
  if (!raw) return null;
  const parts = raw.split(/\s+/).filter((s) => /^https?:\/\//i.test(s));
  return parts[0] ?? null;
}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

async function uploadImageFromUrl(url: string): Promise<{ secure_url: string; public_id: string; width?: number; height?: number } | null> {
  try {
    const res = await cloudinary.uploader.upload(url, {
      folder: "avrora",
      resource_type: "image",
      // overwrite duplicates based on public_id derivation
    });
    return {
      secure_url: res.secure_url,
      public_id: res.public_id,
      width: res.width,
      height: res.height,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no file" }, { status: 400 });

  const text = await file.text();
  let rows: Row[];
  try {
    rows = parse(text, {
      columns: true,
      delimiter: ";",
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
    }) as Row[];
  } catch (e) {
    return NextResponse.json({ error: "csv parse failed", detail: String(e) }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const categoriesTouched = new Set<string>();
  const errors: string[] = [];

  for (const row of rows) {
    const sku = (row["SKU"] ?? "").trim();
    const title = (row["Title"] ?? "").trim();
    const priceStr = (row["Price"] ?? "").trim();
    const productUrl = (row["Url"] ?? "").trim() || null;
    const rawText = row["Text"] ?? "";
    const rawCategory = row["Category"] ?? "";
    const rawPhotos = row["Photo"] ?? "";
    const externalId = (row["Tilda UID"] ?? "").trim() || null;

    if (!title) { skipped++; continue; }

    const imgUrl = firstImageUrl(rawPhotos);
    if (!imgUrl) { skipped++; continue; }

    // Category upsert
    const mainCat = pickMainCategory(rawCategory);
    let categoryId: string | null = null;
    if (mainCat) {
      const slug = slugify(mainCat);
      const cat = await prisma.category.upsert({
        where: { slug },
        create: { title: mainCat, slug },
        update: { title: mainCat },
      });
      categoryId = cat.id;
      categoriesTouched.add(slug);
    }

    // Idempotency key: sku preferred, then externalId
    const existing = sku
      ? await prisma.pin.findUnique({ where: { sku } })
      : externalId
        ? await prisma.pin.findUnique({ where: { externalId } })
        : null;

    // Upload image only for new pins (avoid re-downloading if we already have it)
    let media: { secure_url: string; public_id: string; width?: number; height?: number } | null = null;
    if (!existing) {
      media = await uploadImageFromUrl(imgUrl);
      if (!media) {
        errors.push(`${sku || title}: upload failed`);
        skipped++;
        continue;
      }
    }

    const price = priceStr ? Math.round(parseFloat(priceStr)) : null;
    const description = stripHtml(rawText).slice(0, 1500) || null;

    try {
      if (existing) {
        await prisma.pin.update({
          where: { id: existing.id },
          data: {
            title,
            productName: title,
            productUrl,
            price,
            description,
            sku: sku || existing.sku,
            externalId: externalId || existing.externalId,
            categoryId,
          },
        });
        updated++;
      } else {
        await prisma.pin.create({
          data: {
            title,
            productName: title,
            productUrl,
            price,
            description,
            sku: sku || null,
            externalId,
            categoryId,
            mediaType: "image",
            mediaUrl: media!.secure_url,
            mediaPublicId: media!.public_id,
            width: media!.width ?? null,
            height: media!.height ?? null,
          },
        });
        created++;
      }
    } catch (e) {
      errors.push(`${sku || title}: ${String(e).slice(0, 120)}`);
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    created,
    updated,
    skipped,
    categories: categoriesTouched.size,
    errors: errors.slice(0, 30),
  });
}
