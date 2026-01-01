# Syria Governorates Polygon Data

## Source
**geoBoundaries** - Open Administrative Boundaries Database  
https://www.geoboundaries.org/

## Dataset Details
- **Country**: Syria (SYR)
- **Admin Level**: ADM1 (Governorates)
- **Format**: GeoJSON FeatureCollection
- **CRS**: OGC CRS84 (EPSG:4326)
- **Governorates**: 14 (Damascus, Aleppo, Rural Damascus, Homs, Hama, Lattakia, Tartus, Idleb, Al-Hasakeh, Deir-ez-Zor, Ar-Raqqa, Dar'a, As-Sweida, Quneitra)

## Version & Date
- **File**: `syria-governorates-polygons.json`
- **Frozen**: December 2024
- **geoBoundaries Version**: Standardized ADM1 boundaries

## Usage
This reference data is used for:
- **P3 Pattern Detection**: Checking if user-drawn regions span multiple governorates
- **P4 Access Discontinuity**: Comparing distances to governorate centers
- **P2 Service Coverage**: Identifying large, sparse governorates

## Why geoBoundaries (not OSM)?
geoBoundaries provides:
- Consistent, stable administrative boundaries
- Standardized ISO codes (shapeISO)
- Regular versioning for reproducibility

OSM boundaries change more frequently and require snapshot pinning.

## Arabic Names Mapping
Arabic names are mapped in `SpatialContextCard.tsx` for localization.

---
*Last updated: December 2024*
