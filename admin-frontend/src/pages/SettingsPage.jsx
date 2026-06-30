import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { Building2, User, Server, Cloud, Image as ImageIcon, Phone, Share2, Layout, Search } from 'lucide-react'
import { useSystemHealth, useSystemStorage } from '../hooks'
import { settingsAPI } from '../api/endpoints'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const emptySettings = {
  studioName: '', tagline: '', logoUrl: '', faviconUrl: '',
  heroHeading: '', heroSubheading: '', aboutText1: '', aboutText2: '', aboutText3: '', sinceYear: '',
  email: '', phone: '', whatsapp: '', address: '', website: '',
  instagram: '', facebook: '', youtube: '',
  footerText: '', copyrightText: '',
  primaryColor: '', accentColor: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '', textarea = false, full = false }) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <label className="block text-sm font-medium text-gray-900 mb-sm">{label}</label>
    {textarea ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-md py-sm rounded-md border bg-white border-neutral text-gray-900 placeholder-gray-400"
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-md py-sm rounded-md border bg-white border-neutral text-gray-900 placeholder-gray-400"
      />
    )}
  </div>
)

const SettingsPage = () => {
  const { notify } = useNotification()
  const { data: healthData } = useSystemHealth()
  const { data: storageData } = useSystemStorage()
  const queryClient = useQueryClient()

  const [activeSection, setActiveSection] = useState('branding')
  const [form, setForm] = useState(emptySettings)
  const [logoFile, setLogoFile] = useState(null)
  const [faviconFile, setFaviconFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getAll(),
  })

  useEffect(() => {
    const s = data?.data?.data
    if (s) setForm({ ...emptySettings, ...s })
  }, [data])

  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }))

  const saveSettings = async () => {
    setSaving(true)
    try {
      await settingsAPI.update(form)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      notify.success('Settings saved successfully')
    } catch (err) {
      notify.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const uploadLogo = async () => {
    if (!logoFile) return
    try {
      const res = await settingsAPI.uploadLogo(logoFile)
      setForm((prev) => ({ ...prev, logoUrl: res?.data?.data?.logoUrl }))
      setLogoFile(null)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      notify.success('Logo uploaded')
    } catch (err) {
      notify.error('Failed to upload logo')
    }
  }

  const uploadFavicon = async () => {
    if (!faviconFile) return
    try {
      const res = await settingsAPI.uploadFavicon(faviconFile)
      setForm((prev) => ({ ...prev, faviconUrl: res?.data?.data?.faviconUrl }))
      setFaviconFile(null)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      notify.success('Favicon uploaded')
    } catch (err) {
      notify.error('Failed to upload favicon')
    }
  }

  const sections = [
    { id: 'branding', label: 'Branding', icon: ImageIcon },
    { id: 'studio', label: 'Studio & Homepage', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'footer', label: 'Footer & Theme', icon: Layout },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'admin', label: 'Admin Profile', icon: User },
    { id: 'system', label: 'System', icon: Server },
    { id: 'cloudinary', label: 'Cloudinary', icon: Cloud },
  ]

  const getHealthStatus = () => {
    if (!healthData?.data) return { status: 'unknown', color: 'gray' }
    const { database, cloudinary } = healthData.data
    if (database === 'connected' && cloudinary === 'connected') return { status: 'healthy', color: 'green' }
    return { status: 'degraded', color: 'yellow' }
  }

  const getStoragePercent = () => {
    if (!storageData?.data) return 0
    const { used, total } = storageData.data
    return total > 0 ? Math.round((used / total) * 100) : 0
  }

  const SaveBar = () => (
    <div className="flex justify-end mt-lg">
      <button
        onClick={saveSettings}
        disabled={saving}
        className="bg-accent text-white px-lg py-sm rounded-md font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-md py-lg">
        <div className="mb-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-sm">Settings</h1>
          <p className="text-gray-700">Manage your studio information, preferences, and system configuration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
          <div className="lg:col-span-1 bg-white rounded-lg p-md border border-neutral h-fit">
            <nav className="space-y-xs">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-md px-md py-sm rounded-md transition-colors ${
                      isActive ? 'bg-accent text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-neutral'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            {isLoading && <p className="text-gray-700">Loading settings...</p>}

            {!isLoading && activeSection === 'branding' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Branding</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-sm">Logo</p>
                    {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="h-20 mb-md object-contain" />}
                    <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="block mb-sm text-sm" />
                    <button onClick={uploadLogo} disabled={!logoFile} className="px-md py-xs bg-accent text-white rounded-md text-sm disabled:opacity-50">
                      Upload Logo
                    </button>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-sm">Favicon</p>
                    {form.faviconUrl && <img src={form.faviconUrl} alt="Favicon" className="h-10 mb-md object-contain" />}
                    <input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} className="block mb-sm text-sm" />
                    <button onClick={uploadFavicon} disabled={!faviconFile} className="px-md py-xs bg-accent text-white rounded-md text-sm disabled:opacity-50">
                      Upload Favicon
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && activeSection === 'studio' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Studio & Homepage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                  <Field label="Studio Name" value={form.studioName} onChange={set('studioName')} />
                  <Field label="Tagline" value={form.tagline} onChange={set('tagline')} />
                  <Field label="Studio Since (Year)" value={form.sinceYear} onChange={set('sinceYear')} />
                  <Field label="Hero Heading" value={form.heroHeading} onChange={set('heroHeading')} />
                  <Field label="Hero Subheading" value={form.heroSubheading} onChange={set('heroSubheading')} textarea full />
                  <Field label="About Paragraph 1" value={form.aboutText1} onChange={set('aboutText1')} textarea full />
                  <Field label="About Paragraph 2" value={form.aboutText2} onChange={set('aboutText2')} textarea full />
                  <Field label="About Paragraph 3" value={form.aboutText3} onChange={set('aboutText3')} textarea full />
                </div>
                <SaveBar />
              </div>
            )}

            {!isLoading && activeSection === 'contact' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                  <Field label="Email" type="email" value={form.email} onChange={set('email')} />
                  <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
                  <Field label="WhatsApp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} />
                  <Field label="Website" type="url" value={form.website} onChange={set('website')} />
                  <Field label="Address" value={form.address} onChange={set('address')} full />
                </div>
                <SaveBar />
              </div>
            )}

            {!isLoading && activeSection === 'social' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Social Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                  <Field label="Instagram" value={form.instagram} onChange={set('instagram')} placeholder="@username" />
                  <Field label="Facebook" value={form.facebook} onChange={set('facebook')} placeholder="@username" />
                  <Field label="YouTube" value={form.youtube} onChange={set('youtube')} placeholder="@username" />
                </div>
                <SaveBar />
              </div>
            )}

            {!isLoading && activeSection === 'footer' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Footer & Theme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                  <Field label="Footer Text" value={form.footerText} onChange={set('footerText')} textarea full />
                  <Field label="Copyright Text" value={form.copyrightText} onChange={set('copyrightText')} full />
                  <Field label="Primary Color" type="color" value={form.primaryColor || '#000000'} onChange={set('primaryColor')} />
                  <Field label="Accent Color" type="color" value={form.accentColor || '#b4622e'} onChange={set('accentColor')} />
                </div>
                <SaveBar />
              </div>
            )}

            {!isLoading && activeSection === 'seo' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">SEO</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                  <Field label="SEO Title" value={form.seoTitle} onChange={set('seoTitle')} full />
                  <Field label="SEO Description" value={form.seoDescription} onChange={set('seoDescription')} textarea full />
                  <Field label="SEO Keywords (comma separated)" value={form.seoKeywords} onChange={set('seoKeywords')} full />
                </div>
                <SaveBar />
              </div>
            )}

            {activeSection === 'admin' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Admin Profile</h2>
                <p className="text-gray-700">Admin profile and password management is handled by your authentication provider.</p>
              </div>
            )}

            {activeSection === 'system' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                  <div className="p-md rounded-lg border border-neutral bg-gray-50">
                    <p className="text-sm text-gray-700 mb-sm">App Version</p>
                    <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
                  </div>
                  <div className="p-md rounded-lg border border-neutral bg-gray-50">
                    <p className="text-sm text-gray-700 mb-sm">Overall Health</p>
                    <div className="flex items-center gap-md">
                      <div className={`w-3 h-3 rounded-full ${getHealthStatus().color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{getHealthStatus().status}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-md">Storage Usage</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-accent h-3 rounded-full transition-all" style={{ width: `${getStoragePercent()}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-700 mt-sm">{getStoragePercent()}% used</p>
                </div>
              </div>
            )}

            {activeSection === 'cloudinary' && (
              <div className="bg-white rounded-lg p-lg border border-neutral">
                <h2 className="text-xl font-bold text-gray-900 mb-lg">Cloudinary Configuration</h2>
                <div className="p-md rounded-lg border border-green-500 bg-green-50">
                  <div className="flex items-center gap-md">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium text-green-900">Connected</p>
                      <p className="text-sm text-green-700">Cloudinary integration is active and used for logo, favicon, and event uploads</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
