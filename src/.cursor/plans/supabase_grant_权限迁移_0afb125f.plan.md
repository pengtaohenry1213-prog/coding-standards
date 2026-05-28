---
name: Supabase GRANT 权限迁移
overview: 为 Supabase 数据库表格添加显式 GRANT 权限，确保符合 Supabase 新政策的兼容性要求。
todos:
  - id: update-schema
    content: 修改 supabase-schema.sql 添加 GRANT 语句
    status: completed
  - id: create-migration
    content: 创建独立的 06_add_grants.sql 迁移文件
    status: completed
isProject: false
---

## Supabase GRANT 权限迁移计划

### 1. 修改 `supabase-schema.sql`

在 `v2/apps/workflow-dashboard/supabase-schema.sql` 中，建表语句后添加 GRANT 语句：

```sql
-- Schema 权限
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- proposals 表权限
GRANT SELECT ON public.proposals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO service_role;

-- proposal_versions 表权限
GRANT SELECT ON public.proposal_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_versions TO service_role;

-- lifecycle_snapshots 表权限
GRANT SELECT ON public.lifecycle_snapshots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifecycle_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifecycle_snapshots TO service_role;
```

### 2. 创建单独的迁移文件 `06_add_grants.sql`

创建独立迁移文件，方便后续版本管理和部署：

```sql
-- Grant explicit permissions for Data API access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.proposals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO service_role;

GRANT SELECT ON public.proposal_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_versions TO service_role;

GRANT SELECT ON public.lifecycle_snapshots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifecycle_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifecycle_snapshots TO service_role;
```

### 3. 修改文件

- `v2/apps/workflow-dashboard/supabase-schema.sql` - 添加 GRANT 到主 schema 文件
- `v2/apps/workflow-dashboard/migrations/06_add_grants.sql` - 创建独立迁移文件

