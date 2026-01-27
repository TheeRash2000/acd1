/**
 * Market price hook for Heart Runs items
 * Fetches live prices from Albion Data API
 */

import { useEffect, useState } from 'react';

interface PriceData {
  item_id: string;
  buy_price_min?: number;
  buy_price_max?: number;
  sell_price_min?: number;
  sell_price_max?: number;
  last_update?: number;
}

interface MarketPrices {
  [itemId: string]: {
    buy: number; // Average buy price (what you pay)
    sell: number; // Average sell price (what you get)
    lastUpdate: number;
  };
}

const ALBION_DATA_API = 'https://europe.albion-online-data.com/api/v2/stats/prices';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useHeartRunMarketPrices(itemIds: string[]) {
  const [prices, setPrices] = useState<MarketPrices>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    if (itemIds.length === 0) return;

    const fetchPrices = async () => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        setLoading(true);
        setError(null);

        // Build URL with items in path and location as query parameter
        const itemPath = itemIds.join(',');
        const url = `${ALBION_DATA_API}/${itemPath}.json?locations=Caerleon`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data: PriceData[] = await response.json();
        const newPrices: MarketPrices = {};
        const now = Date.now();

        data.forEach((item) => {
          const buyPrice = Math.round(((item.buy_price_min || 0) + (item.buy_price_max || 0)) / 2) || 0;
          const sellPrice = Math.round(((item.sell_price_min || 0) + (item.sell_price_max || 0)) / 2) || 0;

          newPrices[item.item_id] = {
            buy: buyPrice,
            sell: sellPrice,
            lastUpdate: item.last_update || now,
          };
        });

        setPrices(newPrices);
        setLastUpdate(now);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch prices';
        setError(message);
        console.error('Market price fetch error:', err);
        
        // Set default prices on error to allow the component to work
        const defaultPrices: MarketPrices = {};
        itemIds.forEach((id) => {
          defaultPrices[id] = { buy: 0, sell: 0, lastUpdate: Date.now() };
        });
        setPrices(defaultPrices);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and set up interval for updates
    fetchPrices();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchPrices();
    }, CACHE_DURATION);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchPrices();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [itemIds]);

  const getPrice = (itemId: string, type: 'buy' | 'sell' = 'buy'): number => {
    return prices[itemId]?.[type] ?? 0;
  };

  const formatLastUpdate = (): string => {
    if (!lastUpdate) return 'Never';
    const now = Date.now();
    const diff = now - lastUpdate;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return {
    prices,
    loading,
    error,
    lastUpdate,
    getPrice,
    formatLastUpdate,
  };
}
