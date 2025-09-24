import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

type Props = { trackId?: string | null };

type CommentDoc = {
  id: string;
  text: string;
  emoji?: string;
  userId?: string;
  userName?: string;
  userPhoto?: string | null;
  createdAt?: Timestamp;
};

type UserInfo = {
  uid: string;
  displayName?: string;
  email?: string;
};

// ===== styled =====
const Wrap = styled.div`
  width: 100%;
  height: 120px; /* 2개 댓글에 맞는 높이 */
  margin-top: 10px;
  margin-bottom: 8px; /* 하단 탭과 시각적 간격 */
  overflow: hidden; /* 넘치는 댓글 숨김 */
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column; /* 위→아래 */
  gap: 8px;
`;

const Bubble = styled.li`
  flex: 0 0 auto;
  max-width: 100%;
  min-height: 52px; /* 한 줄 높이 맞춤 */
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 13px;
  line-height: 1.2;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 8px;
`;

/* 남겨두지만 사용하지는 않음(디자인은 유지하되 출력은 이모지만) */
const Avatar = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.25);
`;

const Emoji = styled.span`
  font-size: 16px;
  line-height: 1;
  display: inline-block;
  margin-top: 1px;
`;

const Text = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  grid-column: 1 / -1;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
`;

const TimeLink = styled.span`
  color: #4d76fc;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: #6b8cff;
  }
`;

function shortUid(uid: string) {
  return `user-${uid.slice(0, 6)}`;
}

// 시간 패턴 감지 및 파싱 함수
function parseTimeToSeconds(timeStr: string): number | null {
  // 시:분:초 형식 (예: 1:30:45)
  const fullTimeRegex = /^(\d{1,2}):(\d{2}):(\d{2})$/;
  const fullMatch = timeStr.match(fullTimeRegex);

  if (fullMatch) {
    const hours = parseInt(fullMatch[1], 10);
    const minutes = parseInt(fullMatch[2], 10);
    const seconds = parseInt(fullMatch[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // 분:초 형식 (예: 2:05, 1:30) - 첫 번째 숫자가 59 이하일 때만 분:초로 처리
  const minSecRegex = /^(\d{1,2}):(\d{2})$/;
  const minSecMatch = timeStr.match(minSecRegex);

  if (minSecMatch) {
    const firstNum = parseInt(minSecMatch[1], 10);
    const secondNum = parseInt(minSecMatch[2], 10);

    // 첫 번째 숫자가 59 이하면 분:초, 60 이상이면 시:분
    if (firstNum <= 59 && secondNum <= 59) {
      return firstNum * 60 + secondNum;
    } else {
      // 60 이상이면 시:분으로 처리
      return firstNum * 3600 + secondNum * 60;
    }
  }

  return null;
}

// 텍스트에서 시간 패턴을 찾아서 파란색 링크로 변환
function renderTextWithTimeLinks(
  text: string,
  onTimeClick: (seconds: number) => void
): React.ReactNode {
  // 시간 패턴: 분:초 또는 시:분:초 형식
  const timeRegex = /(\b\d{1,2}:\d{2}(?::\d{2})?\b)/g;

  const parts = text.split(timeRegex);

  return parts.map((part, index) => {
    if (timeRegex.test(part)) {
      const seconds = parseTimeToSeconds(part);
      if (seconds !== null) {
        return (
          <TimeLink key={index} onClick={() => onTimeClick(seconds)}>
            {part}
          </TimeLink>
        );
      }
    }
    return part;
  });
}

export default function LiveComments({ trackId }: Props) {
  const [items, setItems] = useState<CommentDoc[]>([]);
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const listRef = useRef<HTMLUListElement>(null);

  // 시간 클릭 핸들러
  const handleTimeClick = (seconds: number) => {
    // 전역 이벤트 발생 (music.tsx에서 구독)
    window.dispatchEvent(
      new CustomEvent("seekToTime", { detail: { seconds } })
    );
  };

  // 사용자 정보 구독
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsers((prev) => ({
          ...prev,
          [user.uid]: {
            uid: user.uid,
            displayName: user.displayName || undefined,
            email: user.email || undefined,
          },
        }));
      }
    });
    return () => unsub();
  }, []);

  // 최신이 위에 보이도록 desc 정렬
  useEffect(() => {
    if (!trackId) {
      setItems([]);
      return;
    }
    const q = query(
      collection(db, "posts", trackId, "comments"),
      orderBy("createdAt", "desc"), // ✅ 최신 → 오래된 (위→아래)
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const next: CommentDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setItems(next);
    });
    return () => unsub();
  }, [trackId]);

  // 새 댓글 와도 스크롤을 '위'(최신)로 유지
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [items.length]);

  const formatted = useMemo(
    () =>
      items.map((it) => {
        const ts = it.createdAt?.toDate?.() as Date | undefined;
        const time = ts
          ? new Intl.DateTimeFormat("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(ts)
          : "방금";

        // 사용자 정보 가져오기
        const user = it.userId ? users[it.userId] : null;
        const displayName =
          it.userName ||
          user?.displayName ||
          (user?.email ? user.email.split("@")[0] : null) ||
          (it.userId ? shortUid(it.userId) : "익명");

        return { ...it, time, displayName };
      }),
    [items, users]
  );

  if (!trackId) return null;

  return (
    <Wrap>
      <List ref={listRef} aria-label="live-comments">
        {formatted.map((c) => (
          <Bubble key={c.id} title={c.text}>
            {/* 🔵 항상 이모지만 출력 (아바타 숨김) */}
            <Emoji>{c.emoji ?? "💬"}</Emoji>
            <Text>{renderTextWithTimeLinks(c.text, handleTimeClick)}</Text>
            <Meta>
              {c.time} · {c.displayName}
            </Meta>
          </Bubble>
        ))}
      </List>
    </Wrap>
  );
}
