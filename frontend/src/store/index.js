import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

export const useStore = create(
  persist(
    (set, get) => ({
      groqApiKey: '',
      setGroqApiKey: (k) => set({ groqApiKey: k }),

      history: [],
      current: null,
      loading: false,
      error: null,

      repurpose: async ({ content, sourceType }) => {
        set({ loading: true, error: null, current: null })
        try {
          const r = await fetch(`${API}/repurpose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content, source_type: sourceType, save: true,
              groq_api_key: get().groqApiKey || undefined,
            }),
          })
          const data = await r.json()
          if (!r.ok) throw new Error(data.detail || 'Failed')
          set(s => ({ current: data, history: [data, ...s.history] }))
          return data
        } catch (e) {
          set({ error: e.message }); throw e
        } finally {
          set({ loading: false })
        }
      },

      fetchHistory: async () => {
        try {
          const r = await fetch(`${API}/history`)
          const data = await r.json()
          if (Array.isArray(data)) set({ history: data })
        } catch (e) { console.error(e) }
      },

      loadItem: async (id) => {
        try {
          const r = await fetch(`${API}/history/${id}`)
          const data = await r.json()
          set({ current: data })
        } catch (e) { console.error(e) }
      },

      deleteItem: async (id) => {
        await fetch(`${API}/history/${id}`, { method: 'DELETE' })
        set(s => ({
          history: s.history.filter(h => h.id !== id),
          current: s.current?.id === id ? null : s.current,
        }))
      },

      clearCurrent: () => set({ current: null, error: null }),
    }),
    { name: 'repurpose-store', partialState: s => ({ groqApiKey: s.groqApiKey }) }
  )
)
