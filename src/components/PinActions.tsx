"use client";
import { useState } from "react";
import MoreSheet from "./MoreSheet";
import CommentSheet, { type CommentItem } from "./CommentSheet";

type Props = {
  pinId: string;
  mediaUrl: string;
  mediaType: string;
  initialLiked: boolean;
  initialSaved: boolean;
  likeCount: number;
  commentCount: number;
  initialComments: CommentItem[];
  shareUrl: string;
};

export default function PinActions({
  pinId, mediaUrl, mediaType, initialLiked, initialSaved, likeCount,
  commentCount, initialComments, shareUrl,
}: Props) {
  const [sheet, setSheet] = useState(false);
  const [comments, setComments] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(likeCount);
  const [commentsCount, setCommentsCount] = useState(commentCount);
  const [copied, setCopied] = useState(false);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      await fetch(`/api/pins/${pinId}/like`, { method: "POST" });
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  }

  async function toggleSave() {
    const next = !saved;
    setSaved(next);
    try {
      await fetch(`/api/pins/${pinId}/wishlist`, { method: "POST" });
    } catch {
      setSaved(!next);
    }
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl });
        return;
      }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="flex items-center justify-between mt-2 gap-2">
      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleLike}
          aria-label="Нравится"
          className="flex items-center gap-1 h-11 px-1.5 rounded-full hover:bg-[#f1f1f1]"
        >
          <img
            src={liked ? "/icons/heart-active.svg" : "/icons/heart-default.svg"}
            alt=""
            width={28}
            height={28}
          />
          <span className="text-[15px] font-medium">{likes}</span>
        </button>

        <button
          onClick={() => setComments(true)}
          aria-label="Комментарии"
          className="flex items-center gap-1 h-11 px-1.5 rounded-full hover:bg-[#f1f1f1]"
        >
          <img src="/icons/comment.svg" alt="" width={28} height={28} />
          <span className="text-[15px] font-medium">{commentsCount}</span>
        </button>

        <button
          onClick={share}
          aria-label="Поделиться"
          className="w-11 h-11 grid place-items-center rounded-full hover:bg-[#f1f1f1] relative"
        >
          <img src="/icons/share.svg" alt="" width={28} height={28} />
          {copied && (
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] bg-ink text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              Ссылка скопирована
            </span>
          )}
        </button>

        <button
          aria-label="Ещё"
          onClick={() => setSheet(true)}
          className="w-11 h-11 grid place-items-center rounded-full hover:bg-[#f1f1f1]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#111">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      </div>

      <MoreSheet
        open={sheet}
        onClose={() => setSheet(false)}
        pinId={pinId}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        onSaved={() => setSaved(true)}
      />

      <CommentSheet
        open={comments}
        onClose={() => setComments(false)}
        pinId={pinId}
        initial={initialComments}
        onCountChange={setCommentsCount}
      />

      <button
        onClick={toggleSave}
        className={`px-5 h-11 rounded-xl text-[15px] font-semibold ${
          saved ? "bg-ink text-white" : "bg-[#e60023] text-white hover:bg-[#ad081b]"
        }`}
      >
        {saved ? "Сохранено" : "Сохранить"}
      </button>
    </div>
  );
}
