'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type GoldPrice = {
  rate: number
  change24h: number
}

export function useGoldPrice(server: 'europe' | 'america' | 'asia' = 'europe') {
  const { data, error, isLoading, mutate } = useSWR<GoldPrice>(`/api/gold?server=${server}`, fetcher, {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    keepPreviousData: false,
    dedupingInterval: 0,
  })

  return {
    rate: data?.rate,
    change24h: data?.change24h,
    isLoading,
    error,
    refresh: mutate,
  }
}
