# Arkah Energy ERP System

## Overview

This is a comprehensive Enterprise Resource Planning (ERP) system designed specifically for Arkah Energy, a solar energy company. The application manages the complete business lifecycle from lead generation through project completion, including purchasing, finance, and operations management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo architecture with a clear separation between client and server code, utilizing modern web technologies for scalability and maintainability.

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Development**: ESM modules, hot module replacement via Vite

## Key Components

### Frontend Architecture
- **Component Library**: Custom implementation using Radix UI primitives with shadcn/ui styling
- **Routing**: Client-side routing with Wouter for single-page application experience
- **State Management**: Server state managed through TanStack Query with optimistic updates
- **Styling**: Utility-first CSS with Tailwind, custom design system with Arkah Energy branding
- **Forms**: Type-safe forms using React Hook Form with Zod schema validation

### Backend Architecture
- **API Design**: RESTful API with Express.js middleware pattern
- **Database Layer**: Drizzle ORM providing type-safe database queries and migrations
- **Authentication**: Session-based authentication (infrastructure present, implementation pending)
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Logging**: Custom logging middleware for API request tracking

### Database Schema
The system manages five core business domains:
- **Users**: Role-based user management (admin, sales, purchasing, finance, operations)
- **Leads**: Complete lead lifecycle from generation to conversion
- **Projects**: Project management with capacity tracking and progress monitoring
- **Vendors & Purchase Orders**: Procurement management with multi-stage approval workflow
- **Invoices**: Financial management with automated invoice generation and tracking
- **Tasks & Activities**: Operational tracking with project timeline management
- **Documents**: File and document management system

## Data Flow

1. **Lead Management**: Leads are captured and tracked through various stages (generation → cold → costing → proposal → negotiations → confirmed/rejected)
2. **Project Conversion**: Confirmed leads are converted to active projects with capacity and timeline tracking
3. **Procurement Process**: Projects generate purchase orders that flow through vendor management and approval workflows
4. **Financial Tracking**: Invoices are generated from projects and purchase orders, with payment and collections tracking
5. **Operations Management**: Tasks and milestones are tracked against projects with progress monitoring

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Performant forms with minimal re-renders

### Development Tools
- **Vite**: Fast development server and build tool with HMR
- **TypeScript**: Static type checking across the entire application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Client Build**: Vite bundles the React application with TypeScript compilation and Tailwind CSS processing
2. **Server Build**: ESBuild bundles the Express server with external dependencies marked as external
3. **Database**: Drizzle handles schema migrations and can push schema changes to production

### Production Configuration
- **Environment Variables**: Database URL configuration required for deployment
- **Static Assets**: Client build output served from Express server in production
- **Process Management**: Single Node.js process serving both API and static assets

### Development Workflow
- **Hot Module Replacement**: Vite provides instant feedback during development
- **Type Safety**: Full TypeScript coverage from database schema to UI components
- **Schema Management**: Database schema changes managed through Drizzle migrations
- **API Development**: Express middleware with logging and error handling for rapid iteration

The architecture prioritizes developer experience with type safety, fast feedback loops, and clear separation of concerns while maintaining production readiness with proper error handling, logging, and deployment strategies.

## Recent Changes
- Enhanced leads section with drag-and-drop functionality using @dnd-kit libraries for intuitive pipeline management
- Made pipeline columns much wider (320px) with horizontal scrolling for better usability
- Fixed drag lag with optimistic updates for instant visual feedback
- Resolved "meteor tail" visual effect by removing rotation animations and improving drag overlay styling
- Fixed drag-and-drop collision issue - leads can now be dropped on existing projects and auto-stack
- Added Design tab between Dashboard and Leads for CAD drawings and system design
- Added O&M tab after Operations for performance monitoring and maintenance scheduling
- Removed experimental pipeline interfaces (solar, gesture, timeline) to focus on core drag-and-drop functionality
- Added visual pipeline view with dynamic pipe heights that scale based on lead count per stage
- Created tabbed interface in Leads section: Visual Pipeline and Drag & Drop Board
- Pipeline visualization highlights bottlenecks and conversion rates with color-coded stages
- Added hover tooltips to pipeline segments showing project details (name, capacity, contact person, value)