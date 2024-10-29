import { Layout } from "antd";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content
        style={{
          padding: "24px",
          minHeight: "calc(100vh - 64px - 70px)", // viewport height - header - footer
        }}
      >
        {children}
      </Content>
      <AppFooter />
    </Layout>
  );
};
