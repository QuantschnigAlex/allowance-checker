import { createContext } from "react";
import { ThemeContextType } from "../types/theme";
import { Web3ContextData } from "../types/web3";

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const Web3Context = createContext<Web3ContextData | undefined>(
  undefined
);
