import React, { useRef, useState } from "react";

interface Props {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 50;

const TimelinePullToRefresh: React.FC<Props> = ({ onRefresh, children }) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  // 모바일 터치
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      dragging.current = true;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragging.current && startY.current !== null) {
      const distance = e.touches[0].clientY - startY.current;
      if (distance > 0) setPull(distance);
    }
  };
  const handleTouchEnd = async () => {
    if (pull > PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
    startY.current = null;
    dragging.current = false;
  };

  // PC 마우스
  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      startY.current = e.clientY;
      dragging.current = true;
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging.current && startY.current !== null) {
      const distance = e.clientY - startY.current;
      if (distance > 0) setPull(distance);
    }
  };
  const handleMouseUp = async () => {
    if (pull > PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
    startY.current = null;
    dragging.current = false;
  };

  return (
    <div
      style={{
        transform: `translateY(${pull}px)`,
        transition: pull === 0 ? "transform 0.3s" : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          height: pull > 0 || refreshing ? 40 : 0,
          textAlign: "center",
          color: "#888",
          fontSize: 14,
          transition: "height 0.2s",
        }}
      >
        {refreshing
          ? "새로고침 중..."
          : pull > PULL_THRESHOLD
          ? "놓으면 새로고침"
          : pull > 0
          ? "아래로 당겨서 새로고침"
          : null}
      </div>
      {children}
    </div>
  );
};

export default TimelinePullToRefresh;
