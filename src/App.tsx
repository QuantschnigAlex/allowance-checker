import { ConfigProvider, theme } from "antd";
import { MainLayout } from "./components/layout/MainLayout";
import { Web3Provider } from "./context/Web3Context";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { darkTheme, lightTheme } from "./theme";
import { Home } from "./pages/Home";

const AppContent = () => {
  const { theme: currentTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        ...(currentTheme === "light" ? lightTheme : darkTheme),
        algorithm:
          currentTheme === "light"
            ? theme.defaultAlgorithm
            : theme.darkAlgorithm,
      }}
    >
      <Web3Provider>
        <MainLayout>
          <Home />
        </MainLayout>
      </Web3Provider>
    </ConfigProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};
