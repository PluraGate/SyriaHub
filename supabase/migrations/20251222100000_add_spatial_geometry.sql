-- Add spatial geometry column to posts table
-- This stores the GeoJSON geometry for the spatial coverage

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS spatial_geometry JSONB;

-- Add temporal dates if not already present (for drafts)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS temporal_start DATE,
  ADD COLUMN IF NOT EXISTS temporal_end DATE;

-- Comment
COMMENT ON COLUMN posts.spatial_geometry IS 'GeoJSON geometry object for precise spatial coverage (Point, Polygon, Circle)';
COMMENT ON COLUMN posts.temporal_start IS 'Start date of the temporal period this research covers';
COMMENT ON COLUMN posts.temporal_end IS 'End date of the temporal period this research covers';

-- Create index on spatial_geometry for future spatial queries
CREATE INDEX IF NOT EXISTS posts_spatial_geometry_idx ON posts USING GIN (spatial_geometry);
