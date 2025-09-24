import { useEffect, useState } from "react";
import styled from "styled-components";
import { IPost } from "../types/post-type";
import {
  Unsubscribe,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Post from "../components/Post";

// 🔹 refreshKey prop 타입 정의 추가
interface TimelineProps {
  refreshKey: number;
}

const Container = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }

  * {
    max-width: 100%;
    word-break: break-word;
  }
`;

const Timeline: React.FC<TimelineProps> = ({ refreshKey }) => {
  const [posts, setPosts] = useState<IPost[]>([]);

  useEffect(() => {
    // 🔁 새로고침마다 구독 재시작
    let unsubscribe: Unsubscribe | null = null;

    const fetchPostsRealtime = async () => {
      const path = collection(db, "posts");
      const condition = orderBy("createdAt", "desc");
      const postsQuery = query(path, condition);

      unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const timelinePosts = snapshot.docs.map((doc) => {
          const {
            createdAt,
            nickname,
            post,
            userId,
            email,
            photoUrls,
            photoUrl,
            playlist,
            playlistFileUrl,
          } = doc.data();

          return {
            createdAt,
            nickname,
            post,
            userId,
            email,
            photoUrls: photoUrls ?? [],
            photoUrl: photoUrl ?? "",
            playlist: playlist ?? null,
            playlistFileUrl: playlistFileUrl ?? null,
            id: doc.id,
          };
        });
        setPosts(timelinePosts);
      });
    };

    fetchPostsRealtime();

    return () => {
      unsubscribe && unsubscribe(); // 🔄 기존 구독 해제
    };
  }, [refreshKey]); // 🔥 refreshKey가 바뀔 때마다 다시 구독

  return (
    <Container>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </Container>
  );
};

export default Timeline;
