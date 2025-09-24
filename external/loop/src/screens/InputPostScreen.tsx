// src/screens/InputPostScreen.tsx

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import InputPost from "../components/InputPost";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Post from "../components/Post"; // ✅ Post 컴포넌트 import

const ScreenContainer = styled.div`
  padding: 20px;
`;

const InputPostScreen = () => {
  const [myPosts, setMyPosts] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((post: any) => post.userId === user.uid);
      setMyPosts(posts);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScreenContainer>
      <InputPost />
      {myPosts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          userId={post.userId}
          nickname={post.nickname}
          post={post.post}
          createdAt={post.createdAt}
          photoUrl={post.photoUrl}
          photoUrls={post.photoUrls}
          comments={post.comments}
          playlist={post.playlist}
          playlistFileUrl={post.playlistFileUrl}
        />
      ))}
    </ScreenContainer>
  );
};

export default InputPostScreen;
