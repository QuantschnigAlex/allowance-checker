import { MainLayout } from "./components/layout/MainLayout";
import { WalletInfo } from "./components/web3/WalletInfo";
import { Web3Provider } from "./context/Web3Context";

export const App: React.FC = () => {
  return (
    <Web3Provider>
      <MainLayout>
        <WalletInfo />
      </MainLayout>
    </Web3Provider>
  );
};
