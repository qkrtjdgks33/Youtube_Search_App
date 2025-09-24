import { RouterProvider, createBrowserRouter } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import Home from "./screens/home";
import Profile from "./screens/profile";
import Signin from "./screens/signin";
import Signup from "./screens/signup";
import reset from "styled-reset";
import { auth } from "./firebaseConfig";
import { useEffect, useState } from "react";
import LoadingScreen from "./screens/loading-screen";
import ProtectedRouter from "./components/protected-router";
import Layout from "./screens/layout";
import "moment/locale/ko";
import KategorieFunction from "./components/KategorieFunction";
import InputPostScreen from "./screens/InputPostScreen";
import Playlist from "./components/playlist";
import UserProfileScreen from "./screens/user-profile";
import { MusicPlayerProvider } from "./components/MusicFunction";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { RelationsProvider } from "./components/RelationsContext";
import Settings from "./screens/Settingbutton/settings";
import ProfileSettings from "./screens/Settingbutton/ProfileSettings";
import ThemeSettings from "./screens/Settingbutton/ThemeSetting";
import BlockSettings from "./screens/Settingbutton/BlockSettings"; // ✅ 추가

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRouter>
        <Layout />
      </ProtectedRouter>
    ),
    children: [
      { path: "", element: <Home /> },
      { path: "profile", element: <Profile /> },
      { path: "music", element: <Playlist /> },
      { path: "KategorieFunction", element: <KategorieFunction /> },
      { path: "InputPostScreen", element: <InputPostScreen /> },
      { path: "user/:uid", element: <UserProfileScreen /> },
      
      // 🔹 설정 관련 경로
      { path: "settings", element: <Settings /> },
      { path: "settings/profile", element: <ProfileSettings /> },
      { path: "settings/theme", element: <ThemeSettings /> },
      { path: "settings/block", element: <BlockSettings /> }, // ✅ 차단 관리 경로
    ],
  },
  { path: "/signin", element: <Signin /> },
  { path: "/signup", element: <Signup /> },
]);

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

// 테마 전역 스타일
const ThemedGlobalStyle = createGlobalStyle<{ $isDark: boolean }>`
  ${reset}
  html, body, #root {
    height: 100%;
    background: ${(props) => (props.$isDark ? "#000000" : "#ffffff")};
  }

  body {
    background: ${(props) => (props.$isDark ? "#000000" : "#ffffff")};
    color: ${(props) => (props.$isDark ? "#ffffff" : "#1a1a1a")};
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  * { box-sizing: border-box; }
`;

// auth 준비 이후 렌더링
const AppContent = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      await auth.authStateReady();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <>
        <ThemedGlobalStyle $isDark={isDarkMode} />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <ThemedGlobalStyle $isDark={isDarkMode} />
      <Container className="App">
        <RelationsProvider>
          <RouterProvider router={router} />
        </RelationsProvider>
      </Container>
    </>
  );
};

// 메인 App
function App() {
  return (
    <ThemeProvider>
      <MusicPlayerProvider>
        <AppContent />
      </MusicPlayerProvider>
    </ThemeProvider>
  );
}

export default App;
