// src/screens/ThemeSettings.tsx
import React from "react";
import { useTheme } from "../../components/ThemeContext";
import styled from "styled-components";

const Container = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#000000" : "#ffffff")};
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 24px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const Card = styled.div<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#202020" : "#ffffff")};
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid ${(props) => (props.$isDark ? "#404040" : "#f0f0f0")};
`;

const CardTitle = styled.h2<{ $isDark: boolean }>`
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
`;

const ThemeToggle = styled.button<{ $isDark: boolean }>`
  background: ${(props) => (props.$isDark ? "#404040" : "#f8f9fa")};
  border: 1px solid ${(props) => (props.$isDark ? "#606060" : "#e9ecef")};
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.$isDark ? "#ffffff" : "#333")};
`;

const ThemeSettings = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Container $isDark={isDarkMode}>
      <ContentArea>
        <Card $isDark={isDarkMode}>
          <CardTitle $isDark={isDarkMode}>테마 설정</CardTitle>
          <ThemeToggle $isDark={isDarkMode} onClick={toggleTheme}>
            {isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          </ThemeToggle>
        </Card>
      </ContentArea>
    </Container>
  );
};

export default ThemeSettings;
