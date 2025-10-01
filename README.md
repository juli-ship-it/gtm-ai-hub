# GTM AI Hub

A modern, Workleap-inspired web application that centralizes AI templates, GTM playbooks, intake, run history, and metrics. Built with Next.js 14, TypeScript, and Supabase.

## 🎨 Design Philosophy

This application follows Workleap's clean, modern, and friendly aesthetic:
- **Clean**: Generous whitespace, clear hierarchy, minimalist design
- **Modern**: Rounded corners (xl/2xl), soft shadows, contemporary typography
- **Friendly**: Hand-drawn elements, approachable microcopy, warm color palette

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (preferred) or npm
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd gtm-ai-hub
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Set up Supabase database:**
   ```bash
   # Run migrations
   pnpm db:migrate
   
   # Seed with sample data
   pnpm db:seed
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router, RSC)
- **Language**: TypeScript
- **UI**: TailwindCSS + shadcn/ui + Lucide React
- **State**: Server Actions + React Query
- **Auth**: Supabase Auth with RLS
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage
- **Orchestration**: n8n integration
- **Testing**: Vitest + React Testing Library

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages
│   ├── admin/             # Admin dashboard
│   ├── intake/            # Intake management
│   ├── playbooks/         # Playbook management
│   ├── prompts/           # Prompt library
│   ├── runs/              # Run history
│   └── templates/         # Template catalog
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and integrations
│   ├── integrations/     # External service clients
│   └── supabase/         # Database client
├── scripts/              # Database scripts
├── supabase/             # Database migrations
└── types/                # TypeScript definitions
```

## 🎯 Core Features

### 1. Template Catalog
- Browse AI-powered automation templates
- Filter by category (content, reporting, intake, governance)
- Run templates with custom inputs
- Track run history and performance

### 2. Playbook Management
- Create multi-step automation workflows
- Include human checkpoints and approvals
- Track KPIs and performance metrics
- Pause and resume execution

### 3. Intake System
- Submit automation requests via Jira/Slack
- Track request status and priority
- Add comments and collaborate
- Ethics and compliance considerations

### 4. Prompt Library
- Version-controlled prompt templates
- Role-based prompt categories
- Tagging and search functionality
- A/B testing capabilities

### 5. Run History & Analytics
- Comprehensive run tracking
- Performance metrics and KPIs
- Error logging and debugging
- Export capabilities

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `N8N_BASIC_USER` | n8n basic auth username | No |
| `N8N_BASIC_PASS` | n8n basic auth password | No |
| `HUBSPOT_CLIENT_ID` | HubSpot OAuth client ID | No |
| `HUBSPOT_CLIENT_SECRET` | HubSpot OAuth client secret | No |
| `GA4_SA_CLIENT_EMAIL` | Google Analytics service account email | No |
| `GA4_SA_PRIVATE_KEY` | Google Analytics private key | No |
| `SNOWFLAKE_ACCOUNT` | Snowflake account identifier | No |
| `SNOWFLAKE_USER` | Snowflake username | No |
| `SNOWFLAKE_PRIVATE_KEY` | Snowflake private key | No |

### Mock Mode

When external service credentials are not provided, the application runs in mock mode with realistic sample data. This allows for full development and testing without external dependencies.

## 🗄️ Database Schema

### Core Tables

- **`app_user`**: User profiles and roles
- **`template`**: Automation templates with JSON schemas
- **`template_run`**: Execution history and artifacts
- **`intake_request`**: Automation requests and status
- **`prompt`**: Versioned prompt templates
- **`playbook`**: Multi-step automation workflows
- **`intake_comment`**: Collaboration on intake requests

### Row Level Security (RLS)

All tables have RLS enabled with role-based access:
- **Runners**: Can execute templates and view own runs
- **Editors**: Can create/edit templates, prompts, playbooks
- **Admins**: Full access to all resources and user management

## 🎨 Design System

### Color Palette

```css
--wl-bg: #F8FAFC;        /* Light background */
--wl-card: #FFFFFF;       /* Card background */
--wl-accent: #4F46E5;     /* Primary accent */
--wl-accent-2: #22C55E;   /* Secondary accent */
--wl-text: #0F172A;       /* Primary text */
--wl-muted: #64748B;      /* Muted text */
```

### Typography

- **Primary**: Inter (sans-serif)
- **Display**: Inter (sans-serif)
- **Hand-drawn**: Script fonts for accents

### Components

- **Cards**: Rounded corners (xl/2xl), soft shadows
- **Buttons**: Rounded corners, focus rings, hover states
- **Inputs**: Clean borders, focus states, validation
- **Badges**: Rounded, color-coded status indicators

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## 📦 Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with sample data
pnpm db:reset         # Reset database (development only)

# Testing
pnpm test             # Run tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage
```

## 🔌 Integrations

### Supported Services

- **n8n**: Workflow orchestration
- **HubSpot**: CRM and marketing automation
- **Google Analytics 4**: Web analytics
- **Snowflake**: Data warehouse
- **DataForSEO**: SEO research
- **Slack**: Team communication
- **Jira**: Issue tracking
- **Webflow**: CMS management

### Adding New Integrations

1. Create client in `lib/integrations/`
2. Implement mock and real versions
3. Add environment variables to `env.example`
4. Update documentation

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Workleap's design principles