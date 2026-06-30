import { useState, useEffect } from 'react'
import { eventService, settingsService, categoryService } from '../services/eventService'

export const useEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await eventService.getPublished()
        setEvents(data)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load events')
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { events, loading, error }
}

export const useEventById = (id) => {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchEvent = async () => {
      try {
        setLoading(true)
        const data = await eventService.getById(id)
        setEvent(data)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load event')
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  return { event, loading, error }
}

export const useSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsService.get()
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}
