import useSWR from 'swr'
const fetcher = (url: string) => fetch(url).then((r) => r.json())
export function useKillboard(name: string | null) {
  const { data, error, mutate } = useSWR(
    name ? `/api/killboard/${encodeURIComponent(name)}` : null,
    fetcher,
    { refreshInterval: 15 * 60 * 1000 }
  )
  return { data, error, refetch: mutate }
}
