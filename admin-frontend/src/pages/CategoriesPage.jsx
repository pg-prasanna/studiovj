import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryAPI } from '../api/endpoints'
import { useNotification } from '../contexts/NotificationContext'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Tag } from 'lucide-react'

const CategoriesPage = () => {
  const queryClient = useQueryClient()
  const { notify } = useNotification()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })
  const categories = data?.data?.data || []

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await categoryAPI.create({ name: newName.trim(), displayOrder: categories.length })
      setNewName('')
      refresh()
      notify.success('Category created')
    } catch (err) {
      notify.error('Failed to create category')
    }
  }

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return
    try {
      await categoryAPI.update(id, { name: editingName.trim() })
      setEditingId(null)
      refresh()
      notify.success('Category updated')
    } catch (err) {
      notify.error('Failed to update category')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Events using it will become uncategorized.')) return
    try {
      await categoryAPI.delete(id)
      refresh()
      notify.success('Category deleted')
    } catch (err) {
      notify.error('Failed to delete category')
    }
  }

  const move = async (index, direction) => {
    const newOrder = [...categories]
    const target = index + direction
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    try {
      await categoryAPI.reorder(newOrder.map((c) => c.id))
      refresh()
    } catch (err) {
      notify.error('Failed to reorder categories')
    }
  }

  return (
    <div className="space-y-lg animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-700">Manage event categories used across the website</p>
      </div>

      <form onSubmit={handleCreate} className="card p-lg flex gap-md items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 mb-sm">New Category</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="E.g., Outdoor"
            className="w-full px-md py-sm rounded-md border bg-white border-neutral text-gray-900"
          />
        </div>
        <button type="submit" className="px-lg py-sm bg-accent text-white rounded-md flex items-center gap-sm">
          <Plus size={18} /> Add
        </button>
      </form>

      <div className="card p-lg">
        {isLoading ? (
          <p className="text-gray-700">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-700">No categories yet.</p>
        ) : (
          <div className="space-y-sm">
            {categories.map((c, i) => (
              <div key={c.id} className="flex items-center gap-md p-sm border border-neutral rounded-md">
                <Tag size={16} className="text-gray-400" />
                {editingId === c.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(c.id)}
                    className="flex-1 px-sm py-xs rounded border border-neutral"
                  />
                ) : (
                  <span className="flex-1 text-gray-900">{c.name}</span>
                )}

                <button onClick={() => move(i, -1)} className="p-xs text-gray-700 hover:text-gray-900" disabled={i === 0}>
                  <ArrowUp size={16} />
                </button>
                <button onClick={() => move(i, 1)} className="p-xs text-gray-700 hover:text-gray-900" disabled={i === categories.length - 1}>
                  <ArrowDown size={16} />
                </button>

                {editingId === c.id ? (
                  <button onClick={() => handleUpdate(c.id)} className="px-md py-xs bg-accent text-white rounded-md text-sm">
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditingId(c.id); setEditingName(c.name) }}
                    className="p-xs text-gray-700 hover:text-gray-900"
                  >
                    <Pencil size={16} />
                  </button>
                )}

                <button onClick={() => handleDelete(c.id)} className="p-xs text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesPage
