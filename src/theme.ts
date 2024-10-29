import type { ThemeConfig } from "antd";

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      bodyBg: "#f0f2f5",
      footerBg: "#ffffff",
    },
    Card: {
      colorBgContainer: "#ffffff",
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
    colorBgBase: "#141414",
    colorTextBase: "#ffffff",
  },
  components: {
    Layout: {
      headerBg: "#141414",
      bodyBg: "#000000",
      footerBg: "#141414",
    },
    Card: {
      colorBgContainer: "#141414",
    },
  },
};
