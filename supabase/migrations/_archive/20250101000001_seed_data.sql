-- ============================================
-- SEED DATA - Sample Posts and Additional Content
-- ============================================
-- This migration should be run AFTER users have been created through Supabase Auth
-- Replace the UUIDs below with actual user IDs from your auth.users table

-- ============================================
-- Sample Posts
-- ============================================
-- Note: You'll need to replace 'YOUR_USER_ID_HERE' with actual user IDs
-- You can get these by running: SELECT id, email FROM auth.users;

-- Uncomment and update the following after creating users through Auth:


-- Sample Post 1: Humanitarian Aid
-- INSERT INTO posts (title, content, tags, author_id) VALUES
-- (
--   'Emergency Relief Assessment in Northern Syria',
--   E'# Overview\n\nThis research documents the current state of emergency relief operations in northern Syria, focusing on supply chain logistics and distribution challenges.\n\n## Key Findings\n\n1. Distribution networks are fragmented\n2. Cross-border coordination requires improvement\n3. Local NGO capacity needs strengthening\n\n## Methodology\n\nWe conducted 45 interviews with aid workers and 120 beneficiary surveys across three provinces.\n\n## Recommendations\n\n- Establish centralized coordination hubs\n- Invest in local staff training\n- Improve communication infrastructure',
--   ARRAY['Humanitarian Aid', 'Public Health'],
--   (SELECT id FROM auth.users LIMIT 1)
-- );

-- Sample Post 2: Education
-- INSERT INTO posts (title, content, tags, author_id) VALUES
-- (
--   'Rebuilding Education Systems: A Case Study',
--   E'# Abstract\n\nThis paper examines innovative approaches to rebuilding education infrastructure in conflict-affected regions.\n\n## Introduction\n\nEducation continuity during and after conflict is crucial for long-term stability and development.\n\n## Case Studies\n\n### Mobile Learning Units\nImplementation of mobile classrooms reached 5,000 students in remote areas.\n\n### Teacher Training Programs\nCapacity building for 200 teachers using peer-to-peer methodologies.\n\n## Results\n\nStudent enrollment increased by 40% in pilot regions over 18 months.\n\n## Conclusion\n\nFlexible, community-based approaches show promising results for education recovery.',
--   ARRAY['Education', 'Social Sciences'],
--   (SELECT id FROM auth.users LIMIT 1)
-- );

-- Sample Post 3: Public Health
-- INSERT INTO posts (title, content, tags, author_id) VALUES
-- (
--   'Mental Health Support in Displacement Settings',
--   E'# Research Summary\n\n## Background\n\nDisplaced populations face unique mental health challenges requiring culturally appropriate interventions.\n\n## Study Design\n\n- Population: 350 internally displaced persons\n- Duration: 12 months\n- Location: Three displacement camps\n\n## Interventions Tested\n\n1. Group therapy sessions\n2. Individual counseling\n3. Community support networks\n4. Psychoeducation programs\n\n## Outcomes\n\n- 65% reduction in reported PTSD symptoms\n- Improved community cohesion scores\n- Enhanced coping mechanisms\n\n## Implications\n\nCommunity-based mental health approaches can be effectively scaled in resource-limited settings.',
--   ARRAY['Public Health', 'Psychology'],
--   (SELECT id FROM auth.users LIMIT 1)
-- );

-- Sample Post 4: Infrastructure
-- INSERT INTO posts (title, content, tags, author_id) VALUES
-- (
--   'Sustainable Water Infrastructure Solutions',
--   E'# Engineering Assessment\n\n## Problem Statement\n\nAccess to clean water remains a critical challenge in conflict-affected areas.\n\n## Technical Approach\n\n### Solar-Powered Pumping Systems\n- Installation of 15 systems\n- Average capacity: 50,000 liters/day\n- Maintenance training for local technicians\n\n### Water Quality Monitoring\n- Implementation of testing protocols\n- Community-based monitoring teams\n\n## Cost-Benefit Analysis\n\n| Metric | Traditional | Solar-Powered |\n|--------|-------------|---------------|\n| Initial Cost | $15,000 | $25,000 |\n| Annual Operating | $8,000 | $1,200 |\n| Lifespan | 5 years | 15 years |\n\n## Recommendations\n\nInvest in renewable energy solutions for long-term sustainability.',
--   ARRAY['Infrastructure', 'Engineering', 'Environmental Studies'],
--   (SELECT id FROM auth.users LIMIT 1)
-- );

-- Sample Post 5: Economic Development
-- INSERT INTO posts (title, content, tags, author_id) VALUES
-- (
--   'Microfinance Programs for Women Entrepreneurs',
--   E'# Economic Empowerment Study\n\n## Executive Summary\n\nThis research evaluates microfinance initiatives targeting women-led businesses in post-conflict regions.\n\n## Program Overview\n\n- 240 beneficiaries\n- Average loan size: $500-$2,000\n- 18-month repayment period\n- Financial literacy training included\n\n## Success Metrics\n\n- 87% repayment rate\n- Average income increase: 45%\n- 120 new jobs created\n- 60% of businesses still operating after 2 years\n\n## Challenges Identified\n\n1. Limited access to markets\n2. Regulatory barriers\n3. Security concerns affecting operations\n\n## Scalability Considerations\n\nPartnership with local financial institutions essential for growth.',
--   ARRAY['Economic Development', 'Social Sciences'],
--   (SELECT id FROM auth.users LIMIT 1)
-- );

-- Sample Comments (add after posts are created)
-- Uncomment and update with actual post_id and user_id values:


-- INSERT INTO comments (content, post_id, user_id) VALUES
-- (
--   'Excellent research. Have you considered collaborating with UN agencies on implementation?',
--   'POST_ID_HERE',
--   'USER_ID_HERE'
-- );

-- INSERT INTO comments (content, post_id, user_id) VALUES
-- (
--   'The methodology section could benefit from more detail on sampling techniques.',
--   'POST_ID_HERE',
--   'USER_ID_HERE'
-- );

-- INSERT INTO comments (content, post_id, user_id) VALUES
-- (
--   'This aligns with our findings in neighboring regions. Would love to discuss further.',
--   'POST_ID_HERE',
--   'USER_ID_HERE'
-- );


-- Sample Citations (link posts that reference each other)
-- Uncomment and update with actual post IDs:


-- INSERT INTO citations (source_post_id, target_post_id) VALUES
-- ('SOURCE_POST_ID', 'TARGET_POST_ID');



