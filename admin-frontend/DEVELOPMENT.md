# Photography Admin Frontend - Development Environment Setup

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The admin interface will open at `http://localhost:3001`

## Features

### Dashboard
- **Overview Stats**: Total events, albums, and photos at a glance
- **Recent Events**: Quick access to your latest photography events
- **Search Functionality**: Find events quickly by title or description
- **Quick Actions**: Create new events directly from dashboard

### Event Management
- **Create Events**: Add events with title, description, location, date, and cover photo
- **Edit Events**: Update event details anytime
- **Delete Events**: Remove events (with confirmation to prevent accidents)
- **Grid Layout**: Beautiful card-based event display

### Album Management
- **Create Albums**: Organize photos into custom-named albums (e.g., "Wedding Ceremony", "Reception")
- **View Albums**: See all albums for an event
- **Edit Albums**: Update album names and details
- **Delete Albums**: Remove albums when needed

### Photo Management
- **Drag & Drop Upload**: Simply drag images onto the upload zone
- **Batch Upload**: Upload multiple photos at once
- **Preview**: See thumbnails of selected images before uploading
- **Progress Tracking**: Monitor upload progress in real-time
- **Delete Photos**: Remove individual photos from albums
- **Gallery View**: Grid display of all album photos

## User Interface Design

The admin interface is designed to feel like modern apps you know:
- **Google Photos**: Clean, intuitive photo organization
- **Canva**: Professional, non-technical layout and workflows
- **Instagram Creator Studio**: Familiar social media creator tools

All terminology is user-friendly (Events, Albums, Photos) avoiding technical jargon.

## Technology Stack

- **React 18**: Modern, component-based UI
- **Vite**: Fast build tool and dev server
- **React Router**: Navigation between pages
- **Axios**: Clean API communication
- **React Hook Form**: Simple, efficient form handling
- **React Dropzone**: Professional file uploads
- **React Query**: Smart data fetching and caching
- **Tailwind CSS**: Beautiful, responsive styling
- **Lucide React**: Beautiful icons

## API Integration

The frontend connects to the Spring Boot backend:
- **Base URL**: `http://localhost:8080/api`
- **Endpoints**: Events, Albums, Photos (all configured)

To change the API URL, edit `src/api/client.js` or set the `VITE_API_URL` environment variable.

## Component Structure

### Common Components
- `Modal`: Reusable modal dialog
- `Button`: Styled button component
- `Input`: Form input field
- `TextArea`: Multi-line text input
- `Badge`: Status indicators
- `Card`: Container component
- `Loading`: Loading spinner
- `Alert`: Notification messages

### Feature Components
- **Events**: EventCard, EventForm, EventList
- **Albums**: AlbumCard, AlbumForm, AlbumList
- **Photos**: ImageUpload, ImagePreview, PhotoGrid

## Custom Hooks

- `useEvents`: Fetch and manage events
- `useAlbums`: Fetch and manage albums
- `usePhotos`: Fetch and manage photos
- `useModal`: Modal dialog state management
- `useLocalStorage`: Persist data to browser storage

## Styling

- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Works on desktop, tablet, mobile
- **Color Theme**: Professional blue accent (#3B82F6)
- **Spacing System**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl)
- **Typography**: Clear hierarchy with multiple font sizes

## Responsive Design

- **Desktop (1920px+)**: Full sidebar, multi-column layouts
- **Tablet (768px-1919px)**: Collapsible sidebar, 2-column grids
- **Mobile (< 768px)**: Full-width, single column, bottom navigation

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Performance Optimization

- **Code Splitting**: Vendor bundles separated
- **Image Lazy Loading**: Images load on-demand
- **Request Caching**: React Query caches API responses
- **Component Memoization**: Prevents unnecessary re-renders
- **CSS Optimization**: Tailwind purges unused styles

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

### Backend Connection Issues
If you get CORS errors:
1. Verify backend is running on `http://localhost:8080`
2. Check backend CORS settings allow `http://localhost:3001`
3. Clear browser cache and restart dev server

### Upload Issues
- Check file size (max 50MB)
- Ensure file is a valid image format (JPG, PNG, GIF, WebP)
- Verify Cloudinary credentials are set in backend

### Build Issues
- Delete `node_modules` and `dist`, then run `npm install` and `npm run build`
- Ensure Node.js version is 16+

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8080/api
```

## Production Deployment

```bash
# Build optimized production bundle
npm run build

# The `dist` folder contains your static site
# Upload to your hosting service (Vercel, Netlify, AWS S3, etc.)
```

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [React Query](https://tanstack.com/query/latest)

## Support

For issues or questions, contact the development team or check the backend API documentation.
