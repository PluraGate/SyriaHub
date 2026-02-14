-- Fix ambiguous column in get_unverified_tags
create or replace function get_unverified_tags()
returns table (
  tag text,
  usage_count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  with all_post_tags as (
    select unnest(tags) as tag_name
    from posts
    where tags is not null
  ),
  tag_counts as (
    select tag_name, count(*) as count
    from all_post_tags
    group by tag_name
  )
  select 
    tc.tag_name as tag,
    tc.count as usage_count
  from tag_counts tc
  left join tags t on t.label = tc.tag_name
  where t.id is null
  order by tc.count desc;
end;
$$;
