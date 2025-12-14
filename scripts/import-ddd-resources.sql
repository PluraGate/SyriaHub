-- ============================================
-- DATA-DRIVEN DESIGN RESOURCE ENTRIES
-- PDFs from the Repository
-- ============================================
-- Run this AFTER import-ddd-articles.sql

-- ============================================
-- Resource Collections from Resources folder
-- ============================================

-- 1. Architecture Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Architecture',
  $content$
A curated collection of resources on data-driven approaches in architectural design.

## What's Included

This resource pack covers:

- **Computational Design Tools**: Rhino, Grasshopper, parametric modeling
- **Environmental Analysis**: Ladybug, Honeybee, energy modeling
- **BIM Integration**: Data-driven workflows in Revit and ArchiCAD
- **Case Studies**: Notable data-driven architecture projects
- **Research Papers**: Academic foundations of the field
- **Video Tutorials**: Hands-on learning resources

## Key Topics

1. Parametric design principles
2. Environmental performance optimization
3. Generative design workflows
4. Data visualization for architects
5. Digital fabrication integration

## How to Use

Browse the collection to find resources relevant to your current project or learning goals. Links are organized by topic and difficulty level.

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['data-driven-design', 'architecture', 'computational-design', 'parametric-design'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Architecture'
);

-- 2. Biomimicry Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Biomimicry',
  $content$
A curated collection exploring biomimicry principles in architecture and design.

## What's Included

This resource pack covers:

- **Introduction to Biomimicry**: Core concepts and methodologies
- **Case Studies**: Buildings inspired by natural systems
- **Research**: Academic papers on bio-inspired design
- **Tools**: AskNature database, biomimicry design spirals
- **Videos**: TED talks and documentaries

## Featured Examples

- Eastgate Centre's termite-inspired cooling
- Venus Flower Basket structural optimization  
- Slime mold network algorithms
- Self-healing materials from nature

## Key Resources

1. The Biomimicry Institute
2. AskNature database
3. Biomimicry 3.8 methodology
4. Nature-inspired algorithms

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['biomimicry', 'sustainability', 'architecture', 'data-driven-design'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Biomimicry'
);

-- 3. Books Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Recommended Books',
  $content$
Essential reading list for data-driven design practitioners.

## Directly Related to Data-Driven Design & Architecture

- **Data-Driven Design: How to Use Data to Inform Design Decisions** by Andrew Chen
- **Design Like You Give a Damn** by Architecture for Humanity

## Design Thinking, Urbanism, and Technology

- **The Design of Everyday Things** by Don Norman
- **Lean Analytics** by Alistair Croll & Benjamin Yoskovitz
- **Universal Principles of Design** by William Lidwell et al.
- **Algorithms to Live By** by Brian Christian & Tom Griffiths
- **Architecture and Disjunction** by Bernard Tschumi

## Biomimicry and Nature-Inspired Design

- **Biomimicry: Innovation Inspired by Nature** by Janine Benyus

## Islamic Architecture and Urbanism

- **What is Islamic architecture anyway?** by Nasser Rabbat
- **From medieval Cairo to modern Masdar City** by Hassan, Lee & Yoo
- **فقه العمران** by Khaled Azab

## Data Ethics & Social Impact

- **Weapons of Math Destruction** by Cathy O'Neil
- **Invisible Women: Data Bias in a World Designed for Men** by Caroline Criado Perez

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['data-driven-design', 'architecture', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Recommended Books'
);

-- 4. Case Studies Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Case Studies',
  $content$
A collection of notable case studies demonstrating data-driven design in practice.

## Featured Projects

### Sustainable Cities
- **Masdar City, Abu Dhabi** - Zero-carbon city design
- **Songdo IBD, South Korea** - Smart city integration

### High-Performance Buildings
- **The Edge, Amsterdam** - World's greenest office
- **Bloomberg HQ, London** - Natural ventilation innovation

### Urban Interventions
- **Green Light for Midtown, NYC** - Broadway pedestrianization
- **High Line, NYC** - Adaptive reuse with urban data

### Heritage & Technology
- **Eden Project, UK** - Biomimetic structures
- **30 St Mary Axe (The Gherkin)** - Bio-inspired engineering

## What You'll Learn

1. How data informed each project's design decisions
2. Measurable outcomes and performance metrics
3. Technologies and tools employed
4. Lessons learned and best practices

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['data-driven-design', 'architecture', 'urban-planning', 'sustainability'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Case Studies'
);

-- 5. Statistics & Data Visualization Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Statistics & Data Visualization',
  $content$
Essential resources for statistical analysis and data visualization in design.

## Data Sources

### Global Statistics
- World Bank Data
- Statista
- Our World In Data
- Gapminder

### Platform-Specific
- Kaggle
- Data.gov
- Data Commons
- Pew Research Center

## Visualization Tools

### Free & Open Source
- RawGraph
- Observable
- D3.js

### Professional
- Tableau
- Power BI
- Plotly

## Learning Resources

- **Storytelling with Data** by Cole Nussbaumer Knaflic
- **The beauty of data visualization** - David McCandless TED Talk
- Data Visualisation Project

## Key Concepts

1. Choosing the right chart type
2. Color theory for data
3. Narrative structure in visualization
4. Accessibility considerations

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['data-visualization', 'data-driven-design', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Statistics & Data Visualization'
);

-- 6. Tech & Applications Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Tech & Applications',
  $content$
Software, platforms, and technologies for data-driven architecture.

## Design & Modeling

### Parametric Design
- **Rhino + Grasshopper** - Industry standard parametric design
- **Autodesk Dynamo** - Visual programming for Revit

### BIM Platforms
- **Revit** - Data-rich building modeling
- **ArchiCAD** - Graphisoft's BIM solution
- **Vectorworks** - Design and BIM

## Environmental Analysis

### Simulation Tools
- **Ladybug Tools** - Environmental analysis for Grasshopper
- **Autodesk Forma** - Cloud-based analysis
- **EnergyPlus** - Building energy simulation

## GIS & Spatial Analysis

### Platforms
- **ArcGIS** - Esri's comprehensive GIS suite
- **QGIS** - Open source GIS
- **Cesium** - 3D geospatial visualization

### Photogrammetry
- **RealityCapture** - Point cloud generation
- **Agisoft Metashape** - 3D model from photos

## Emerging Technologies

- **Digital Twins** - Real-time building mirrors
- **Mixed Reality (HoloLens)** - On-site visualization
- **AI/ML Integration** - Generative design

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['computational-design', 'gis', 'digital-twin', 'data-driven-design'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Tech & Applications'
);

-- 7. Websites & Online Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: Websites & Online Resources',
  $content$
Curated websites and online platforms for data-driven design practitioners.

## Design Communities

- **Food4Rhino** - Grasshopper plugins and resources
- **McNeel Forums** - Rhino community support
- **Parametric Architecture** - News and tutorials

## Research & Academia

- **ResearchGate** - Academic paper sharing
- **MDPI** - Open access journals
- **arXiv** - Preprints in multiple fields

## Organizations

- **The Biomimicry Institute** - Nature-inspired innovation
- **AskNature** - Biological strategies database
- **CTBUH** - Council on Tall Buildings

## Data Portals

- **NYC Open Data** - City datasets
- **OpenStreetMap** - Crowdsourced mapping
- **USGS** - Geological and environmental data

## Learning Platforms

- **Coursera** - Data science courses
- **YouTube Channels** - Tutorials and talks
- **Dezeen** - Architecture news and case studies

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['data-driven-design', 'architecture', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: Websites & Online Resources'
);

-- 8. YouTube Resources
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Design Resources: YouTube Channels & Videos',
  $content$
Video resources for learning data-driven design in architecture.

## Recommended Channels

### Parametric Design
- **McNeel Europe** - Official Rhino/Grasshopper tutorials
- **3D Beast** - Grasshopper tutorials
- **CDFAM** - Computational design talks

### Architecture & Urbanism
- **ArchiDiaries** - Architecture concepts
- **Autodesk Forma** - Environmental analysis workflows
- **NYC DOT** - Urban planning case studies

### Data & Technology
- **Sebastian Lague** - Creative coding
- **TED-Ed** - Data visualization concepts
- **Bloomberg Originals** - Smart building documentaries

## Must-Watch Videos

1. **Optimization as a Design Tool in Architecture** - Banafsheh Fahimipour
2. **Data-Driven Urban Design** - UTS
3. **The Seven Myths of Data-Driven Design** - Sujin Lee
4. **Informed Data-Driven Computational Design** - Rick Titulaer (ARUP)
5. **What Humans Can Learn from Semi-Intelligent Slime** - Heather Barnett (TED)

## Biomimicry Content

- How This Desert City Stays Cool (Ancient Air Conditioning)
- See How Termites Inspired a Building That Can Cool Itself
- Mimicking Glass Sponges for Lightweight Building Materials

---

*Part of the Data-Driven Design in Architecture lecture series.*
$content$,
  ARRAY['data-driven-design', 'computational-design', 'architecture'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Design Resources: YouTube Channels & Videos'
);

-- ============================================
-- Research Papers (from Research folder)
-- ============================================

-- Research Paper 1: HBIM Conservation
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Data-Driven Conservation Actions of Heritage Places Curated with HBIM',
  $content$
## Abstract

This research paper explores how Heritage Building Information Modeling (HBIM) can be leveraged to improve conservation decision-making for heritage places. The study presents a data-driven approach to managing heritage assets using digital documentation and BIM workflows.

## Key Findings

1. **Digital Documentation**: Point cloud scanning and photogrammetry provide accurate 3D records of heritage structures
2. **Data-Rich Models**: HBIM enables linking of condition assessments, material properties, and historical records
3. **Decision Support**: Data-driven conservation priorities can be established through systematic analysis
4. **Collaboration**: Shared digital models improve coordination among conservation professionals

## Methodology

The paper demonstrates a workflow combining:
- Laser scanning for geometric capture
- Photogrammetry for texture documentation
- BIM modeling for parametric object creation
- Database integration for condition tracking

## Applications

- Condition assessment and monitoring
- Intervention planning and prioritization
- Documentation and archiving
- Public engagement and education

## Authors

Tugba Saricaoglu and Gamze Saygi

---

*This is a research paper resource. The full paper discusses methodology and case study applications in detail.*
$content$,
  ARRAY['hbim', 'heritage-conservation', 'research', 'gis'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Data-Driven Conservation Actions of Heritage Places Curated with HBIM'
);

-- Research Paper 2: GIS in Underwater Archaeology
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Applying GIS to the Underwater Archaeology of Menorca',
  $content$
## Abstract

This paper presents the application of Geographic Information Systems (GIS) to underwater archaeological research in Menorca. The study demonstrates how spatial data management can improve the documentation, analysis, and preservation of submerged heritage sites.

## Research Context

- **Location**: Waters surrounding Menorca, Balearic Islands, Spain
- **Challenge**: Managing complex spatial data from underwater sites
- **Approach**: Integrating GIS with archaeological documentation workflows

## Key Contributions

1. **Spatial Database Design**: Customized GIS schema for underwater sites
2. **Visualization**: Mapping of artifact distributions and site features
3. **Analysis**: Spatial relationship study between archaeological finds
4. **Preservation**: Risk assessment for site management

## Methodology

The paper describes:
- Dive survey protocols
- Data collection standards
- GIS database structure
- Visualization techniques
- Analytical approaches

## Significance for Data-Driven Design

This research demonstrates how GIS tools—fundamental to data-driven architectural analysis—can be applied to heritage documentation in challenging environments.

---

*This is a research paper resource addressing GIS applications in archaeology.*
$content$,
  ARRAY['gis', 'heritage-conservation', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Applying GIS to the Underwater Archaeology of Menorca'
);

-- Research Paper 3: Digital Technology for Water Catchment
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'Digital Technology to Locate Historical Water Catchment Systems',
  $content$
## Abstract

This research applies digital technology—including GIS, geophysical surveys, and 3D modeling—to locate and document the 19th-century water catchment system of the "Cuadrado" Fountain in Montilla (Córdoba, Spain).

## Research Objectives

1. Locate the underground water infrastructure
2. Document the historical engineering system
3. Create digital models for preservation
4. Enable public understanding of heritage infrastructure

## Methodology

The study combines:
- **Historical Research**: Archival documents and maps
- **Geophysical Surveys**: Ground-penetrating radar and resistivity
- **GIS Analysis**: Spatial data integration
- **3D Modeling**: Reconstruction of the system

## Key Findings

The research successfully located and documented:
- Underground aqueduct routes
- Catchment galleries
- Distribution systems
- Connection to the fountain

## Significance

This case study demonstrates how data-driven approaches can recover lost knowledge about historical infrastructure, with applications to:
- Heritage conservation
- Urban archaeology
- Infrastructure rehabilitation
- Public engagement

## Authors

Pilar Carranza-Cañadas et al.

---

*Full paper available in the Research folder.*
$content$,
  ARRAY['heritage-conservation', 'gis', 'digital-twin', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'Digital Technology to Locate Historical Water Catchment Systems'
);

-- Research Paper 4: Medieval Cairo to Masdar City
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'From Medieval Cairo to Modern Masdar City: A Comparative Study',
  $content$
## Abstract

This comparative study examines the lessons that can be drawn from traditional Islamic urban design (specifically Medieval Cairo) and applied to contemporary sustainable city projects like Masdar City in Abu Dhabi.

## Research Questions

1. What passive design strategies were employed in Medieval Cairo?
2. How have these strategies been adapted in Masdar City?
3. What measurable performance benefits do these strategies provide?

## Key Strategies Compared

### Street Orientation & Width
- **Cairo**: Narrow, winding streets for shading and air channeling
- **Masdar**: 6m wide streets oriented 45° to prevailing winds

### Building Massing
- **Cairo**: Stepped heights creating pressure differentials
- **Masdar**: Building positioning for wind acceleration

### Wind Towers
- **Cairo**: Traditional badgir for passive cooling
- **Masdar**: Modern interpretations with mechanical assist

### Public Spaces
- **Cairo**: Shaded souks and courtyards
- **Masdar**: Covered plazas with evaporative cooling

## Performance Data

The paper presents temperature measurements showing:
- 15-20°C difference between Masdar streets and surrounding desert
- Comparable performance to traditional urban microclimates

## Conclusions

Traditional Islamic urban design represents centuries of empirical optimization. By studying these patterns with modern data analysis tools, contemporary designers can achieve significant sustainability improvements.

## Authors

Abbas M. Hassan, Hyowon Lee & UooSang Yoo

---

*This paper demonstrates the value of data-driven analysis of traditional design strategies.*
$content$,
  ARRAY['islamic-architecture', 'sustainability', 'urban-planning', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'From Medieval Cairo to Modern Masdar City: A Comparative Study'
);

-- Research Paper 5: What is Islamic Architecture
INSERT INTO posts (title, content, tags, content_type, author_id, status)
SELECT 
  'What is Islamic Architecture Anyway? (Nasser Rabbat)',
  $content$
## Overview

This seminal essay by Nasser Rabbat interrogates the very concept of "Islamic Architecture"—questioning its coherence as a category and exploring the diverse building traditions it encompasses.

## Key Arguments

### The Problem of Definition
- "Islamic Architecture" spans 14 centuries and three continents
- Vast diversity in materials, techniques, and forms
- What unifies it beyond religious association?

### Beyond Style
- Not a single stylistic system
- Multiple regional traditions with distinct characteristics
- Cross-cultural influences and adaptations

### Core Principles
Rather than formal elements, what may define Islamic architecture:
- **Spatial organization**: Public/private hierarchies
- **Light treatment**: Filtered, diffused, symbolic
- **Geometric abstraction**: Infinite patterns, non-representational
- **Integration with environment**: Passive climate response

### Historiographic Issues
- Western scholarly frameworks imposing categories
- Colonial-era classification systems
- Orientalist aestheticization

## Relevance to Data-Driven Design

Rabbat's essay prompts questions:
- How do we categorize and analyze diverse traditions with data?
- What metrics capture essential qualities vs. superficial features?
- How can data-driven tools preserve cultural specificity?

## About the Author

Nasser Rabbat is Aga Khan Professor of Islamic Architecture at MIT, a leading authority on Islamic architectural history and theory.

---

*This resource provides theoretical context for data-driven approaches to Islamic architectural heritage.*
$content$,
  ARRAY['islamic-architecture', 'architecture', 'research'],
  'resource',
  (SELECT id FROM users WHERE email = 'latif@lavartstudio.com'),
  'published'
WHERE NOT EXISTS (
  SELECT 1 FROM posts WHERE title = 'What is Islamic Architecture Anyway? (Nasser Rabbat)'
);

-- ============================================
-- Final verification
-- ============================================
SELECT 
  id, 
  title, 
  content_type, 
  created_at 
FROM posts 
WHERE author_id = (SELECT id FROM users WHERE email = 'latif@lavartstudio.com')
ORDER BY created_at DESC;
