// src/screens/following.tsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Post from "../components/Post";

/**
 * 팔로우한 사용자들의 게시글만 모아서 보여주는 전용 피드
 * - user_relations/{me}.following 배열을 실시간 구독
 * - Firestore where("userId","in",[]) 10개 제한 → 10명 단위로 쿼리 분할
 * - 여러 쿼리 결과를 Map으로 머지한 뒤 createdAt 내림차순 정렬
 * - Post 컴포넌트가 요구하는 필수 props(nickname, post, createdAt)를 안전하게 보장(fallback)
 */

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin-left: 5px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 16px;
  gap: 12px;
`;

const EmptyBox = styled.div`
  text-align: center;
  color: #8e8e93;
  padding: 40px 0;
  font-weight: 600;
`;

const Loading = styled.div`
  text-align: center;
  padding: 24px 0;
  color: #666;
`;

type PostDoc = {
  id: string;
  userId: string;
  nickname?: string;
  post?: string;
  createdAt?: number | { toMillis?: () => number }; // Timestamp 대비
  photoUrl?: string;
  photoUrls?: string[];
  comments?: any[];
  playlist?: any;
  playlistFileUrl?: string;
};

// Firestore 'in' 쿼리 10개 제한 분할
const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

// createdAt 정규화(숫자 또는 Timestamp)
const toMillis = (v: PostDoc["createdAt"]) => {
  if (typeof v === "number") return v;
  if (v && typeof v.toMillis === "function") return v.toMillis() ?? 0;
  return 0;
};

// Post가 요구하는 필수 필드를 안전하게 보장하는 정규화
const toSafePost = (p: PostDoc) => ({
  ...p,
  nickname: p.nickname ?? "익명",
  post: p.post ?? "",
  createdAt: toMillis(p.createdAt),
  photoUrl: p.photoUrl ?? "",
  photoUrls: Array.isArray(p.photoUrls) ? p.photoUrls : [],
  comments: Array.isArray(p.comments) ? p.comments : [],
  playlist: p.playlist ?? null,
});

export default function FollowingFeed() {
  // 1) 내 팔로잉 목록 실시간 구독
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  useEffect(() => {
    const me = auth.currentUser?.uid;
    if (!me) {
      setFollowingList([]);
      setLoadingRelations(false);
      return;
    }

    const ref = doc(db, "user_relations", me);
    const stop = onSnapshot(
      ref,
      (snap) => {
        const data = (snap.data() ?? {}) as { following?: string[] };
        const arr = Array.isArray(data.following) ? data.following : [];
        setFollowingList(arr);
        setLoadingRelations(false);
      },
      () => {
        setFollowingList([]);
        setLoadingRelations(false);
      }
    );

    return () => stop();
  }, []);

  // 2) 팔로잉이 바뀔 때 해당 유저들의 posts만 구독(10명씩 분할)
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    // 팔로우가 하나도 없으면 초기화
    if (loadingRelations) return; // 관계 로딩 중이면 대기
    if (!followingList || followingList.length === 0) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    const chunks = chunk(followingList, 10);
    const unsubs: Array<() => void> = [];
    const map = new Map<string, PostDoc>();

    setLoadingPosts(true);

    chunks.forEach((uids) => {
      const q = query(collection(db, "posts"), where("userId", "in", uids));
      const unsub = onSnapshot(
        q,
        (snap) => {
          snap.docChanges().forEach((chg) => {
            const raw = chg.doc.data() as DocumentData;
            const normalized: PostDoc = toSafePost({
              id: chg.doc.id,
              ...(raw as any),
            });

            if (chg.type === "removed") {
              map.delete(chg.doc.id);
            } else {
              map.set(chg.doc.id, normalized);
            }
          });

          // 최신순 정렬
          const arr = Array.from(map.values()).sort(
            (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)
          );
          setPosts(arr);
          setLoadingPosts(false);
        },
        (err) => {
          console.error("[FollowingFeed] onSnapshot error:", err);
          setLoadingPosts(false);
        }
      );
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [loadingRelations, JSON.stringify(followingList)]);

  const isLoading = loadingRelations || loadingPosts;

  if (isLoading) return <Loading>불러오는 중…</Loading>;

  if (followingList.length === 0) {
    return (
      <Container>
        <ContentArea>
          <EmptyBox>팔로우한 사용자가 없습니다. 사용자 프로필에서 팔로우해보세요.</EmptyBox>
        </ContentArea>
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container>
        <ContentArea>
          <EmptyBox>팔로우한 사용자의 게시글이 아직 없습니다.</EmptyBox>
        </ContentArea>
      </Container>
    );
  }

  return (
    <Container>
      <ContentArea>
        {posts.map((p) => {
          const s = toSafePost(p); // 렌더 직전 한 번 더 안전 보장
          return (
            <Post
              key={s.id}
              id={s.id}
              userId={s.userId}
              nickname={s.nickname} // string 보장
              post={s.post} // string 보장
              createdAt={s.createdAt} // number 보장
              photoUrl={s.photoUrl}
              photoUrls={s.photoUrls}
              comments={s.comments}
              playlist={s.playlist}
              playlistFileUrl={s.playlistFileUrl}
            />
          );
        })}
      </ContentArea>
    </Container>
  );
}
