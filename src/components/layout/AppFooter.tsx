import { GithubOutlined } from "@ant-design/icons";
import { Footer } from "antd/es/layout/layout";

export const AppFooter: React.FC = () => {
  return (
    <Footer>
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>© 2024 Allowance Checker</div>
        <a href="https://github.com/QuantschnigAlex/allowance-checker">
          <GithubOutlined style={{ fontSize: 24 }} />
        </a>
      </div>
    </Footer>
  );
};
