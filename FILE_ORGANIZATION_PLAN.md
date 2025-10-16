# File Organization Plan

## Current State (Root Directory Clutter)
- 41 Markdown documentation files
- 30 SQL migration/debug files
- 19 test-*.js files
- Debug scripts and utilities scattered

## Proposed Structure

```
GTM Hub experiments/
├── docs/                          # 📚 All documentation
│   ├── setup/                     # Setup guides
│   │   ├── SETUP_INSTRUCTIONS.md
│   │   ├── ENVIRONMENT_SETUP.md
│   │   ├── SUPABASE_SETUP.md
│   │   └── VERCEL_DEPLOYMENT.md
│   ├── features/                  # Feature documentation
│   │   ├── authentication/
│   │   │   └── AUTHENTICATION.md
│   │   ├── templates/
│   │   │   ├── ENHANCED_TEMPLATE_SYSTEM.md
│   │   │   ├── TEMPLATE_SYSTEM_SUMMARY.md
│   │   │   └── TEMPLATE_VISIBILITY_DEBUG.md
│   │   ├── intake/
│   │   │   ├── INTAKE_FLOW.md
│   │   │   └── INTAKE_DETAIL_TABLES.md
│   │   ├── gpt-agents/
│   │   │   ├── GPT_AGENTS_INTEGRATION.md
│   │   │   └── GPT_AGENTS_QUICK_START.md
│   │   └── hr-university/
│   │       └── HR_UNIVERSITY.md
│   ├── integrations/              # Integration docs
│   │   ├── AI_INTEGRATION_SETUP.md
│   │   ├── CRAYON_MCP_INTEGRATION.md
│   │   ├── MIXPANEL_MCP_INTEGRATION.md
│   │   ├── SNOWFLAKE_MCP_SETUP.md
│   │   ├── SNOWFLAKE_MCP_SECURITY.md
│   │   ├── SLACK_GPT_AGENT_INTEGRATION.md
│   │   ├── LOOM_VIDEO_INTEGRATION.md
│   │   ├── N8N_CLONE_FEATURE.md
│   │   └── N8N_ENUM_EXCEL_CONFIG.md
│   ├── architecture/              # Architecture docs
│   │   ├── DATA_ASSISTANT_MCP_ARCHITECTURE.md
│   │   ├── WORKFLOW_ANALYSIS_FLOW.md
│   │   └── template_architecture_proposal.md
│   ├── implementation/            # Implementation plans
│   │   ├── AI_BUTTON_IMPLEMENTATION.md
│   │   ├── DATA_ASSISTANT_IMPLEMENTATION_PLAN.md
│   │   ├── DATA_ASSISTANT_MCP_INTEGRATION_PLAN.md
│   │   ├── ENHANCED_EDIT_FORM.md
│   │   └── VARIABLE_INJECTION_IMPROVEMENTS.md
│   ├── debug/                     # Debug/troubleshooting guides
│   │   ├── DEBUG_CLONE_VARIABLES.md
│   │   ├── debug-template-creation.md
│   │   ├── TEMPLATE_VISIBILITY_DEBUG.md
│   │   └── TEST_VARIABLE_INJECTION.md
│   ├── security/                  # Security documentation
│   │   ├── PRODUCTION_SECURITY_AUDIT.md
│   │   └── SECURITY_AUDIT_REPORT.md
│   ├── summaries/                 # Summary documents
│   │   ├── CRAYON_INTEGRATION_SUMMARY.md
│   │   ├── DATA_ASSISTANT_DOCUMENTATION.md
│   │   ├── GTM_AI_HUB_DOCUMENTATION.md
│   │   └── EDGE_FUNCTION_SETUP.md
│   └── test_template_variables_fix.md
│
├── sql/                           # 🗄️ Ad-hoc SQL scripts (not migrations)
│   ├── checks/                    # Check/query scripts
│   │   ├── check_gpt_agent_foreign_keys.sql
│   │   ├── check_gpt_agent_nullable.sql
│   │   ├── check_gpt_agent_rls.sql
│   │   ├── check_gpt_agent_schema.sql
│   │   ├── check_gpt_agent_table.sql
│   │   ├── check_gpt_agents.sql
│   │   ├── check_tables.sql
│   │   ├── check_template_variable_columns.sql
│   │   └── check_templates.sql
│   ├── fixes/                     # Fix scripts
│   │   ├── fix_existing_templates.sql
│   │   ├── fix_gpt_agent_app_user_rls.sql
│   │   ├── fix_gpt_agent_foreign_key_issue.sql
│   │   ├── fix_gpt_agent_rls_immediate.sql
│   │   ├── fix_gpt_agent_rls_policies.sql
│   │   ├── fix_intake_rls_policies.sql
│   │   ├── fix_rls_policy_loop_complete.sql
│   │   ├── FIX_SLACK_MODAL_CONSTRAINTS.sql
│   │   ├── fix_template_variables.sql
│   │   ├── fix_template_video_columns.sql
│   │   ├── remove_gpt_agent_foreign_key.sql
│   │   └── simple_gpt_agent_fix.sql
│   ├── migrations/                # Manual migrations
│   │   ├── add_template_variable_columns.sql
│   │   ├── create_gpt_agents_tables.sql
│   │   ├── update_all_instructions.sql
│   │   ├── update_execution_instructions.sql
│   │   └── update_intake_rls_policies.sql
│   ├── utilities/                 # Utility scripts
│   │   ├── clean_credential_variables.sql
│   │   ├── create_system_user.sql
│   │   ├── debug_gpt_agent_access.sql
│   │   └── temporarily_disable_rls.sql
│   └── README.md                  # SQL scripts documentation
│
├── test/                          # 🧪 All test files (consolidate)
│   ├── integration/               # Integration tests
│   │   ├── test-supabase-connection.js
│   │   ├── test-edge-function.js
│   │   ├── test-edge-function-direct.js
│   │   ├── test-slack-intake.js
│   │   ├── test-api-route.js
│   │   ├── test-api-route-data.js
│   │   └── test-real-workflow.js
│   ├── features/                  # Feature tests
│   │   ├── test-ai-analysis.js
│   │   ├── test-simple-prompt.js
│   │   ├── test-variable-injection.js
│   │   ├── test-n8n-clone.js
│   │   └── test-regex.js
│   ├── integrations/              # Integration service tests
│   │   ├── test-crayon-mcp.js
│   │   ├── test-mixpanel-mcp.js
│   │   ├── test-mixpanel-simple.js
│   │   ├── test-snowflake-mcp.js
│   │   ├── test-snowflake-mcp-simple.js
│   │   ├── test-data-assistant-mcps.js
│   │   └── test-customers-count.js
│   ├── gpt-agents/                # GPT agent tests
│   │   ├── test_gpt_agent_creation.js
│   │   ├── test_gpt_agent_query.js
│   │   └── test_slack_intake_with_gpt_agent.js
│   ├── fixtures/                  # Test fixtures
│   │   ├── sample-hubspot-workflow.json
│   │   └── test-template-creation.html
│   ├── components/                # Component tests (already exists)
│   │   └── page-header.test.tsx
│   └── loom-embed.test.ts
│
├── scripts/                       # 🛠️ Utility scripts (consolidate)
│   ├── database/                  # Database scripts (already has some)
│   │   ├── migrate.ts
│   │   ├── seed.ts
│   │   ├── apply_migration_004.js
│   │   └── update-instructions.js
│   ├── debug/                     # Debug utilities
│   │   ├── debug_clone_form.js
│   │   ├── debug_template_variables.js
│   │   ├── debug_templates.js
│   │   ├── debug-template-creation.js
│   │   ├── extract_gpt_agent_info.js
│   │   └── browser-workflow-comparison.js
│   ├── fixes/                     # One-off fix scripts
│   │   ├── fix_existing_template.js
│   │   ├── quick_fix_template.js
│   │   └── remove-console-logs.js
│   ├── utilities/                 # General utilities
│   │   └── compare-workflows.js
│   ├── set-secret.js
│   ├── add-sidebar.ts
│   └── deploy-edge-function.sh
│
├── app/                           # ✅ Keep as-is (organized)
├── components/                    # ✅ Keep as-is (organized)
├── lib/                           # ✅ Keep as-is (organized)
├── supabase/                      # ✅ Keep as-is (has migrations/)
├── types/                         # ✅ Keep as-is (organized)
├── public/                        # ✅ Keep as-is (organized)
├── hooks/                         # ✅ Keep as-is (organized)
├── debug/                         # ✅ Keep as-is (move more files here)
│   └── ai-logs/
│
├── .gitignore                     # ✅ Root config files stay
├── .vercelignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.js
├── vitest.config.ts
├── postcss.config.js
├── env.example
├── index.html
├── README.md                      # ✅ Main readme stays in root
└── PRODUCTION_SECURITY_AUDIT.md   # ✅ Keep recent important doc in root
```

## Benefits

### 🎯 Clear Organization
- Documentation grouped by category
- Test files organized by type
- SQL scripts categorized by purpose
- Debug utilities in one place

### 🚀 Better Developer Experience
- Easy to find what you need
- Clear naming conventions
- Logical grouping

### 🔒 Security
- Easier to exclude test/debug files from production
- Clear separation of concerns
- Better .vercelignore patterns

### 📦 Cleaner Root
- Only essential config files
- Main README visible
- Less scrolling, more clarity

## Migration Strategy

1. **Create new directories**
2. **Move files to new locations** (preserve git history with `git mv`)
3. **Update .vercelignore** to exclude new directories
4. **Update documentation references** (if needed)
5. **Test build still works**

## Files to Keep in Root

- Configuration: `*.config.js`, `tsconfig.json`, `package.json`
- Environment: `.env.example`, `.gitignore`, `.vercelignore`
- Documentation: `README.md` only
- Important: `PRODUCTION_SECURITY_AUDIT.md` (recent, important)

## Estimated Time
- Planning: 10 minutes ✅ (you're here)
- Execution: 15-20 minutes
- Testing: 5 minutes
- **Total: ~30 minutes**

## Next Steps
1. Review this plan
2. Execute reorganization
3. Test build: `npm run build`
4. Commit changes: `git add . && git commit -m "chore: organize project structure"`

