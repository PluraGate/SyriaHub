-- Search Extensions: RPCs for similarity and plagiarism detection
-- Migration: 20251219000001_search_extensions.sql

-- Match content by raw embedding similarity (cosine)
CREATE OR REPLACE FUNCTION match_content_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content_id UUID,
  content_type TEXT,
  similarity float,
  embedded_text TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content_id,
    ce.content_type,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    ce.embedded_text
  FROM content_embeddings ce
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_content_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION match_content_embeddings TO anon;
GRANT EXECUTE ON FUNCTION match_content_embeddings TO service_role;
