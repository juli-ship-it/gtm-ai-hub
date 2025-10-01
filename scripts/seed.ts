import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  try {
    // Create a test user
    const { data: user, error: userError } = await supabase
      .from('app_user')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'juliana@workleap.com',
        role: 'admin'
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return
    }

    console.log('✅ Created test user')

    // Seed templates
    const templates = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        slug: 'youtube-to-blog-seo',
        name: 'YouTube → Blog (SEO)',
        category: 'content',
        version: 'v1.2',
        description: 'Convert YouTube videos into SEO-optimized blog posts with keyword research and meta descriptions',
        inputs: {
          type: 'object',
          properties: {
            youtube_url: {
              type: 'string',
              title: 'YouTube URL',
              description: 'The URL of the YouTube video to convert'
            },
            persona: {
              type: 'string',
              title: 'Target Persona',
              description: 'The target audience persona',
              enum: ['B2B Marketer', 'Content Creator', 'SaaS Founder', 'E-commerce Manager']
            },
            target_keywords: {
              type: 'array',
              title: 'Target Keywords',
              description: 'Keywords to optimize for',
              items: { type: 'string' }
            },
            locale: {
              type: 'string',
              title: 'Locale',
              description: 'Target locale for content',
              enum: ['en-US', 'en-GB', 'en-CA', 'fr-FR', 'es-ES']
            }
          },
          required: ['youtube_url', 'persona', 'target_keywords']
        },
        outputs: {
          type: 'object',
          properties: {
            blog_post: {
              type: 'string',
              title: 'Blog Post Content'
            },
            meta_description: {
              type: 'string',
              title: 'Meta Description'
            },
            suggested_tags: {
              type: 'array',
              title: 'Suggested Tags',
              items: { type: 'string' }
            }
          }
        },
        n8n_webhook_url: 'https://n8n.workleap.com/webhook/youtube-to-blog',
        enabled: true,
        requires_approval: false,
        created_by: user.id
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        slug: 'blog-to-linkedin',
        name: 'Blog → LinkedIn',
        category: 'content',
        version: 'v1.0',
        description: 'Transform blog posts into engaging LinkedIn content with professional tone and hashtags',
        inputs: {
          type: 'object',
          properties: {
            blog_url: {
              type: 'string',
              title: 'Blog Post URL',
              description: 'The URL of the blog post to convert'
            },
            goal: {
              type: 'string',
              title: 'Content Goal',
              description: 'The goal of the LinkedIn post',
              enum: ['Engagement', 'Lead Generation', 'Thought Leadership', 'Brand Awareness']
            },
            audience: {
              type: 'string',
              title: 'Target Audience',
              description: 'The target LinkedIn audience',
              enum: ['B2B Professionals', 'Marketing Teams', 'Sales Teams', 'C-Level Executives']
            }
          },
          required: ['blog_url', 'goal', 'audience']
        },
        outputs: {
          type: 'object',
          properties: {
            linkedin_post: {
              type: 'string',
              title: 'LinkedIn Post Content'
            },
            hashtags: {
              type: 'array',
              title: 'Suggested Hashtags',
              items: { type: 'string' }
            },
            optimal_timing: {
              type: 'string',
              title: 'Optimal Posting Time'
            }
          }
        },
        n8n_webhook_url: 'https://n8n.workleap.com/webhook/blog-to-linkedin',
        enabled: true,
        requires_approval: false,
        created_by: user.id
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        slug: 'webinar-to-nurture',
        name: 'Webinar → Nurture Campaign',
        category: 'content',
        version: 'v1.1',
        description: 'Create email nurture sequences from webinar content with personalized follow-ups',
        inputs: {
          type: 'object',
          properties: {
            webinar_id: {
              type: 'string',
              title: 'Webinar ID',
              description: 'The ID of the webinar to convert'
            },
            persona: {
              type: 'string',
              title: 'Target Persona',
              description: 'The target audience persona',
              enum: ['B2B Marketer', 'Content Creator', 'SaaS Founder', 'E-commerce Manager']
            },
            segment: {
              type: 'string',
              title: 'Audience Segment',
              description: 'The specific audience segment',
              enum: ['New Leads', 'Existing Customers', 'Trial Users', 'Churned Customers']
            }
          },
          required: ['webinar_id', 'persona', 'segment']
        },
        outputs: {
          type: 'object',
          properties: {
            email_sequence: {
              type: 'array',
              title: 'Email Sequence',
              items: {
                type: 'object',
                properties: {
                  subject: { type: 'string' },
                  content: { type: 'string' },
                  send_delay: { type: 'number' }
                }
              }
            },
            campaign_name: {
              type: 'string',
              title: 'Campaign Name'
            }
          }
        },
        n8n_webhook_url: 'https://n8n.workleap.com/webhook/webinar-to-nurture',
        enabled: true,
        requires_approval: true,
        created_by: user.id
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        slug: 'weekly-campaign-report',
        name: 'Weekly Campaign Report',
        category: 'reporting',
        version: 'v2.0',
        description: 'Generate comprehensive weekly campaign performance reports with insights and recommendations',
        inputs: {
          type: 'object',
          properties: {
            date_range: {
              type: 'object',
              title: 'Date Range',
              properties: {
                start_date: { type: 'string', format: 'date' },
                end_date: { type: 'string', format: 'date' }
              },
              required: ['start_date', 'end_date']
            },
            channels: {
              type: 'array',
              title: 'Channels',
              description: 'Marketing channels to include in the report',
              items: {
                type: 'string',
                enum: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Email', 'Organic', 'Direct']
              }
            }
          },
          required: ['date_range', 'channels']
        },
        outputs: {
          type: 'object',
          properties: {
            report_url: {
              type: 'string',
              title: 'Report URL'
            },
            summary: {
              type: 'string',
              title: 'Executive Summary'
            },
            recommendations: {
              type: 'array',
              title: 'Recommendations',
              items: { type: 'string' }
            }
          }
        },
        n8n_webhook_url: 'https://n8n.workleap.com/webhook/weekly-report',
        enabled: true,
        requires_approval: false,
        created_by: user.id
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        slug: 'daily-spend-alerts',
        name: 'Daily Spend & CPA Alerts',
        category: 'reporting',
        version: 'v1.3',
        description: 'Monitor daily ad spend and cost-per-acquisition with automated alerts and recommendations',
        inputs: {
          type: 'object',
          properties: {
            budgets: {
              type: 'array',
              title: 'Budget Thresholds',
              items: {
                type: 'object',
                properties: {
                  channel: { type: 'string' },
                  daily_budget: { type: 'number' },
                  max_cpa: { type: 'number' }
                }
              }
            },
            thresholds: {
              type: 'object',
              title: 'Alert Thresholds',
              properties: {
                spend_alert_percentage: { type: 'number', minimum: 0, maximum: 100 },
                cpa_alert_percentage: { type: 'number', minimum: 0, maximum: 100 }
              }
            }
          },
          required: ['budgets', 'thresholds']
        },
        outputs: {
          type: 'object',
          properties: {
            alerts: {
              type: 'array',
              title: 'Generated Alerts',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  severity: { type: 'string' }
                }
              }
            },
            recommendations: {
              type: 'array',
              title: 'Recommendations',
              items: { type: 'string' }
            }
          }
        },
        n8n_webhook_url: 'https://n8n.workleap.com/webhook/daily-alerts',
        enabled: true,
        requires_approval: false,
        created_by: user.id
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        slug: 'jira-slack-intake',
        name: 'Jira → Slack Intake Bot',
        category: 'intake',
        version: 'v1.0',
        description: 'Automatically create intake requests from Jira tickets and notify teams via Slack',
        inputs: {
          type: 'object',
          properties: {}
        },
        outputs: {
          type: 'object',
          properties: {
            intake_request_id: {
              type: 'string',
              title: 'Intake Request ID'
            },
            slack_message: {
              type: 'string',
              title: 'Slack Notification'
            }
          }
        },
        n8n_webhook_url: 'https://n8n.workleap.com/webhook/jira-intake',
        enabled: true,
        requires_approval: false,
        created_by: user.id
      }
    ]

    const { error: templatesError } = await supabase
      .from('template')
      .upsert(templates)

    if (templatesError) {
      console.error('Error creating templates:', templatesError)
      return
    }

    console.log('✅ Created templates')

    // Seed playbooks
    const playbooks = [
      {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Webinar → Nurture Campaign',
        description: 'Complete workflow to convert webinar content into a multi-touch email nurture campaign',
        templates_included: [
          '33333333-3333-3333-3333-333333333333', // webinar-to-nurture
          '22222222-2222-2222-2222-222222222222'  // blog-to-linkedin
        ],
        human_steps: [
          {
            title: 'Review Email Copy',
            role: 'Marketing Manager',
            instructions: 'Review and approve the generated email sequence before sending',
            estimated_time: '15 minutes'
          },
          {
            title: 'Configure Email Platform',
            role: 'Marketing Operations',
            instructions: 'Set up the email sequence in the marketing automation platform',
            estimated_time: '30 minutes'
          },
          {
            title: 'Quality Assurance',
            role: 'Marketing Manager',
            instructions: 'Test the email sequence and verify all links and personalization',
            estimated_time: '20 minutes'
          }
        ],
        kpis: {
          target_send_time_hours: 24,
          expected_open_rate: 0.25,
          expected_click_rate: 0.05
        },
        owner: user.id
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        name: 'Content Repurposing',
        description: 'Systematic approach to repurpose content across multiple channels',
        templates_included: [
          '11111111-1111-1111-1111-111111111111', // youtube-to-blog
          '22222222-2222-2222-2222-222222222222'  // blog-to-linkedin
        ],
        human_steps: [
          {
            title: 'Content Strategy Review',
            role: 'Content Manager',
            instructions: 'Review the content strategy and ensure alignment with brand voice',
            estimated_time: '20 minutes'
          },
          {
            title: 'SEO Optimization',
            role: 'SEO Specialist',
            instructions: 'Optimize the content for search engines and add relevant keywords',
            estimated_time: '30 minutes'
          },
          {
            title: 'Final Approval',
            role: 'Marketing Director',
            instructions: 'Final review and approval before publishing',
            estimated_time: '10 minutes'
          }
        ],
        kpis: {
          target_completion_time_hours: 4,
          expected_engagement_increase: 0.15,
          expected_reach_increase: 0.30
        },
        owner: user.id
      }
    ]

    const { error: playbooksError } = await supabase
      .from('playbook')
      .upsert(playbooks)

    if (playbooksError) {
      console.error('Error creating playbooks:', playbooksError)
      return
    }

    console.log('✅ Created playbooks')

    // Seed prompts
    const prompts = [
      {
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Content Writer',
        role: 'writer',
        body: 'You are a skilled content writer specializing in {brand_voice} content for {persona}. Create engaging, informative content that resonates with {audience} and drives {goal}. Always include a clear call-to-action: {cta}.',
        version: 'v1.0',
        tags: ['content', 'writing', 'marketing'],
        created_by: user.id
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Content Editor',
        role: 'editor',
        body: 'You are an expert content editor with a focus on {brand_voice} tone. Review and refine content for {persona} to ensure it is clear, compelling, and aligned with our brand guidelines. Pay special attention to grammar, flow, and the call-to-action: {cta}.',
        version: 'v1.0',
        tags: ['editing', 'review', 'quality'],
        created_by: user.id
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Compliance Checker',
        role: 'compliance',
        body: 'You are a compliance specialist ensuring all content meets legal and regulatory requirements. Review content for {persona} to ensure it complies with industry standards, data protection regulations, and brand guidelines. Flag any potential issues with {cta} or claims.',
        version: 'v1.0',
        tags: ['compliance', 'legal', 'review'],
        created_by: user.id
      }
    ]

    const { error: promptsError } = await supabase
      .from('prompt')
      .upsert(prompts)

    if (promptsError) {
      console.error('Error creating prompts:', promptsError)
      return
    }

    console.log('✅ Created prompts')

    // Seed some sample runs
    const runs = [
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        template_id: '11111111-1111-1111-1111-111111111111',
        triggered_by: user.id,
        input_payload: {
          youtube_url: 'https://youtube.com/watch?v=example',
          persona: 'B2B Marketer',
          target_keywords: ['marketing automation', 'content strategy'],
          locale: 'en-US'
        },
        status: 'succeeded',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        finished_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(), // 2 hours ago + 2 minutes
        logs: 'Successfully converted YouTube video to blog post. Generated 1,200 words with SEO optimization.',
        artifacts: {
          blog_post_id: 'blog_123',
          hubspot_draft_id: 'draft_456',
          word_count: 1200
        }
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        template_id: '44444444-4444-4444-4444-444444444444',
        triggered_by: user.id,
        input_payload: {
          date_range: {
            start_date: '2024-01-08',
            end_date: '2024-01-14'
          },
          channels: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads']
        },
        status: 'running',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        logs: 'Generating weekly campaign report... Analyzing data from 3 channels...'
      }
    ]

    const { error: runsError } = await supabase
      .from('template_run')
      .upsert(runs)

    if (runsError) {
      console.error('Error creating runs:', runsError)
      return
    }

    console.log('✅ Created sample runs')

    // Seed intake requests
    const intakeRequests = [
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        jira_issue_key: 'GTM-123',
        requester: user.id,
        problem_statement: 'We need to automate the creation of case studies from customer interviews',
        automation_idea: 'Create a template that takes interview transcripts and generates structured case studies with quotes and key metrics',
        ethics_considerations: 'Ensure customer consent and data privacy compliance',
        status: 'new',
        priority: 'high'
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        jira_issue_key: 'GTM-124',
        requester: user.id,
        problem_statement: 'Manual social media posting is time-consuming and inconsistent',
        automation_idea: 'Build a system that automatically posts content across LinkedIn, Twitter, and Facebook with platform-specific optimizations',
        ethics_considerations: 'Maintain authentic voice and avoid spam-like behavior',
        status: 'triaged',
        priority: 'medium'
      }
    ]

    const { error: intakeError } = await supabase
      .from('intake_request')
      .upsert(intakeRequests)

    if (intakeError) {
      console.error('Error creating intake requests:', intakeError)
      return
    }

    console.log('✅ Created intake requests')

    console.log('🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log('  - 1 user created')
    console.log('  - 6 templates created')
    console.log('  - 2 playbooks created')
    console.log('  - 3 prompts created')
    console.log('  - 2 sample runs created')
    console.log('  - 2 intake requests created')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
