import { Button } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
      onClick={toggleTheme}
    />
  );
};
