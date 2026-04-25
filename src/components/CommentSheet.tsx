"use client";
import { useEffect, useRef, useState } from "react";

export type CommentItem = { id: string; body: string; createdAt: string | Date };

export default function CommentSheet({
  open, onClose, pinId, initial, onCountChange,
}: {
  open: boolean;
  onClose: () => void;
  pinId: string;
  initial: CommentItem[];
  onCountChange?: (n: number) => void;
}) {
  const [items, setItems] = useState<CommentItem[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Lock body scroll when the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

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
      setItems((a) => {
        const next = [comment, ...a];
        onCountChange?.(next.length);
        return next;
      });
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Комментарии"
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl
                   transition-transform duration-300 ease-out
                   ${open ? "translate-y-0" : "translate-y-full"}
                   flex flex-col max-h-[85dvh]`}
      >
        {/* Grabber */}
        <div className="pt-2 pb-1 grid place-items-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#d9d9d9]" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 shrink-0">
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 grid place-items-center -ml-1.5 rounded-full hover:bg-[#f1f1f1]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="font-semibold text-[15px]">Ваше мнение?</div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 border-t border-line">
          {items.length === 0 ? (
            <div className="h-full min-h-[40vh] grid place-items-center px-6 text-center">
              <p className="text-[15px] text-muted">
                Напишите комментарий, поделитесь отзывом или поставьте отметку «Нравится»,
                чтобы начать общение
              </p>
            </div>
          ) : (
            <ul className="py-4 space-y-4">
              {items.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-ink text-white grid place-items-center text-xs font-semibold shrink-0">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted">Гость · {fmt(c.createdAt)}</div>
                    <div className="text-[15px] whitespace-pre-wrap break-words">{c.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={submit}
          className="shrink-0 p-3 border-t border-line pb-[max(env(safe-area-inset-bottom),12px)] bg-white"
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#f1f1f1]">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Добавить комментарий"
              maxLength={1000}
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted"
            />
            {text.trim() && (
              <button
                disabled={busy}
                aria-label="Отправить"
                className="text-sm font-semibold text-[#e60023] disabled:opacity-40"
              >
                {busy ? "…" : "Отправить"}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

function fmt(d: string | Date) {
  const date = new Date(d);
  return date.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
