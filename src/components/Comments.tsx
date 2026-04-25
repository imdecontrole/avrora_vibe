"use client";
import { useState } from "react";

type Comment = { id: string; body: string; createdAt: string | Date };

export default function Comments({
  pinId, initial,
}: {
  pinId: string;
  initial: Comment[];
}) {
  const [items, setItems] = useState<Comment[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/pins/${pinId}/comment`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) return;
      const { comment } = await res.json();
      setItems((a) => [comment, ...a]);
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <h3 className="font-semibold mb-2 text-sm">Комментарии · {items.length}</h3>
      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Оставь комментарий…"
          maxLength={1000}
          className="flex-1 px-4 py-2.5 rounded-full bg-[#f1f1f1] outline-none text-sm"
        />
        <button
          disabled={busy || !text.trim()}
          className="px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold disabled:opacity-40"
        >
          Отправить
        </button>
      </form>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center text-xs font-semibold shrink-0">
              A
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted">Гость · {fmt(c.createdAt)}</div>
              <div className="text-sm whitespace-pre-wrap">{c.body}</div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-muted">Пока нет комментариев — будь первым.</li>
        )}
      </ul>
    </section>
  );
}

function fmt(d: string | Date) {
  const date = new Date(d);
  return date.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
