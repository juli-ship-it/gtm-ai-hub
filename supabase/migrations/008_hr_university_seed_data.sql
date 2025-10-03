-- HR University Seed Data
-- This migration populates the HR University with initial modules and lessons

-- Insert HR Modules
insert into hr_module (slug, title, description, status, ethics_required, estimated_hours, difficulty) values
('foundations-responsible-ai', 'Foundations of Responsible AI in HR', 'Master the ethical foundations of AI in HR, including bias detection, fairness principles, and responsible implementation strategies.', 'published', true, 2, 'beginner'),
('ai-recruiting-talent', 'AI for Recruiting & Talent Acquisition', 'Learn to leverage AI tools for sourcing, screening, and interviewing candidates while maintaining human-centered practices.', 'published', true, 3, 'intermediate'),
('employee-engagement-feedback', 'Employee Engagement & Feedback', 'Use AI to analyze engagement data, predict turnover risk, and create personalized development plans.', 'published', true, 2, 'intermediate'),
('performance-growth', 'Performance & Growth', 'Implement AI-driven performance management, goal setting, and career development strategies.', 'published', true, 2, 'intermediate'),
('compensation-fairness', 'Compensation & Fairness', 'Ensure pay equity and fair compensation practices using AI analytics and bias detection tools.', 'published', true, 2, 'advanced');

-- Insert HR Lessons for Module 1: Foundations of Responsible AI
insert into hr_lesson (module_id, slug, title, content_md, quiz, order_num, estimated_minutes) 
select 
  m.id,
  'ai-ethics-principles',
  'AI Ethics Principles in HR',
  '# AI Ethics Principles in HR

## Learning Objectives
By the end of this lesson, you will understand:
- Core ethical principles for AI in HR
- Common bias patterns in AI systems
- How to implement fairness checks
- Legal and compliance considerations

## Key Concepts

### 1. The Four Pillars of AI Ethics in HR

**Fairness**: AI systems should not discriminate based on protected characteristics
**Transparency**: Decision-making processes should be explainable
**Accountability**: Clear responsibility for AI-driven decisions
**Privacy**: Protecting employee data and maintaining confidentiality

### 2. Common Bias Patterns

- **Historical Bias**: Past discriminatory practices reflected in training data
- **Representation Bias**: Underrepresented groups in training datasets
- **Measurement Bias**: Inaccurate or incomplete metrics
- **Aggregation Bias**: One-size-fits-all approaches ignoring individual differences

### 3. Practical Implementation

- Regular bias audits of AI systems
- Diverse training data collection
- Human oversight and review processes
- Continuous monitoring and adjustment

## Exercise
Review your current HR processes and identify potential bias points where AI could help or harm fairness.',
  '[{"question": "What is the primary goal of fairness in AI ethics for HR?", "options": ["Speed up hiring decisions", "Ensure AI systems do not discriminate based on protected characteristics", "Reduce costs", "Automate all HR processes"], "correct_index": 1}, {"question": "Which type of bias occurs when past discriminatory practices are reflected in training data?", "options": ["Representation bias", "Historical bias", "Measurement bias", "Aggregation bias"], "correct_index": 1}, {"question": "What should be the first step when implementing AI in HR processes?", "options": ["Deploy immediately", "Conduct a bias audit", "Train all staff", "Update policies"], "correct_index": 1}]',
  1,
  45
from hr_module m where m.slug = 'foundations-responsible-ai';

insert into hr_lesson (module_id, slug, title, content_md, quiz, order_num, estimated_minutes)
select 
  m.id,
  'bias-detection-mitigation',
  'Bias Detection & Mitigation Strategies',
  '# Bias Detection & Mitigation Strategies

## Learning Objectives
- Identify different types of bias in AI systems
- Learn practical bias detection techniques
- Implement mitigation strategies
- Create monitoring frameworks

## Types of Bias in HR AI

### 1. Algorithmic Bias
- **Definition**: Systematic and unfair discrimination in algorithmic decision-making
- **Examples**: Resume screening tools favoring certain universities
- **Detection**: Statistical parity analysis across demographic groups

### 2. Data Bias
- **Definition**: Biases present in training data
- **Examples**: Historical hiring data reflecting past discrimination
- **Detection**: Data diversity audits and representativeness checks

### 3. Interaction Bias
- **Definition**: How users interact with AI systems differently
- **Examples**: Different completion rates for online assessments
- **Detection**: User behavior analysis and completion rate monitoring

## Mitigation Strategies

### Technical Approaches
- **Fairness Constraints**: Mathematical constraints ensuring equal treatment
- **Adversarial Debiasing**: Training models to be robust against bias
- **Data Augmentation**: Increasing representation of underrepresented groups

### Process Approaches
- **Human-in-the-Loop**: Regular human review of AI decisions
- **Explainable AI**: Making AI decisions interpretable
- **Regular Auditing**: Ongoing monitoring and adjustment

## Practical Exercise
Design a bias audit checklist for your AI-powered resume screening tool.',
  '[{"question": "What is algorithmic bias?", "options": ["A type of computer error", "Systematic and unfair discrimination in algorithmic decision-making", "A programming mistake", "A data storage issue"], "correct_index": 1}, {"question": "Which mitigation strategy involves regular human review of AI decisions?", "options": ["Fairness constraints", "Human-in-the-Loop", "Data augmentation", "Adversarial debiasing"], "correct_index": 1}, {"question": "What should be included in a bias audit checklist?", "options": ["Only technical metrics", "Statistical parity analysis, data diversity checks, and human review processes", "Only user feedback", "Only system performance"], "correct_index": 1}]',
  2,
  40
from hr_module m where m.slug = 'foundations-responsible-ai';

-- Insert HR Lessons for Module 2: AI for Recruiting & Talent Acquisition
insert into hr_lesson (module_id, slug, title, content_md, quiz, order_num, estimated_minutes)
select 
  m.id,
  'ai-sourcing-strategies',
  'AI-Powered Sourcing Strategies',
  '# AI-Powered Sourcing Strategies

## Learning Objectives
- Master AI tools for candidate sourcing
- Learn to write effective AI prompts for talent search
- Understand passive vs. active candidate engagement
- Implement diversity-focused sourcing strategies

## AI Sourcing Tools Overview

### 1. LinkedIn Recruiter with AI
- **Smart Search**: AI-powered candidate matching
- **InMail Optimization**: AI-suggested message personalization
- **Talent Insights**: Market intelligence and trends

### 2. Boolean Search Enhancement
- **AI Query Builder**: Natural language to Boolean conversion
- **Skill Synonym Mapping**: Finding candidates with equivalent skills
- **Location Intelligence**: Identifying talent in unexpected locations

### 3. Resume Database Mining
- **Semantic Search**: Finding candidates by meaning, not just keywords
- **Skill Extraction**: Automatically identifying relevant skills
- **Experience Matching**: Understanding career progression patterns

## Best Practices

### Writing Effective AI Prompts
```
Instead of: "Find software engineers"
Try: "Find senior software engineers with 5+ years experience in React and Node.js, located in San Francisco Bay Area, who have worked at startups and have open source contributions"
```

### Diversity-Focused Sourcing
- Use AI to identify diverse talent pools
- Avoid bias in search criteria
- Focus on skills and potential over pedigree

## Exercise
Create an AI sourcing strategy for a specific role in your organization.',
  '[{"question": "What is the benefit of using semantic search in resume databases?", "options": ["Faster search speed", "Finding candidates by meaning, not just keywords", "Lower cost", "Better user interface"], "correct_index": 1}, {"question": "What should you include in an effective AI sourcing prompt?", "options": ["Only job title", "Specific skills, experience level, location, and relevant background", "Only company names", "Only education requirements"], "correct_index": 1}, {"question": "How can AI help with diversity-focused sourcing?", "options": ["By excluding certain groups", "By identifying diverse talent pools and avoiding bias in search criteria", "By only searching specific universities", "By focusing only on referrals"], "correct_index": 1}]',
  1,
  50
from hr_module m where m.slug = 'ai-recruiting-talent';

-- Insert HR Lessons for Module 3: Employee Engagement & Feedback
insert into hr_lesson (module_id, slug, title, content_md, quiz, order_num, estimated_minutes)
select 
  m.id,
  'engagement-analytics',
  'AI-Driven Engagement Analytics',
  '# AI-Driven Engagement Analytics

## Learning Objectives
- Understand engagement metrics and KPIs
- Learn to interpret AI-generated insights
- Implement predictive engagement models
- Create action plans based on data

## Key Engagement Metrics

### 1. Quantitative Metrics
- **eNPS (Employee Net Promoter Score)**: Likelihood to recommend workplace
- **Turnover Rate**: Percentage of employees leaving
- **Absenteeism Rate**: Unplanned time off
- **Productivity Metrics**: Output per employee

### 2. Qualitative Indicators
- **Sentiment Analysis**: AI analysis of employee communications
- **Meeting Participation**: Engagement in team meetings
- **Learning & Development**: Participation in training programs
- **Peer Recognition**: Internal recognition and feedback

## AI Analytics Tools

### 1. Survey Analysis
- **Sentiment Analysis**: Understanding emotional tone in responses
- **Topic Modeling**: Identifying common themes and concerns
- **Trend Analysis**: Tracking changes over time
- **Predictive Modeling**: Forecasting future engagement levels

### 2. Communication Analysis
- **Email Sentiment**: Analyzing tone in internal communications
- **Slack/Teams Analysis**: Understanding team dynamics
- **Meeting Transcripts**: Extracting insights from recorded meetings

## Implementation Strategy

### Phase 1: Data Collection
- Implement regular engagement surveys
- Set up communication monitoring (with privacy compliance)
- Track key performance indicators

### Phase 2: Analysis & Insights
- Deploy AI analytics tools
- Generate regular reports
- Identify patterns and trends

### Phase 3: Action Planning
- Create targeted interventions
- Monitor effectiveness
- Iterate and improve

## Exercise
Design an engagement analytics dashboard for your team.',
  '[{"question": "What does eNPS measure?", "options": ["Employee productivity", "Likelihood to recommend workplace", "Salary satisfaction", "Training completion"], "correct_index": 1}, {"question": "What is the benefit of using AI for sentiment analysis in employee surveys?", "options": ["Reducing survey costs", "Understanding emotional tone in responses at scale", "Eliminating the need for surveys", "Faster survey distribution"], "correct_index": 1}, {"question": "What should be included in an engagement analytics dashboard?", "options": ["Only financial metrics", "eNPS, turnover rate, sentiment analysis, and trend data", "Only personal information", "Only external data"], "correct_index": 1}]',
  1,
  45
from hr_module m where m.slug = 'employee-engagement-feedback';

-- Insert HR Lessons for Module 4: Performance & Growth
insert into hr_lesson (module_id, slug, title, content_md, quiz, order_num, estimated_minutes)
select 
  m.id,
  'ai-performance-management',
  'AI-Enhanced Performance Management',
  '# AI-Enhanced Performance Management

## Learning Objectives
- Understand AI applications in performance management
- Learn to set SMART goals with AI assistance
- Implement continuous feedback systems
- Create personalized development plans

## AI in Performance Management

### 1. Goal Setting & Tracking
- **SMART Goal Generation**: AI-assisted goal creation
- **Progress Monitoring**: Automated tracking and alerts
- **Milestone Recognition**: Celebrating achievements
- **Adjustment Recommendations**: Suggesting goal modifications

### 2. Feedback Analysis
- **360-Degree Feedback Processing**: Analyzing multi-source feedback
- **Sentiment Analysis**: Understanding feedback tone and intent
- **Pattern Recognition**: Identifying recurring themes
- **Action Item Extraction**: Converting feedback to actionable steps

### 3. Development Planning
- **Skill Gap Analysis**: Identifying areas for improvement
- **Learning Path Recommendations**: Personalized development plans
- **Mentor Matching**: Connecting employees with appropriate mentors
- **Career Progression Planning**: AI-guided career development

## Implementation Framework

### Phase 1: Data Integration
- Connect performance data sources
- Implement feedback collection systems
- Set up goal tracking mechanisms

### Phase 2: AI Deployment
- Deploy analytics tools
- Train managers on AI insights
- Establish feedback loops

### Phase 3: Continuous Improvement
- Monitor AI effectiveness
- Refine algorithms based on outcomes
- Scale successful practices

## Best Practices

### For Managers
- Use AI insights to inform, not replace, human judgment
- Maintain regular one-on-one conversations
- Focus on development over evaluation
- Ensure transparency in AI-assisted decisions

### For Employees
- Engage actively with AI tools
- Provide feedback on AI recommendations
- Use insights for self-development
- Maintain ownership of career growth

## Exercise
Design an AI-enhanced performance review process for your team.',
  '[{"question": "What is the primary benefit of AI in goal setting?", "options": ["Eliminating human input", "AI-assisted goal creation and automated tracking", "Reducing goal complexity", "Making all goals the same"], "correct_index": 1}, {"question": "How should managers use AI insights in performance management?", "options": ["Replace all human judgment", "Use AI insights to inform, not replace, human judgment", "Ignore AI recommendations", "Only use AI for negative feedback"], "correct_index": 1}, {"question": "What should be included in an AI-enhanced performance review process?", "options": ["Only AI-generated feedback", "AI insights, human judgment, regular conversations, and development focus", "Only automated scoring", "Only historical data"], "correct_index": 1}]',
  1,
  50
from hr_module m where m.slug = 'performance-growth';

-- Insert HR Lessons for Module 5: Compensation & Fairness
insert into hr_lesson (module_id, slug, title, content_md, quiz, order_num, estimated_minutes)
select 
  m.id,
  'pay-equity-analysis',
  'AI-Powered Pay Equity Analysis',
  '# AI-Powered Pay Equity Analysis

## Learning Objectives
- Understand pay equity principles and legal requirements
- Learn to use AI for compensation analysis
- Implement bias detection in pay decisions
- Create fair compensation frameworks

## Pay Equity Fundamentals

### 1. Legal Framework
- **Equal Pay Act**: Federal law requiring equal pay for equal work
- **State Laws**: Additional protections in various states
- **Protected Classes**: Gender, race, age, disability, etc.
- **Comparable Worth**: Equal pay for work of equal value

### 2. Key Concepts
- **Pay Gap**: Difference in average pay between groups
- **Pay Compression**: Minimal differences between experience levels
- **Pay Transparency**: Open communication about compensation
- **Market Analysis**: Understanding competitive pay rates

## AI Tools for Pay Equity

### 1. Statistical Analysis
- **Regression Analysis**: Identifying unexplained pay differences
- **Anomaly Detection**: Finding outliers in compensation data
- **Cohort Analysis**: Comparing similar employee groups
- **Trend Analysis**: Tracking pay equity over time

### 2. Bias Detection
- **Algorithmic Auditing**: Checking for bias in pay algorithms
- **Demographic Analysis**: Ensuring fair treatment across groups
- **Experience Adjustment**: Accounting for legitimate pay factors
- **Performance Correlation**: Linking pay to objective metrics

## Implementation Process

### Phase 1: Data Preparation
- Collect comprehensive compensation data
- Ensure data quality and completeness
- Protect employee privacy and confidentiality
- Establish data governance protocols

### Phase 2: Analysis
- Run statistical analyses
- Identify potential inequities
- Account for legitimate factors
- Document findings and methodology

### Phase 3: Remediation
- Address identified inequities
- Implement corrective measures
- Establish ongoing monitoring
- Communicate changes transparently

## Best Practices

### Data Management
- Maintain detailed records
- Ensure data accuracy
- Protect employee privacy
- Regular data updates

### Analysis Approach
- Use multiple analytical methods
- Account for all relevant factors
- Consider external market data
- Document assumptions and limitations

### Communication
- Be transparent about process
- Address concerns proactively
- Provide clear explanations
- Maintain confidentiality

## Exercise
Design a pay equity analysis framework for your organization.',
  '[{"question": "What is the primary purpose of pay equity analysis?", "options": ["Reduce all salaries", "Ensure equal pay for equal work across all groups", "Increase executive pay", "Eliminate bonuses"], "correct_index": 1}, {"question": "What should be included in a comprehensive pay equity analysis?", "options": ["Only current salaries", "Statistical analysis, bias detection, demographic analysis, and market data", "Only gender data", "Only executive compensation"], "correct_index": 1}, {"question": "How should organizations communicate pay equity findings?", "options": ["Keep all findings secret", "Be transparent about process while maintaining confidentiality", "Only share with executives", "Publish all individual salaries"], "correct_index": 1}]',
  1,
  55
from hr_module m where m.slug = 'compensation-fairness';
