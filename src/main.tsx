import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ConfigProvider } from "antd";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
        components: {
          Layout: {
            headerBg: "#ffff",
            headerHeight: 64,
            colorBgLayout: "#fff",
            footerBg: "#fff",
          },
        },
      }}
    >
      <App></App>
    </ConfigProvider>
  </StrictMode>
);
