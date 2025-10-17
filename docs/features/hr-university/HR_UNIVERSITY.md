# AI in HR University

A comprehensive learning platform integrated into the GTM Hub that provides AI-powered HR training modules, progress tracking, and certification.

## Overview

The HR University is a dedicated section within the GTM Hub that offers:

- **Self-paced learning modules** covering AI applications in HR
- **Interactive lessons** with quizzes and hands-on exercises
- **Progress tracking** and completion certificates
- **Feedback system** for continuous improvement
- **Intake system** for requesting new modules
- **Analytics dashboard** for learning insights

## Features

### 🎓 Learning Modules

- **Foundations of Responsible AI in HR** - Ethics, bias detection, and responsible implementation
- **AI for Recruiting & Talent Acquisition** - Sourcing, screening, and interviewing with AI
- **Employee Engagement & Feedback** - Analytics, sentiment analysis, and retention strategies
- **Performance & Growth** - AI-enhanced performance management and development
- **Compensation & Fairness** - Pay equity analysis and bias detection

### 📚 Lesson Structure

Each lesson includes:
- **Markdown content** with learning objectives and key concepts
- **Interactive quizzes** with immediate feedback
- **Video content** (placeholder for embedded videos)
- **Hands-on exercises** and practical applications
- **Progress tracking** and completion certificates

### 🏆 Progress & Certification

- **Real-time progress tracking** across modules and lessons
- **Completion badges** for achievements
- **Quiz scoring** with pass/fail thresholds
- **Time tracking** for learning investment
- **Certification system** for module completion

### 📊 Analytics & Reporting

- **Personal dashboard** with learning statistics
- **Module performance** metrics and ratings
- **Completion rates** and time investment
- **Feedback aggregation** and insights
- **Export capabilities** for reporting

### 💡 Intake System

- **Module request form** for new content suggestions
- **Slack integration** for team visibility
- **Triage workflow** for request management
- **Status tracking** from request to delivery

## Technical Architecture

### Database Schema

The HR University uses several new Supabase tables:

- `hr_module` - Learning modules with metadata
- `hr_lesson` - Individual lessons within modules
- `hr_progress` - User progress tracking
- `hr_feedback` - Module ratings and comments
- `hr_intake_request` - New module requests
- `hr_badge` - Achievement badges

### API Integration

- **Supabase Edge Functions** for Slack integration
- **Real-time subscriptions** for progress updates
- **Row Level Security** for data protection
- **Authentication** integrated with existing GTM Hub auth

### UI Components

- **Responsive design** with Workleap branding
- **Interactive elements** for quizzes and progress
- **Accessibility features** for inclusive learning
- **Mobile-optimized** for learning on the go

## Getting Started

### 1. Database Setup

Run the migrations to create the HR University tables:

```bash
npm run db:migrate
```

This will create all necessary tables and seed them with sample data.

### 2. Environment Variables

Ensure your `.env.local` includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Slack Integration (Optional)

To enable Slack notifications for intake requests:

1. Deploy the `slack-hr-intake` Edge Function
2. Configure Slack webhook URLs
3. Update the API route to call the Edge Function

### 4. Access the HR University

Navigate to `/hr-university` in your GTM Hub application.

## Usage

### For Learners

1. **Browse Modules** - Explore available learning content
2. **Start Learning** - Begin with foundational modules
3. **Track Progress** - Monitor completion and scores
4. **Provide Feedback** - Rate modules and suggest improvements
5. **Request Content** - Suggest new modules via intake form

### For Administrators

1. **Monitor Usage** - View analytics and engagement metrics
2. **Manage Content** - Add new modules and lessons
3. **Review Requests** - Triage intake requests
4. **Track Adoption** - Measure learning impact

## Content Management

### Adding New Modules

1. Create module in `hr_module` table
2. Add lessons in `hr_lesson` table
3. Set appropriate difficulty and metadata
4. Publish for learner access

### Creating Lessons

1. Write content in Markdown format
2. Add quiz questions in JSON format
3. Set estimated completion time
4. Order lessons within module

### Quiz Format

Quizzes use JSON format:

```json
[
  {
    "question": "What is the primary goal of fairness in AI ethics?",
    "options": [
      "Speed up hiring decisions",
      "Ensure AI systems do not discriminate",
      "Reduce costs",
      "Automate all HR processes"
    ],
    "correct_index": 1
  }
]
```

## Customization

### Styling

The HR University uses Workleap design tokens and custom CSS classes:

- `.hr-university-card` - Module and lesson cards
- `.hr-university-badge` - Difficulty and status badges
- `.hr-university-progress` - Progress indicators
- `.hr-university-quiz-option` - Quiz answer options

### Branding

Update the design tokens in `globals.css` to match your organization's branding:

```css
:root {
  --wl-accent: #4F46E5;    /* Primary color */
  --wl-accent-2: #22C55E;  /* Secondary color */
  --wl-text: #0F172A;      /* Text color */
  --wl-muted: #64748B;     /* Muted text */
}
```

## Security & Privacy

### Data Protection

- **Row Level Security** ensures users only see their own progress
- **Encrypted data** in transit and at rest
- **Access controls** based on user roles
- **Audit logging** for compliance

### Privacy Considerations

- **Minimal data collection** for learning analytics
- **User consent** for progress tracking
- **Data retention** policies for compliance
- **GDPR compliance** for EU users

## Troubleshooting

### Common Issues

1. **Progress not saving** - Check RLS policies and user authentication
2. **Quiz not submitting** - Verify quiz JSON format and validation
3. **Slack integration failing** - Check Edge Function deployment and credentials
4. **Styling issues** - Ensure Tailwind CSS is properly configured

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG=true
```

## Contributing

### Adding New Features

1. Create feature branch
2. Update database schema if needed
3. Add UI components and pages
4. Update documentation
5. Test thoroughly
6. Submit pull request

### Content Contributions

1. Follow the lesson template format
2. Include learning objectives
3. Add practical exercises
4. Test quiz questions
5. Review for accuracy and clarity

## Roadmap

### Phase 1 (Current)
- ✅ Core learning platform
- ✅ Progress tracking
- ✅ Basic analytics
- ✅ Intake system

### Phase 2 (Planned)
- 🔄 Advanced analytics
- 🔄 Social learning features
- 🔄 Mobile app
- 🔄 Integration with external LMS

### Phase 3 (Future)
- 📋 AI-powered content generation
- 📋 Personalized learning paths
- 📋 Advanced certification system
- 📋 Enterprise features

## Support

For technical support or questions:

1. Check the troubleshooting section
2. Review the documentation
3. Create an issue in the repository
4. Contact the development team

---

**Built with ❤️ for the future of AI-powered HR learning**
