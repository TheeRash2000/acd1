import axios from 'axios'

export const ao = axios.create({
  baseURL: 'https://europe-west1-albion-online-data.cloudfunctions.net',
  timeout: 15000,
})

export const marketAPI = {
  async getLatestPrices() {
    const { data } = await ao.get('/api/latest-prices')
    return data
  },

  async getItemPrice(itemId: string, quality = 'Normal', locations: string[] = []) {
    const params = new URLSearchParams({
      item_id: itemId,
      quality,
      locations: locations.join(','),
    })
    const { data } = await ao.get(`/api/latest-prices?${params.toString()}`)
    return data[0]
  },

  async getHistory(itemId: string, days = 7) {
    const { data } = await ao.get(`/api/history/${itemId}?days=${days}`)
    return data
  },
}
