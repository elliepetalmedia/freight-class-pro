# FreightClassPro - LTL Density Calculator

## Overview

FreightClassPro is a client-side web application that calculates freight class based on NMFC (National Motor Freight Classification) density guidelines. The tool is designed for warehouse managers, logistics coordinators, and small business owners who need quick, accurate freight class estimates without navigating complex carrier portals.

The application performs density calculations entirely in the browser, converting shipment dimensions and weight into freight class classifications according to standard LTL (Less Than Truckload) shipping density ranges.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript using Vite as the build tool

**UI Component Library**: shadcn/ui built on Radix UI primitives
- Provides accessible, customizable components
- Follows the "New York" style variant
- All components are local copies allowing full customization

**Routing**: Wouter (lightweight client-side routing)
- Simple file-based routing structure
- Pages: Home (calculator), About, Contact, Privacy

**State Management**: React hooks with localStorage persistence
- Calculator inputs and unit preferences saved to localStorage
- No global state management library needed for this simple application

**Styling Approach**: Tailwind CSS with custom design tokens
- Industrial Logistics theme with dark mode as default
- Custom color palette: Dark slate background (#0f172a), Safety orange accent (#f59e0b)
- Typography: Roboto for UI, Roboto Mono for numbers/data display

### Core Calculation Logic

The application implements the NMFC density-to-class mapping algorithm:

1. **Input Collection**: Dimensions (L×W×H), weight, unit system (Imperial/Metric), and palletized status
2. **Unit Conversion**: Converts metric inputs (cm/kg) to imperial (inches/lbs) for standardized calculation
3. **Volume Calculation**: (Length × Width × Height) / 1728 = cubic feet
4. **Density Calculation**: Weight (lbs) / Volume (cubic feet) = PCF (Pounds per Cubic Foot)
5. **Class Determination**: Maps density to freight class using complete 18-class NMFC standard (Class 50 to Class 500)

**Design Pattern**: Pure function calculations with React state hooks for UI updates. All computation happens client-side with no server dependencies.

### Mobile-First Responsive Design

**Layout Strategy**:
- Desktop: Two-column layout (Calculator | Reference Table)
- Mobile: Single-column stack with full-width components
- Touch-friendly inputs with minimum 44px tap targets for warehouse use
- Large, high-contrast input fields optimized for warehouse visibility

**Breakpoint**: 768px (uses custom `useIsMobile` hook)

### Backend Architecture

**Express Server**: Minimal Node.js/Express backend serving the static React build
- Development: Vite dev server with HMR
- Production: Serves pre-built static assets from `/dist/public`

**Database Setup**: Drizzle ORM configured with PostgreSQL
- Currently uses in-memory storage for user data (MemStorage class)
- Database schema defined but not actively used by the calculator
- Neon serverless PostgreSQL configured for future features

**Note**: The core calculator functionality is entirely client-side and does not require database or API calls. The backend infrastructure exists for potential future features (user accounts, saved calculations, etc.).

### Data Persistence

**localStorage Strategy**:
- Persists unit preference (Imperial vs Metric)
- Saves last calculator input values for convenience
- Key: `"freightClassPro"`

### Form Validation

Uses React Hook Form with Zod schemas (infrastructure present via dependencies) though the current implementation uses simpler controlled inputs for the calculator form.

## External Dependencies

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives (@radix-ui/react-*)
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Component collection built on Radix (local copies in `/client/src/components/ui`)

### Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe variant management for components
- **clsx + tailwind-merge**: Utility for merging Tailwind classes

### State Management & Data Fetching
- **TanStack Query (React Query)**: Client-side data fetching and caching (configured but not actively used)
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Database & ORM
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- Database configured but not required for core calculator functionality

### Development Tools
- **Vite**: Build tool and dev server with HMR
- **TypeScript**: Type safety across the codebase
- **esbuild**: Fast JavaScript bundler for production builds

### Routing
- **Wouter**: Lightweight React router (~1.2KB)

### Additional Libraries
- **jsPDF**: Client-side PDF generation for single and multi-load export
- **date-fns**: Date manipulation utilities (available but not actively used in calculator)
- **cmdk**: Command palette component (available via shadcn/ui)
- **embla-carousel-react**: Carousel component library

### NMFC Freight Class Table (13-Tier Density-Based System)
The calculator uses the NMFC 13-tier density-based classification system effective July 2025. This system applies to standard commodities where density is the primary classification factor.

| Density (PCF) | Class |
|---------------|-------|
| Less than 1 | 400 |
| 1 to <2 | 300 |
| 2 to <4 | 250 |
| 4 to <6 | 175 |
| 6 to <8 | 125 |
| 8 to <10 | 100 |
| 10 to <12 | 92.5 |
| 12 to <15 | 85 |
| 15 to <22.5 | 70 |
| 22.5 to <30 | 65 |
| 30 to <35 | 60 |
| 35 to <50 | 55 |
| 50+ | 50 |

### Key Features
- **Quick Templates**: Pre-configured commodity templates (Electronics, Furniture, Machinery, Textiles)
- **Multi-Load Tracking**: Save multiple calculations with custom names
- **PDF Export**: Single calculation or consolidated multi-load reports with custom filenames
- **Unit Toggle**: Switch between Imperial (in/lbs) and Metric (cm/kg)
- **Palletized Mode**: Adjusted calculations for palletized freight

### Build Configuration
- Path aliases configured: `@/` → `client/src/`, `@shared/` → `shared/`
- ESModules format throughout the application
- Separate dev and production server entry points