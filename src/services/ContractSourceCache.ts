import { EtherscanContractSource } from "./utils";

export class ContractSourceCache {
  private static instance: ContractSourceCache;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;  // 24 hours

  private constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  static getInstance(): ContractSourceCache {
    if (!ContractSourceCache.instance) {
      ContractSourceCache.instance = new ContractSourceCache();
    }
    return ContractSourceCache.instance;
  }

  getKey(address: string, chainId: number): string {
    return `${chainId}-${address.toLowerCase()}`;
  }

  get(address: string, chainId: number): EtherscanContractSource | null {
    const key = this.getKey(address, chainId);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return cached.data;
  }

  set(address: string, chainId: number, data: EtherscanContractSource): void {
    const key = this.getKey(address, chainId);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.saveToStorage();
  }

  saveToStorage(): void {
    const cacheData: { [key: string]: { data: any; timestamp: number } } = {};
    this.cache.forEach((value, key) => {
      cacheData[key] = value;
    });
    localStorage.setItem("contractSourceCache", JSON.stringify(cacheData));
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem("contractSourceCache");
    if (stored) {
      const data = JSON.parse(stored);
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        this.cache.set(key, value);
      });
    }
  }
}
