# Pelnora MLM Platform

## Overview

Pelnora is a Multi-Level Marketing (MLM) platform built with modern web technologies. The application features a comprehensive binary tree structure for tracking referrals, automated earnings calculations, and a complete admin panel for system management. The platform supports package-based membership with real-time income distribution across multiple levels.

## System Architecture

The application follows a full-stack architecture with:

- **Frontend**: React-based SPA built with Vite
- **Backend**: Express.js server with RESTful API design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions for authentication
- **Deployment**: Multiple deployment strategies (traditional server, Docker, cPanel)

## Key Components

### Authentication System
- Role-based access control (admin/user)
- Secure password hashing with bcryptjs
- Session-based authentication with express-session
- Admin panel with comprehensive user management

### MLM Business Logic
- **Binary Tree Structure**: 2:1 or 1:2 matching system with carry-forward functionality
- **Level Income System**: 20-level deep commission structure with unlocking mechanism
- **Package System**: Multiple package types (Diamond: ₹10,000/month, etc.)
- **Real-time Earnings**: Immediate calculation and distribution when new members join

### Database Schema
- **Users**: Core user information, referral tracking, team counts
- **Packages**: Package ownership and payment tracking
- **Earnings**: Detailed earnings records with type classification
- **Binary Structure**: Tree relationship management
- **EMI Payments**: Payment tracking system
- **Withdrawals**: Withdrawal request management

### API Architecture
- RESTful endpoints for all major operations
- Comprehensive admin APIs for system management
- Real-time calculation endpoints for business logic
- Health check endpoints for monitoring

## Data Flow

### User Registration Flow
1. User registers with referral code
2. Binary tree position automatically assigned (left/right)
3. Package selection and activation
4. Immediate earnings calculation for upline members
5. Team count updates propagated through the tree

### Earnings Calculation Flow
1. **Direct Income**: 5% of package amount to direct referrer
2. **Level Income**: Percentage-based distribution across 20 levels
3. **Binary Income**: 5% of weaker side volume when matching criteria met
4. **Carry Forward**: Unmatched binary volumes stored for future calculations

### Admin Management Flow
- Comprehensive user and package management
- Real-time system monitoring and diagnostics
- Manual earnings recalculation capabilities
- System health monitoring endpoints

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL with Drizzle ORM
- **Runtime**: Node.js 18+
- **Framework**: Express.js with CORS support
- **Authentication**: bcryptjs for password hashing
- **Session Management**: express-session

### Development Tools
- **Build System**: Vite for frontend bundling
- **TypeScript**: Type safety across the application
- **Process Management**: PM2 for production deployment

### Database Providers
- Local PostgreSQL for development
- Neon Database support for cloud deployment
- MySQL fallback for cPanel shared hosting

## Deployment Strategy

### Multi-Environment Support
1. **Development**: Local PostgreSQL with hot reloading
2. **Production Server**: Traditional Linux server with PM2
3. **Cloud Deployment**: Docker containers with health checks
4. **Shared Hosting**: cPanel-optimized MySQL version

### Deployment Methods
- **Automated Deployment**: Shell scripts with version control
- **Docker Deployment**: Multi-stage builds with nginx reverse proxy
- **cPanel Deployment**: Simplified package for shared hosting
- **CI/CD**: GitHub Actions integration for automated deployments

### Infrastructure Components
- **Load Balancing**: Nginx reverse proxy configuration
- **Process Management**: PM2 ecosystem for clustering
- **Health Monitoring**: Comprehensive health check endpoints
- **Backup Strategy**: Database migration and rollback capabilities

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 18, 2025. Initial setup