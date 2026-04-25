"use client";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  pinId: string;
  mediaUrl: string;
  mediaType: string;
  onSaved?: () => void;
};

export default function MoreSheet({ open, onClose, pinId, mediaUrl, mediaType, onSaved }: Props) {
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/pin/${pinId}` : "";

  const downloadUrl =
    mediaType === "image"
      ? mediaUrl.replace("/upload/", "/upload/fl_attachment/")
      : mediaUrl;

  async function save() {
    try {
      await fetch(`/api/pins/${pinId}/wishlist`, { method: "POST" });
      onSaved?.();
      setSavedFlash("Сохранено в вишлист");
      setTimeout(() => { setSavedFlash(null); onClose(); }, 700);
    } catch {
      setSavedFlash("Ошибка");
    }
  }

  function flash(msg: string) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1200);
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[88dvh] overflow-y-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header */}
        <div className="relative h-14 flex items-center">
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-10 h-10 grid place-items-center ml-2"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2">
              <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
            </svg>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 font-semibold">Поделиться</div>
        </div>

        {/* Share apps */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pt-1 pb-4">
          <ShareApp label="WhatsApp"
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}>
            <img src="/icons/whatsapp.svg" alt="" width={56} height={56} />
          </ShareApp>
          <ShareApp label="Telegram"
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`}>
            <img src="/icons/telegram.svg" alt="" width={56} height={56} />
          </ShareApp>
          <ShareApp label="VK"
            href={`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}`}>
            <img src="/icons/vk.svg" alt="" width={56} height={56} />
          </ShareApp>
          <ShareApp label="MAX"
            href={`https://max.ru/share?url=${encodeURIComponent(shareUrl)}`}>
            <img src="/icons/max.svg" alt="" width={56} height={56} />
          </ShareApp>
          <ShareApp label="Instagram"
            onClick={async () => {
              try { await navigator.clipboard.writeText(shareUrl); flash("Ссылка скопирована — вставьте в Instagram"); } catch {}
            }}>
            <img src="/icons/instagram.svg" alt="" width={56} height={56} />
          </ShareApp>
          <ShareApp label="Скопировать" bg="#e0e0e0" dark
            onClick={async () => {
              try { await navigator.clipboard.writeText(shareUrl); flash("Ссылка скопирована"); } catch {}
            }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <rect x="9" y="9" width="11" height="11" rx="2"/>
              <path d="M5 15V6a1 1 0 0 1 1-1h9" strokeLinecap="round"/>
            </svg>
          </ShareApp>
        </div>

        <hr className="border-line" />

        <div className="py-3 text-center font-semibold">Варианты</div>

        <ul className="px-2 pb-4">
          <Item icon={<IconPin />} label="Сохранить" onClick={save} />
          <Item icon={<IconArrow />} label="Открыть в приложении" hint="В разработке" disabled />
          <Item
            icon={<IconDownload />}
            label="Скачать изображение"
            href={downloadUrl}
            download
            onClick={() => flash("Загрузка…")}
          />
          <Item icon={<IconHeart />} label="Показывать больше похожих пинов"
            onClick={() => flash("Учтём в рекомендациях")} />
          <Item icon={<IconHeartOff />} label="Показывать меньше похожих пинов"
            onClick={() => flash("Учтём в рекомендациях")} />
          <Item icon={<IconBan />} label="Пожаловаться"
            hint="Не соответствует правилам сообщества"
            onClick={() => flash("Жалоба отправлена")} />
        </ul>

        {savedFlash && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 bg-ink text-white text-sm px-4 py-2 rounded-full z-[70]">
            {savedFlash}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareApp({
  label, bg, href, onClick, children, dark,
}: {
  label: string; bg?: string; href?: string; onClick?: () => void;
  children: React.ReactNode; dark?: boolean;
}) {
  const Wrap: any = href ? "a" : "button";
  const props: any = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { onClick, type: "button" };
  return (
    <Wrap {...props} className="flex flex-col items-center shrink-0 w-16">
      {bg ? (
        <div
          className="w-14 h-14 rounded-full grid place-items-center overflow-hidden"
          style={{ background: bg }}
        >
          {children}
        </div>
      ) : (
        <div className="w-14 h-14 rounded-2xl overflow-hidden grid place-items-center">
          {children}
        </div>
      )}
      <span className={`mt-1 text-[12px] ${dark ? "text-ink" : "text-ink"}`}>{label}</span>
    </Wrap>
  );
}

function Item({
  icon, label, hint, onClick, href, download, disabled,
}: {
  icon: React.ReactNode; label: string; hint?: string;
  onClick?: () => void; href?: string; download?: boolean; disabled?: boolean;
}) {
  const content = (
    <>
      <span className="w-8 grid place-items-center mr-3 text-ink">{icon}</span>
      <span className="flex-1 text-left">
        <span className={`block font-semibold text-[15px] ${disabled ? "text-muted" : ""}`}>{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </>
  );
  const cls = `flex items-center w-full px-3 py-3 rounded-xl ${disabled ? "" : "hover:bg-[#f3f3f3] active:bg-[#ebebeb]"}`;
  if (href && !disabled) {
    return (
      <li>
        <a href={href} download={download} onClick={onClick} className={cls}>
          {content}
        </a>
      </li>
    );
  }
  return (
    <li>
      <button type="button" onClick={disabled ? undefined : onClick} className={cls}>
        {content}
      </button>
    </li>
  );
}

/* -------- icons -------- */
function IconPin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v8l-4 4 1 1h3v7l1-1v-6h3l1-1-4-4V2z" strokeLinejoin="round"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" strokeLinejoin="round"/>
    </svg>
  );
}
function IconHeartOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" strokeLinejoin="round"/>
      <path d="M3 3l18 18" strokeLinecap="round"/>
    </svg>
  );
}
function IconBan() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/>
      <path d="M5.5 5.5l13 13" strokeLinecap="round"/>
    </svg>
  );
}
