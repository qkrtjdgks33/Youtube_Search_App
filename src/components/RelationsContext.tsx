// src/components/RelationsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "../firebaseConfig";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type RelationsContextValue = {
  loading: boolean;
  isFollowing: (uid: string) => boolean;
  isMuted: (uid: string) => boolean;
  follow: (uid: string) => Promise<void>;
  unfollow: (uid: string) => Promise<void>;
  mute: (uid: string) => Promise<void>;
  unmute: (uid: string) => Promise<void>;
};

const RelationsContext = createContext<RelationsContextValue | null>(null);

// useMeRef 훅은 RelationsProvider 컴포넌트 최상단에서만 호출해야 합니다.
const useMeRef = () => auth.currentUser?.uid ?? null;

export const RelationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  // ⭐️ 훅을 컴포넌트 최상단에 한번만 호출하여 변수에 저장
  const me = useMeRef();

  // refForMe 함수는 훅을 호출하지 않고 me 변수를 사용하도록 수정
  const refForMe = () => {
    return me ? doc(db, "user_relations", me) : null;
  };

  useEffect(() => {
    let unsubscribeRelations: (() => void) | null = null;
    const stopAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeRelations) {
        unsubscribeRelations();
        unsubscribeRelations = null;
      }
      if (!user) {
        setFollowing(new Set());
        setMuted(new Set());
        setLoading(false);
        return;
      }
      const ref = doc(db, "user_relations", user.uid);
      unsubscribeRelations = onSnapshot(
        ref,
        (snap) => {
          const data = snap.data() || {};
          setFollowing(
            new Set<string>(Array.isArray(data.following) ? data.following : [])
          );
          setMuted(
            new Set<string>(Array.isArray(data.muted) ? data.muted : [])
          );
          setLoading(false);
        },
        (err) => {
          console.error("[Relations] onSnapshot error:", err);
          setLoading(false);
        }
      );
    });
    return () => {
      stopAuth();
      if (unsubscribeRelations) unsubscribeRelations();
    };
  }, []);

  const isFollowing = (uid: string) => following.has(uid);
  const isMuted = (uid: string) => muted.has(uid);

  // ⭐️ 훅 대신 최상위에서 선언한 me 변수 사용
  const follow = async (targetUid: string) => {
    if (!me || !targetUid || me === targetUid) return;
    const ref = refForMe();
    if (!ref) return;

    try {
      await setDoc(
        ref,
        {
          following: arrayUnion(targetUid),
          muted: arrayRemove(targetUid),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("[Relations] follow 실패:", e);
      alert("팔로우에 실패했습니다. 권한/네트워크 상태를 확인하세요.");
    }
  };

  // ⭐️ 훅 대신 최상위에서 선언한 me 변수 사용
  const unfollow = async (targetUid: string) => {
    if (!me || !targetUid || me === targetUid) return;
    const ref = refForMe();
    if (!ref) return;

    try {
      await setDoc(
        ref,
        {
          following: arrayRemove(targetUid),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("[Relations] unfollow 실패:", e);
      alert("언팔로우에 실패했습니다. 권한/네트워크 상태를 확인하세요.");
    }
  };

  // ⭐️ 훅 대신 최상위에서 선언한 me 변수 사용
  const mute = async (targetUid: string) => {
    if (!me || !targetUid || me === targetUid) return;
    const ref = refForMe();
    if (!ref) return;

    try {
      await setDoc(
        ref,
        {
          muted: arrayUnion(targetUid),
          following: arrayRemove(targetUid),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("[Relations] mute 실패:", e);
      alert("뮤트에 실패했습니다. 권한/네트워크 상태를 확인하세요.");
    }
  };

  // ⭐️ 훅 대신 최상위에서 선언한 me 변수 사용
  const unmute = async (targetUid: string) => {
    if (!me || !targetUid || me === targetUid) return;
    const ref = refForMe();
    if (!ref) return;

    try {
      await setDoc(
        ref,
        {
          muted: arrayRemove(targetUid),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("[Relations] unmute 실패:", e);
      alert("뮤트 해제에 실패했습니다. 권한/네트워크 상태를 확인하세요.");
    }
  };

  const value = useMemo<RelationsContextValue>(
    () => ({
      loading,
      isFollowing,
      isMuted,
      follow,
      unfollow,
      mute,
      unmute,
    }),
    [loading, following, muted, me]
  ); // me를 의존성 배열에 추가

  return (
    <RelationsContext.Provider value={value}>
      {children}
    </RelationsContext.Provider>
  );
};

export const useRelations = () => {
  const ctx = useContext(RelationsContext);
  if (!ctx)
    throw new Error("useRelations must be used within RelationsProvider");
  return ctx;
};
