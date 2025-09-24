// src/screens/settings.tsx
import React, { useMemo, useState } from "react";
import { useTheme } from "../../components/ThemeContext";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(p) => (p.$isDark ? "#000000" : "#ffffff")};
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  width: 100%;
  min-height: 100vh;
  padding: 24px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const MenuList = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${(p) => (p.$isDark ? "#333" : "#ddd")};
`;

const MenuItem = styled(Link)<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  background: ${(p) => (p.$isDark ? "#1a1a1a" : "#fff")};
  border-bottom: 1px solid ${(p) => (p.$isDark ? "#333" : "#eee")};
  transition: background 0.2s ease;
  &:hover {
    background: ${(p) => (p.$isDark ? "#2a2a2a" : "#f5f5f5")};
  }
`;

const RowButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 500;
  background: ${(p) => (p.$isDark ? "#1a1a1a" : "#fff")};
  color: ${(p) => (p.$isDark ? "#ffffff" : "#1a1a1a")};
  border: none;
  border-bottom: 1px solid ${(p) => (p.$isDark ? "#333" : "#eee")};
  cursor: pointer;
  text-align: left;
  &:hover {
    background: ${(p) => (p.$isDark ? "#2a2a2a" : "#f5f5f5")};
  }
`;

const RightDim = styled.span`
  opacity: 0.7;
`;
const LangGroup = styled.div<{ $isDark: boolean }>`
  background: ${(p) => (p.$isDark ? "#141414" : "#fff")};
  border-bottom: 1px solid ${(p) => (p.$isDark ? "#333" : "#eee")};
  &:last-child {
    border-bottom: none;
  }
`;
const LangPanel = styled.div<{ $isDark: boolean; $open: boolean }>`
  max-height: ${(p) => (p.$open ? "200px" : "0px")};
  overflow: hidden;
  transition: max-height 0.25s ease;
  background: ${(p) => (p.$isDark ? "#101010" : "#fafafa")};
  border-top: 1px solid ${(p) => (p.$isDark ? "#333" : "#eee")};
`;
const LangList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 18px;
`;
const LangBtn = styled.button<{ $active: boolean; $isDark: boolean }>`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid
    ${(p) =>
      p.$active ? (p.$isDark ? "#666" : "#bbb") : p.$isDark ? "#333" : "#ddd"};
  background: ${(p) =>
    p.$active
      ? p.$isDark
        ? "#2b2b2b"
        : "#eaeaea"
      : p.$isDark
      ? "#1f1f1f"
      : "#ffffff"};
  color: ${(p) => (p.$isDark ? "#fff" : "#1a1a1a")};
  font-size: 14px;
  cursor: pointer;
`;

const getLangLabel = (code: string | null): string => {
  switch (code) {
    case "en":
      return "English";
    case "ja":
      return "日本語";
    case "zh":
      return "中文";
    case "ko":
    default:
      return "한국어";
  }
};

const Settings = () => {
  const { isDarkMode } = useTheme();

  // 패널 열림 상태
  const [isLangOpen, setIsLangOpen] = useState(false);

  // 현재 저장된 언어를 초기 선택값으로만 사용 (저장은 안 함)
  const initial =
    typeof window === "undefined"
      ? "ko"
      : localStorage.getItem("app_language") || "ko";

  // 사용자가 "선택한" 언어를 표시
  const [selectedCode, setSelectedCode] = useState<string>(initial);
  const selectedLabel = useMemo(
    () => getLangLabel(selectedCode),
    [selectedCode]
  );

  const LANGS = [
    { code: "ko", label: "한국어" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "zh", label: "中文" },
  ] as const;

  const handlePick = (code: string) => {
    setSelectedCode(code); // ✅ 오른쪽 라벨/버튼 활성 즉시 반영
    console.log("[언어 선택]", code); // (저장은 아직 안 함)
  };

  return (
    <Container $isDark={isDarkMode}>
      <Title>설정</Title>
      <MenuList $isDark={isDarkMode}>
        <MenuItem to="/settings/profile" $isDark={isDarkMode}>
          프로필 변경
        </MenuItem>
        <MenuItem to="/settings/theme" $isDark={isDarkMode}>
          테마 변경
        </MenuItem>
        <MenuItem to="/settings/block" $isDark={isDarkMode}>
          차단
        </MenuItem>

        {/* 언어 선택 (표시만) */}
        <LangGroup $isDark={isDarkMode}>
          <RowButton
            $isDark={isDarkMode}
            type="button"
            onClick={() => setIsLangOpen((v) => !v)}
            aria-expanded={isLangOpen}
            aria-controls="lang-panel"
          >
            <span>언어 변경</span>
            <RightDim aria-live="polite">{selectedLabel}</RightDim>
          </RowButton>

          <LangPanel
            $isDark={isDarkMode}
            $open={isLangOpen}
            id="lang-panel"
            role="region"
            aria-label="언어 선택"
          >
            <LangList>
              {LANGS.map((l) => (
                <LangBtn
                  key={l.code}
                  onClick={() => handlePick(l.code)}
                  $active={selectedCode === l.code}
                  $isDark={isDarkMode}
                >
                  {l.label}
                </LangBtn>
              ))}
            </LangList>
          </LangPanel>
        </LangGroup>
      </MenuList>
    </Container>
  );
};

export default Settings;
