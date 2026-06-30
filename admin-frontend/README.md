# Photography Admin Frontend

Professional admin interface for managing photography events, albums, and photos. Built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard**: Overview of events, albums, and photos with recent activities
- **Event Management**: Create, edit, and manage photography events with cover photos
- **Album Management**: Organize photos into albums with custom names
- **Photo Management**: Drag-and-drop upload, batch upload, reorder, and delete photos
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization with React Query
- **Form Validation**: Robust validation using React Hook Form

## Tech Stack

- **React 18**: Modern UI library
- **Vite**: Next-generation frontend build tool
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Hook Form**: Performant form management
- **React Dropzone**: File upload with drag-and-drop
- **React Query**: Server state management and synchronization
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon set

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will open at `http://localhost:3001`

## Project Structure

```
src/
├── api/                    # API configuration and endpoints
├── assets/                 # Static assets
├── components/
│   ├── common/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── events/            # Event-related components
│   ├── albums/            # Album-related components
│   └── photos/            # Photo upload and management
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components
├── pages/                 # Page components
├── routes/                # Route configuration
├── services/              # API service layer
├── utils/                 # Utility functions
├── contexts/              # React contexts
└── styles/                # Global styles
```

## API Configuration

Update the API base URL in `src/api/client.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Key Features

### Dashboard
- Total events, albums, and photos count
- Recent events list with search functionality
- Quick actions for event management

### Event Management
- Create new events with title, description, location, and date
- Upload cover images for events
- Edit event details
- Delete events with confirmation modal
- Bulk operations support

### Album Management
- Create albums with custom names
- View albums organized by event
- Edit album details
- Delete albums
- Reorder albums

### Photo Management
- Drag-and-drop file upload
- Multiple file upload at once
- Preview images before upload
- Real-time upload progress
- Delete photos with confirmation
- Reorder photos in album
- Batch operations

## Responsive Design

The admin interface is fully responsive:

- **Desktop** (1920px+): Full sidebar navigation
- **Tablet** (768px-1919px): Collapsible sidebar
- **Mobile** (< 768px): Bottom navigation bar

## Form Validation

All forms include validation for:
- Required fields
- File types and sizes
- Date constraints
- Field-specific rules

## Performance Optimization

- Code splitting and lazy loading
- Image optimization
- Request caching with React Query
- Efficient re-renders with React.memo

## Troubleshooting

### Backend Connection Issues

If you get CORS errors:
1. Ensure backend is running on `http://localhost:8080`
2. Check CORS configuration in backend (should allow `http://localhost:3001`)
3. Verify API endpoints are correct

### Upload Issues

- Check file size limits (max 50MB per file)
- Ensure Cloudinary credentials are configured in backend
- Verify browser allows file drag-and-drop

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Preview production build locally
npm run preview
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance Targets

- Lighthouse Score: 90+
- First Contentful Paint: < 2s
- Time to Interactive: < 3.5s

## License

Proprietary - Photography Admin Platform

## Support

For issues or feature requests, please contact the development team.
