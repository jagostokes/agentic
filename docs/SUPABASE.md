# Supabase database (no Prisma)

This app uses **Supabase** as the database. All data is accessed via the Supabase JavaScript client with the **service role** key on the server (no Prisma).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Wait for the project to be ready.

## 2. Environment variables

In **Project Settings → API**:

- **Project URL** → set as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.
- **Project API keys** → copy the **service_role** key (secret) → set as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client or commit it. It bypasses Row Level Security (RLS).

## 3. Run the schema

Create the tables by running the migration SQL:

1. In the Supabase dashboard, open **SQL Editor**.
2. Copy the contents of `supabase/migrations/20250208000000_initial_schema.sql` from this repo.
3. Paste and run the script.

This creates:

- `public.users` – app users (NextAuth; we don’t use Supabase Auth for sign-in).
- `public.agents` – one per user, linked to the OpenClaw gateway.
- `public.agent_bindings` – e.g. Telegram user id linked to an agent.
- `public.agent_binding_claims` – short-lived tokens for the Telegram claim flow.

RLS is enabled on all tables; the server uses the service role key, which bypasses RLS.

## 4. Optional: Supabase CLI

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref your-project-ref
supabase db push
```

This applies migrations from `supabase/migrations/` to your linked project.

## Tables (snake_case)

| Table                    | Purpose                          |
|--------------------------|----------------------------------|
| `users`                  | id, email, name, image, timestamps |
| `agents`                 | id, user_id, gateway_agent_id, gateway_workspace_id |
| `agent_bindings`         | id, user_id, agent_id, channel_type, channel_user_id (unique on agent_id + channel_type + channel_user_id) |
| `agent_binding_claims`   | id, agent_id, token, expires_at |

All access is server-side via `lib/supabase.ts` (singleton Supabase client with service role).
