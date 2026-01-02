# Security Endpoint Audit (Mutation Endpoints)

This file lists mutation endpoints and highlights missing CSRF/origin validation
and/or missing rate limiting.

Legend:
- Origin validation: `validateOrigin` or `withOriginValidation`
- Rate limiting: `withRateLimit`

## Missing Origin Validation

Each entry lists the mutation methods detected and whether rate limiting is present.

- `app/api/admin/trust-governance/route.ts` — methods: POST; rate limiting: missing
- `app/api/analytics/route.ts` — methods: POST; rate limiting: missing
- `app/api/appeals/route.ts` — methods: POST, PATCH; rate limiting: missing
- `app/api/auth/login/route.ts` — methods: POST; rate limiting: present
- `app/api/auth/logout/route.ts` — methods: POST; rate limiting: missing
- `app/api/auth/signup/route.ts` — methods: POST; rate limiting: present
- `app/api/citations/[id]/route.ts` — methods: DELETE; rate limiting: missing
- `app/api/citations/route.ts` — methods: POST; rate limiting: missing
- `app/api/coordination/[threadId]/messages/route.ts` — methods: POST; rate limiting: missing
- `app/api/coordination/[threadId]/route.ts` — methods: PATCH; rate limiting: missing
- `app/api/coordination/route.ts` — methods: POST; rate limiting: missing
- `app/api/correspondence/[id]/archive/route.ts` — methods: POST; rate limiting: missing
- `app/api/correspondence/[id]/read/route.ts` — methods: POST; rate limiting: missing
- `app/api/correspondence/cron/route.ts` — methods: POST; rate limiting: missing
- `app/api/correspondence/send/route.ts` — methods: POST; rate limiting: missing
- `app/api/invite/send-email/route.ts` — methods: POST; rate limiting: missing
- `app/api/jury/create/route.ts` — methods: POST; rate limiting: missing
- `app/api/jury/route.ts` — methods: POST; rate limiting: missing
- `app/api/polls/[id]/route.ts` — methods: PUT, DELETE; rate limiting: missing
- `app/api/posts/[id]/route.ts` — methods: PUT, DELETE; rate limiting: missing
- `app/api/posts/[id]/view/route.ts` — methods: POST; rate limiting: missing
- `app/api/precedents/[id]/route.ts` — methods: PATCH, DELETE; rate limiting: missing
- `app/api/precedents/route.ts` — methods: POST; rate limiting: missing
- `app/api/public/poll/[token]/route.ts` — methods: POST; rate limiting: present
- `app/api/public/survey/[token]/route.ts` — methods: POST; rate limiting: present
- `app/api/question-advisor/route.ts` — methods: POST; rate limiting: present
- `app/api/report/route.ts` — methods: POST; rate limiting: missing
- `app/api/reports/[id]/delete/route.ts` — methods: POST; rate limiting: missing
- `app/api/reports/[id]/dismiss/route.ts` — methods: POST; rate limiting: missing
- `app/api/reports/[id]/resolve/route.ts` — methods: POST; rate limiting: missing
- `app/api/reports/[id]/route.ts` — methods: PUT, DELETE; rate limiting: missing
- `app/api/research-search/route.ts` — methods: POST; rate limiting: missing
- `app/api/reviews/route.ts` — methods: POST, PATCH; rate limiting: missing
- `app/api/roles/route.ts` — methods: POST; rate limiting: missing
- `app/api/saved-references/route.ts` — methods: POST, DELETE; rate limiting: missing
- `app/api/search/analytics/route.ts` — methods: POST; rate limiting: missing
- `app/api/search/typeahead/route.ts` — methods: POST; rate limiting: missing
- `app/api/send-email/route.ts` — methods: POST; rate limiting: missing
- `app/api/surveys/[id]/respond/route.ts` — methods: POST; rate limiting: missing
- `app/api/surveys/[id]/route.ts` — methods: PUT, DELETE; rate limiting: missing
- `app/api/surveys/route.ts` — methods: POST; rate limiting: present
- `app/api/tags/route.ts` — methods: POST; rate limiting: missing
- `app/api/users/[id]/route.ts` — methods: PUT, DELETE; rate limiting: missing
- `app/api/users/invite-credits/route.ts` — methods: POST; rate limiting: missing
- `app/api/web-search/route.ts` — methods: POST; rate limiting: missing

## Missing Rate Limiting

Each entry lists the mutation methods detected and whether origin validation is present.

- `app/api/admin/trust-governance/route.ts` — methods: POST; origin validation: missing
- `app/api/analytics/route.ts` — methods: POST; origin validation: missing
- `app/api/appeals/route.ts` — methods: POST, PATCH; origin validation: missing
- `app/api/auth/logout/route.ts` — methods: POST; origin validation: missing
- `app/api/citations/[id]/route.ts` — methods: DELETE; origin validation: missing
- `app/api/citations/route.ts` — methods: POST; origin validation: missing
- `app/api/coordination/[threadId]/messages/route.ts` — methods: POST; origin validation: missing
- `app/api/coordination/[threadId]/route.ts` — methods: PATCH; origin validation: missing
- `app/api/coordination/route.ts` — methods: POST; origin validation: missing
- `app/api/correspondence/[id]/archive/route.ts` — methods: POST; origin validation: missing
- `app/api/correspondence/[id]/read/route.ts` — methods: POST; origin validation: missing
- `app/api/correspondence/cron/route.ts` — methods: POST; origin validation: missing
- `app/api/correspondence/send/route.ts` — methods: POST; origin validation: missing
- `app/api/invite/send-email/route.ts` — methods: POST; origin validation: missing
- `app/api/jury/create/route.ts` — methods: POST; origin validation: missing
- `app/api/jury/route.ts` — methods: POST; origin validation: missing
- `app/api/polls/[id]/route.ts` — methods: PUT, DELETE; origin validation: missing
- `app/api/posts/[id]/accept/route.ts` — methods: POST; origin validation: present
- `app/api/posts/[id]/route.ts` — methods: PUT, DELETE; origin validation: missing
- `app/api/posts/[id]/view/route.ts` — methods: POST; origin validation: missing
- `app/api/precedents/[id]/route.ts` — methods: PATCH, DELETE; origin validation: missing
- `app/api/precedents/route.ts` — methods: POST; origin validation: missing
- `app/api/report/route.ts` — methods: POST; origin validation: missing
- `app/api/reports/[id]/delete/route.ts` — methods: POST; origin validation: missing
- `app/api/reports/[id]/dismiss/route.ts` — methods: POST; origin validation: missing
- `app/api/reports/[id]/resolve/route.ts` — methods: POST; origin validation: missing
- `app/api/reports/[id]/route.ts` — methods: PUT, DELETE; origin validation: missing
- `app/api/research-search/route.ts` — methods: POST; origin validation: missing
- `app/api/reviews/route.ts` — methods: POST, PATCH; origin validation: missing
- `app/api/roles/route.ts` — methods: POST; origin validation: missing
- `app/api/saved-references/route.ts` — methods: POST, DELETE; origin validation: missing
- `app/api/search/analytics/route.ts` — methods: POST; origin validation: missing
- `app/api/search/typeahead/route.ts` — methods: POST; origin validation: missing
- `app/api/send-email/route.ts` — methods: POST; origin validation: missing
- `app/api/surveys/[id]/respond/route.ts` — methods: POST; origin validation: missing
- `app/api/surveys/[id]/route.ts` — methods: PUT, DELETE; origin validation: missing
- `app/api/tags/route.ts` — methods: POST; origin validation: missing
- `app/api/users/[id]/route.ts` — methods: PUT, DELETE; origin validation: missing
- `app/api/users/invite-credits/route.ts` — methods: POST; origin validation: missing
- `app/api/web-search/route.ts` — methods: POST; origin validation: missing
