interface StorageItem {
  value: string;
  created: string; // ISO date string
  ttl: number;   // seconds
}

export const storageUtil = {
  setItemWithTTL(key: string, value: string, ttl: number, created: string): void {
    const item: StorageItem = {
      value,
      created, // "2025-01-30T07:19:54.373Z"
      ttl      // 2592000 seconds
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getItemWithTTL(key: string): string | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr) as StorageItem;
    const now = new Date().getTime();
    const createdTime = new Date(item.created).getTime();
    const expiresAt = createdTime + (item.ttl * 1000);

    if (now > expiresAt) {
      console.log(`Item ${key} has expired`);
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  },

  getRemainingTime(key: string): number {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return 0;

    const item = JSON.parse(itemStr) as StorageItem;
    const now = new Date().getTime();
    const createdTime = new Date(item.created).getTime();
    const expiresAt = createdTime + (item.ttl * 1000);
    const remaining = (expiresAt - now) / 1000;

    return remaining > 0 ? remaining : 0;
  }
};
