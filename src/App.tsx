import { MainLayout } from "./components/layout/MainLayout";
import { Web3Provider } from "./context/Web3Context";
import { Home } from "./pages/Home";

export const App: React.FC = () => {
  return (
    <Web3Provider>
      <MainLayout>
        <Home></Home>
      </MainLayout>
    </Web3Provider>
  );
};
