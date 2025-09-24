// src/components/CommentInputBar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import type { FirebaseError } from "firebase/app";

type Props = {
  trackId?: string | null; // 현재 트랙(동영상) ID
};

// --- styled ---
const Bar = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const Input = styled.input`
  flex: 1;
  height: 40px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  &:focus {
    border-color: rgba(77, 118, 252, 0.9);
  }
`;

const EmojiPicker = styled.select`
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 0 8px;
  outline: none;
`;

const SendButton = styled.button<{ disabled?: boolean }>`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  background: ${(p) => (p.disabled ? "rgba(255,255,255,0.18)" : "#4d76fc")};
  color: ${(p) => (p.disabled ? "rgba(255,255,255,0.6)" : "white")};
  border: none;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  transition: transform 0.12s ease;
  &:hover {
    transform: ${(p) => (p.disabled ? "none" : "translateY(-1px)")};
  }
`;

export default function CommentInputBar({ trackId }: Props) {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 로그인 보장(익명)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((e) =>
        console.error("Anonymous sign-in failed:", e)
      );
    }
    return () => unsub();
  }, []);

  const canSend = useMemo(
    () =>
      !!trackId &&
      text.trim().length > 0 &&
      text.trim().length <= 300 &&
      !sending,
    [trackId, text, sending]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || !trackId) return;

    try {
      setSending(true);

      // 전송 직전 로그인 보장(아주 드물게 비동기 타이밍 이슈 방지)
      if (!auth.currentUser) {
        await signInAnonymously(auth);
        await new Promise<void>((resolve) => {
          const off = onAuthStateChanged(auth, () => {
            off();
            resolve();
          });
        });
      }

      await addDoc(
        // 2025-09-17 변경: 규칙에 맞춰 tracks → posts 경로 사용
        collection(db, "posts", trackId, "comments"),
        {
          text: text.trim(),
          emoji,
          userId: user?.uid ?? auth.currentUser?.uid ?? "anon",
          userName:
            user?.displayName ||
            (user?.email ? user.email.split("@")[0] : null),
          createdAt: serverTimestamp(),
        }
      );

      setText("");
      inputRef.current?.focus();
    } catch (err) {
      const fe = err as FirebaseError;
      console.error("댓글 전송 실패:", fe.code, fe.message);
      alert(`댓글 전송 실패: ${fe.code || "권한/네트워크 확인"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Bar onSubmit={handleSubmit} role="form" aria-label="comment-input">
      <EmojiPicker
        value={emoji}
        onChange={(e) => setEmoji(e.target.value)}
        aria-label="emoji"
      >
        {["💬", "🔥", "😂", "😍", "👏", "👍", "🎧", "🎵", "😮"].map((em) => (
          <option key={em} value={em}>
            {em}
          </option>
        ))}
      </EmojiPicker>

      <Input
        ref={inputRef}
        type="text"
        placeholder={
          trackId ? "댓글을 입력하세요…" : "재생 중인 트랙이 없습니다"
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!trackId || sending}
        aria-label="comment-text"
        maxLength={300}
      />

      <SendButton type="submit" disabled={!canSend}>
        Send
      </SendButton>
    </Bar>
  );
}
