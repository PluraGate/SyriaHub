import type { SeedPost } from '../types'

export const resources: SeedPost[] = [
  // ─── Resource 1: Open Geospatial Datasets ────────────────────────────────
  {
    cover_image_key: null,
    content_type: 'resource',
    status: 'published',
    tags: ['gis', 'open-data', 'documentation', 'syria', 'spatial-data'],
    metadata: { resource_type: 'dataset', license: 'mixed' },
    en: {
      title: 'Open Geospatial Datasets for Syrian Heritage and War Research',
      content: `A curated guide to open and semi-open geospatial datasets directly applicable to Syrian heritage documentation, damage assessment, and post-war research. Each entry includes access method, coverage, known limitations, and license information.

---

## Satellite Damage Assessment

**UNOSAT Conflict Monitoring**
- Provider: UNITAR / United Nations
- Coverage: Major Syrian cities (Aleppo, Homs, Raqqa, Deir ez-Zor, Mosul)
- Access: unosat.org, free download
- Format: Vector (GeoJSON/SHP), PDF reports
- Limitation: Urban-focused; rural and peri-urban sites are underrepresented. Updates irregular after initial post-event assessments.
- License: Creative Commons Attribution

**Copernicus Emergency Management Service (EMS)**
- Provider: European Union / ESA
- Coverage: Activations covering Syrian events archived from 2012
- Access: emergency.copernicus.eu, free registration
- Format: Vector layers, damage classification rasters
- Limitation: Coverage is event-triggered, not continuous. Some activations are restricted to authorised users.
- License: Copernicus Open Licence

**ASOR Cultural Heritage Initiatives (ASOR CHI)**
- Provider: American Schools of Oriental Research
- Coverage: Syrian heritage sites, monthly incident reports 2013–2020
- Access: asor-syrianheritage.org, searchable database and downloadable reports
- Format: PDF reports with embedded maps; GIS layers available on request for researchers
- Limitation: Site-level resolution only; does not record sub-site or feature-level damage
- License: Contact ASOR CHI for research use

---

## Community and Crowdsourced

**OpenStreetMap Humanitarian Data Model (Syria)**
- Provider: OpenStreetMap community / Humanitarian OpenStreetMap Team
- Coverage: All of Syria; density varies significantly by region
- Access: openstreetmap.org, direct download via Geofabrik or HOT Export Tool
- Format: PBF, OSM XML, Shapefile
- Limitation: Quality varies; Aleppo and Damascus well-mapped, rural Idlib sparse
- License: ODbL (Open Database Licence)

**Wikimapia Syria**
- Provider: Wikimapia community
- Coverage: Crowd-annotated points of interest including heritage sites and neighbourhoods
- Access: wikimapia.org API or manual review
- Limitation: Inconsistent maintenance; some entries abandoned since 2011
- License: Creative Commons Attribution-ShareAlike

---

## Population and Displacement

**UNHCR Syria Operational Data Portal**
- Provider: UNHCR
- Coverage: Refugee and IDP counts, demographic breakdowns, camp locations
- Access: data.unhcr.org/syrianrefugees, free download
- Format: CSV, Excel, interactive maps
- License: Creative Commons Attribution

**OCHA Humanitarian Data Exchange (HDX) — Syria**
- Provider: UN OCHA
- Coverage: Population, displacement, needs assessments, 3W (Who What Where)
- Access: data.humdata.org, free registration
- Format: Multiple (CSV, GeoJSON, SHP)
- License: Varies by dataset; most Creative Commons

---

## Remote Sensing — Open Access

**Sentinel-2 (ESA Copernicus)**
- Provider: ESA
- Coverage: Global, including Syria; 10m resolution, multispectral
- Access: Copernicus Open Access Hub (scihub.copernicus.eu), or via Google Earth Engine
- Update frequency: 5-day revisit
- License: Free, open, no commercial restrictions

**CORONA Declassified Imagery (1960s–1972)**
- Provider: US Geological Survey / National Geospatial-Intelligence Agency
- Coverage: Syria and Middle East at 1–2m resolution from the 1960s–1972
- Access: USGS Earth Explorer (earthexplorer.usgs.gov)
- Use: Pre-development baseline; identifies archaeological sites and urban morphology before modern construction
- License: Public domain (declassified US government)

---

## Institutional Archives (Restricted)

**Aga Khan Trust for Culture Digital Archive**
- Coverage: Pre-war conservation surveys of selected Syrian sites including parts of Aleppo old city
- Access: Formal request through AKTC; available to verified researchers
- Contact: akdn.org/architecture/project/old-city-of-aleppo

**French Institute of the Near East (IFPO) Archive**
- Coverage: Decades of Syrian archaeological and architectural surveys
- Access: Through IFPO Damascus / Beirut offices; variable accessibility since 2012`,
    },
    ar: {
      title: 'مجموعات البيانات الجغرافية المفتوحة لأبحاث التراث السوري في زمن الحرب',
      content: `دليل منتقى لمجموعات البيانات الجغرافية المفتوحة وشبه المفتوحة القابلة للتطبيق مباشرةً على توثيق التراث السوري وتقييم الأضرار والبحث في مرحلة ما بعد الحرب. تتضمن كل حقيقة طريقة الوصول والتغطية والقيود المعروفة ومعلومات الترخيص.

---

## تقييم الأضرار عبر الأقمار الصناعية

**يونوسات لرصد الحرب**
- المزوّد: معهد الأمم المتحدة للتدريب والبحث
- التغطية: المدن السورية الكبرى (حلب، حمص، الرقة، دير الزور)
- الوصول: unosat.org، تنزيل مجاني
- الصيغة: بيانات متجهية (GeoJSON/SHP)، تقارير PDF
- القيود: تركيز حضري؛ المواقع الريفية وشبه الحضرية ممثَّلة تمثيلاً ناقصاً. التحديثات غير منتظمة بعد التقييمات الأولية.
- الترخيص: المشاع الإبداعي — نسب المصدر

**خدمة كوبيرنيكوس لإدارة الطوارئ**
- المزوّد: الاتحاد الأوروبي / وكالة الفضاء الأوروبية
- التغطية: تفعيلات تغطي أحداثاً سورية مُؤرشَفة منذ 2012
- الوصول: emergency.copernicus.eu، تسجيل مجاني
- القيود: التغطية مرتبطة بأحداث بعينها، ليست مستمرة. بعض التفعيلات مقتصرة على مستخدمين مصرَّح لهم.
- الترخيص: رخصة كوبيرنيكوس المفتوحة

**مبادرات التراث الثقافي ASOR CHI**
- المزوّد: المدارس الأمريكية للبحث الاستشراقي
- التغطية: مواقع التراث السوري، تقارير شهرية 2013–2020
- الوصول: asor-syrianheritage.org، قاعدة بيانات قابلة للبحث وتقارير قابلة للتنزيل
- القيود: الدقة على مستوى الموقع فقط؛ لا تُسجَّل أضرار على مستوى الأجزاء أو العناصر الفردية
- الترخيص: تواصل مع ASOR CHI للاستخدام البحثي

---

## البيانات المجتمعية والتعاونية

**نموذج البيانات الإنساني لـ OpenStreetMap (سوريا)**
- المزوّد: مجتمع OpenStreetMap / فريق HOT الإنساني
- التغطية: سوريا كاملة؛ الكثافة تتفاوت تفاوتاً ملحوظاً بين المناطق
- الوصول: تنزيل مباشر عبر Geofabrik أو HOT Export Tool
- القيود: الجودة متفاوتة؛ حلب ودمشق موثَّقتان جيداً، ريف إدلب شحيح
- الترخيص: رخصة قاعدة البيانات المفتوحة ODbL

---

## السكان والنزوح

**بوابة بيانات عمليات UNHCR في سوريا**
- المزوّد: المفوضية السامية للأمم المتحدة لشؤون اللاجئين
- التغطية: أعداد اللاجئين والنازحين داخلياً، بيانات ديموغرافية، مواقع المخيمات
- الوصول: data.unhcr.org/syrianrefugees، تنزيل مجاني
- الترخيص: المشاع الإبداعي — نسب المصدر

**منصة تبادل البيانات الإنسانية HDX — سوريا**
- المزوّد: مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية
- التغطية: السكان والنزوح وتقييمات الاحتياجات و3W (من ماذا أين)
- الوصول: data.humdata.org، تسجيل مجاني
- الترخيص: يتفاوت بحسب مجموعة البيانات؛ معظمها المشاع الإبداعي

---

## الاستشعار عن بُعد — وصول مفتوح

**Sentinel-2 (كوبيرنيكوس/وكالة الفضاء الأوروبية)**
- التغطية: عالمية بما يشمل سوريا؛ دقة 10 متر، متعدد الأطياف
- الوصول: Copernicus Open Access Hub أو عبر Google Earth Engine
- وتيرة التحديث: كل 5 أيام
- الترخيص: مجاني، مفتوح، بلا قيود تجارية

**صور CORONA المُفرَج عنها (الستينيات–1972)**
- التغطية: سوريا والشرق الأوسط بدقة 1–2 متر
- الوصول: USGS Earth Explorer (earthexplorer.usgs.gov)
- الاستخدام: خط أساس ما قبل التطوير؛ يُحدّد المواقع الأثرية والمورفولوجيا الحضرية قبل البناء الحديث
- الترخيص: ملك عام (مُفرَج عنه من الحكومة الأمريكية)`,
    },
  },

  // ─── Resource 2: Remote Documentation Tools ──────────────────────────────
  {
    cover_image_key: null,
    content_type: 'resource',
    status: 'published',
    tags: ['hbim', 'photogrammetry', 'heritage', 'gis', 'tools'],
    metadata: { resource_type: 'tool' },
    en: {
      title: 'Tools for Remote Heritage Documentation Without Site Access',
      content: `A practical guide to software tools and methodologies for documenting heritage sites when physical access is impossible or unsafe. Organised by workflow stage.

---

## Photogrammetry from Archival Sources

**Agisoft Metashape** (agisoft.com)
- Use: Structure from Motion (SfM) photogrammetry — generates 3D point clouds and meshes from overlapping photographs
- For Syrian heritage: Processing pre-war archival photographs of buildings to extract geometry. Works even with non-professional archive photographs if coverage and overlap are sufficient.
- Cost: Commercial (~$3,500 professional); educational/non-profit discounts available
- Output: Point cloud (.LAS), mesh (.OBJ), orthophoto

**RealityCapture** (capturingreality.com)
- Use: High-performance photogrammetry and lidar integration
- Strength: Faster processing than Metashape; better handling of mixed input sources (photos + lidar + drone imagery)
- Cost: Pay-per-use (PPI licensing) or subscription
- Note: Requires GPU; not suitable for low-spec hardware

**COLMAP** (colmap.github.io)
- Use: Open-source SfM and multi-view stereo reconstruction
- For Syrian heritage: Free alternative to commercial tools; suitable for research workflows where reproducibility is important
- Cost: Free, open source (BSD licence)

---

## GIS and Spatial Analysis

**QGIS** (qgis.org)
- Use: Open-source GIS — the standard tool for spatial analysis in research and humanitarian contexts
- Key plugins for Syrian research: HCMGIS (satellite basemaps), QuickMapServices (OpenStreetMap and ESRI layers), Freehand raster georeferencer (aligning historical maps)
- Offline capability: Can be run fully offline with pre-downloaded basemap tiles
- Cost: Free, open source

**ArcGIS Online / ArcGIS Pro** (esri.com)
- Use: Professional GIS platform; better institutional integration than QGIS
- Relevant for Syrian research: ArcGIS Living Atlas Syria layers; ESRI Disaster Response team data
- Cost: Subscription (free for qualifying nonprofits and academic institutions)

**Google Earth Engine** (earthengine.google.com)
- Use: Cloud-based geospatial analysis at scale — change detection, time-series analysis of Sentinel-2 and Landsat
- For Syrian research: Temporal analysis of site conditions without downloading large imagery datasets
- Cost: Free for non-commercial research; registration required

---

## 3D Heritage Visualisation

**Cesium** (cesium.com / cesiumjs.org)
- Use: Open-source platform for 3D geospatial visualisation; handles large point clouds, 3D meshes, and raster overlays within a geographic context
- For Syrian heritage: Multi-temporal 3D site records; combining pre-war and post-war documentation layers
- Cost: Free (CesiumJS open source); CesiumIon cloud hosting has free tier

**CloudCompare** (cloudcompare.org)
- Use: Open-source point cloud processing and analysis
- For Syrian research: Comparing pre-war and post-war point cloud data; measuring deformation and damage
- Cost: Free, open source

---

## Crowd-Sourced Documentation

**Mapillary** (mapillary.com)
- Use: Street-level photography platform with georeferencing
- For Syrian research: Some Syrian cities have coverage from before and during the war; useful for building-level condition documentation at street level
- Access: API for researchers; free

**Manar al-Athar** (manar-al-athar.ox.ac.uk)
- Use: Oxford University photo archive of architectural heritage across the Middle East and North Africa
- Coverage: Thousands of pre-war Syrian heritage photographs systematically catalogued by site, building, and architectural feature
- Access: Free, searchable online database
- Note: The primary archival photography resource for SfM processing of Syrian heritage

---

## Damage Assessment Using Deep Learning

**xBD Dataset and Baseline** (github.com/DIUx-xView/xView2_baseline)
- Use: Pre-trained deep learning models for satellite imagery damage classification
- Limitation for Syria: Models trained on diverse global contexts; accuracy for Syrian urban morphology should be validated before use
- Cost: Free, open source`,
    },
    ar: {
      title: 'أدوات التوثيق عن بُعد للتراث في غياب إمكانية الوصول الميداني',
      content: `دليل عملي لأدوات البرمجيات والمناهج الخاصة بتوثيق المواقع التراثية حين يكون الوصول الجسدي مستحيلاً أو غير آمن. مُنظَّم بحسب مراحل مسار العمل.

---

## التصوير الفوتوغرامتري من المصادر الأرشيفية

**Agisoft Metashape** (agisoft.com)
- الاستخدام: فوتوغرامترية "بنية من الحركة" (SfM) — تُولّد سُحُباً نقطية وشبكات ثلاثية الأبعاد من صور متداخلة
- للتراث السوري: معالجة الصور الأرشيفية قبل الحرب لاستخراج الهندسة. يعمل حتى مع الصور الأرشيفية غير الاحترافية إذا توفّر تغطية كافية وتداخل بين الصور.
- التكلفة: تجاري (~3,500 دولار للنسخة المهنية)؛ خصومات للمؤسسات التعليمية وغير الربحية

**RealityCapture** (capturingreality.com)
- الاستخدام: فوتوغرامترية عالية الأداء وتكامل LiDAR
- نقطة القوة: معالجة أسرع من Metashape؛ تعامل أفضل مع المصادر المختلطة (صور + LiDAR + صور طائرات مسيّرة)
- التكلفة: بالاستخدام أو اشتراك

**COLMAP** (colmap.github.io)
- الاستخدام: إعادة بناء ثلاثي الأبعاد مفتوح المصدر
- للتراث السوري: بديل مجاني للأدوات التجارية؛ مناسب لمسارات البحث التي تُولي القابلية للتكرار أهمية
- التكلفة: مجاني، مفتوح المصدر

---

## نظم المعلومات الجغرافية والتحليل المكاني

**QGIS** (qgis.org)
- الاستخدام: نظام معلومات جغرافية مفتوح المصدر — الأداة المعيارية للتحليل المكاني في السياقات البحثية والإنسانية
- إضافات مفيدة للبحث السوري: HCMGIS (خرائط قاعدية من الأقمار الصناعية)، QuickMapServices (طبقات OpenStreetMap وESRI)، Freehand raster georeferencer (محاذاة الخرائط التاريخية)
- إمكانية العمل بلا اتصال: تعمل دون اتصال بالإنترنت مع بلاطات خرائط قاعدية مُنزَّلة مسبقاً
- التكلفة: مجاني، مفتوح المصدر

**Google Earth Engine** (earthengine.google.com)
- الاستخدام: تحليل جيومكاني قائم على الحوسبة السحابية — كشف التغييرات وتحليل السلاسل الزمنية لـ Sentinel-2 وLandsat
- للبحث السوري: تحليل زمني لأحوال المواقع دون تنزيل مجموعات صور ضخمة
- التكلفة: مجاني للبحث غير التجاري

---

## التصوير ثلاثي الأبعاد للتراث

**Cesium** (cesiumjs.org)
- الاستخدام: منصة مفتوحة المصدر للتصور الجغرافي ثلاثي الأبعاد؛ تتعامل مع السُحُب النقطية الضخمة والشبكات والطبقات النقطية ضمن سياق جغرافي
- للتراث السوري: سجلات مواقع ثلاثية الأبعاد متعددة الأبعاد الزمنية؛ الجمع بين طبقات التوثيق قبل الحرب وبعدها
- التكلفة: مجاني (CesiumJS مفتوح المصدر)

---

## التوثيق التشاركي

**منار الأثر** (manar-al-athar.ox.ac.uk)
- الاستخدام: أرشيف صور جامعة أكسفورد للتراث المعماري في الشرق الأوسط وشمال أفريقيا
- التغطية: آلاف الصور السورية قبل الحرب مُفهرَسة بحسب الموقع والمبنى والسمة المعمارية
- الوصول: مجاني، قاعدة بيانات قابلة للبحث إلكترونياً
- ملاحظة: المصدر الأرشيفي الأساسي لمعالجة SfM للتراث السوري`,
    },
  },

  // ─── Resource 3: Research Papers ─────────────────────────────────────────
  {
    cover_image_key: null,
    content_type: 'resource',
    status: 'published',
    tags: ['research-methodology', 'heritage', 'hbim', 'gis', 'documentation'],
    metadata: { resource_type: 'reading_list' },
    en: {
      title: 'Research Papers on Data-Driven Approaches to Heritage Documentation in Wartime',
      content: `An annotated bibliography of directly relevant academic papers on data-driven methodologies for heritage documentation in conflict and post-war contexts. Each entry includes full citation, open-access status, key methodological contribution, and applicability to Syrian research.

---

## Heritage BIM and Digital Documentation

**Saricaoglu, T. & Saygi, G. (2021). "Data-Driven Conservation Actions of Heritage Places Curated with HBIM."**
*International Archives of the Photogrammetry, Remote Sensing and Spatial Information Sciences*
- Key contribution: Systematic framework for using HBIM to document, classify, and prioritise conservation interventions at heritage sites. Demonstrates how data-driven decision rules can replace ad hoc judgement in conservation planning.
- Applicability to Syria: Provides the methodological template for remote HBIM from archival sources. The decision framework for "rebuild / reconstruct / memorialise" is directly applicable to Syrian reconstruction planning.
- Open access: Yes — ISPRS Archives

**Hassan, A.M., Lee, H. & Yoo, U. (2014). "From Medieval Cairo to Modern Masdar City: Lessons Learned through a Comparative Study."**
*Sustainable Cities and Society*
- Key contribution: Quantitative comparison of traditional Islamic urban morphology with computationally-designed Masdar City across climate performance metrics. Demonstrates that medieval urban fabric performs comparably to purpose-designed passive cooling solutions.
- Applicability to Syria: The methodological framework for comparing pre-war Syrian urban morphology with climate performance standards. The paper's Cairo metrics are directly analogous to Damascus and Aleppo.
- Open access: Contact authors or via institutional access

**Rabbat, N. (2012). "What is Islamic Architecture Anyway?"**
*Journal of Art Historiography*
- Key contribution: Critical deconstruction of "Islamic architecture" as a scholarly and practical category. Argues that the term conceals more than it reveals and cannot serve as a guide for reconstruction decisions.
- Applicability to Syria: Essential critical framework for any reconstruction project that appeals to "Islamic architecture" as justification for design decisions.
- Open access: Yes — available on academia.edu

---

## GIS in Archaeology and Heritage

**Carranza-Cañadas, P. et al. "Digital Technology to Locate the Water Catchment System of the 'Cuadrado' Fountain in Montilla (Córdoba, Spain) in the 19th Century."**
*Applied Sciences*
- Key contribution: Methodology for using historical records, photogrammetry, GIS, and ground-penetrating radar to locate, document, and analyse a 19th-century water management system that had fallen out of use.
- Applicability to Syria: Direct methodological template for documenting Syria's qanat and aflaj systems from archival and remote sources.
- Open access: Yes — MDPI Applied Sciences

**Saricaoglu, T. & Saygi, G. "Applying a GIS to the Underwater Archaeology of Menorca."**
- Key contribution: GIS methodology for heritage sites with restricted physical access, using multi-source data integration and uncertainty documentation.
- Applicability to Syria: The restricted-access methodology is directly transferable to Syrian sites in areas that remain inaccessible.

---

## Conflict Heritage and Damage Assessment

**Stone, E. (2008). "Patterns of Looting in Southern Iraq."**
*Antiquity*
- Key contribution: Pioneering use of satellite imagery change detection for systematic documentation of heritage site looting. Established the methodological framework that UNOSAT and ASOR CHI subsequently applied in Syria.
- Open access: Yes — Antiquity

**Brodie, N. & Sabrine, I. (2018). "The Illegal Excavation and Trade of Syrian Cultural Property."**
*Journal of Field Archaeology*
- Key contribution: Systematic analysis of looting patterns in Syrian heritage sites using satellite imagery and market data. Identifies which site types are most targeted and why.
- Open access: Limited; contact authors

---

## Further Reading

**SAFER Network (2020). "Guidelines for Damage Assessment of Built Cultural Heritage."**
- Key contribution: Standardised protocol for field damage assessment of built heritage, adaptable to remote assessment methodologies.
- Access: Free PDF from safernetrwork.eu

**Getty Conservation Institute (2016). "Values and Heritage Conservation."**
- Key contribution: Theoretical framework for deciding what is worth conserving and on what grounds — directly relevant to reconstruction priority decisions.
- Access: Free PDF from getty.edu`,
    },
    ar: {
      title: 'أوراق بحثية حول المناهج المعتمدة على البيانات في توثيق التراث أيام الحرب',
      content: `ببليوغرافيا معلَّقة للأوراق الأكاديمية ذات الصلة المباشرة بالمناهج القائمة على البيانات لتوثيق التراث في سياقات الحرب وما بعدها. تتضمن كل حقيقة التوثيق الكامل وحالة الوصول المفتوح والإسهام المنهجي الأساسي وقابلية التطبيق على البحث السوري.

---

## نمذجة معلومات مباني التراث والتوثيق الرقمي

**صاريجاوغلو، ت. وسايغي، غ. (2021). "إجراءات الحفاظ القائمة على البيانات للمواقع التراثية باستخدام HBIM"**
*أرشيف ISPRS الدولي للتصوير الفوتوغرامتري*
- الإسهام الأساسي: إطار منهجي لاستخدام HBIM في توثيق مواقع التراث وتصنيف التدخلات الترميمية وتحديد أولوياتها. يُبيّن كيف يمكن لقواعد القرار المعتمدة على البيانات أن تحلّ محل الحكم التقديري في التخطيط للحفاظ.
- التطبيق على سوريا: يُقدّم النموذج المنهجي لنمذجة HBIM عن بُعد من المصادر الأرشيفية.
- الوصول المفتوح: نعم — أرشيف ISPRS

**حسن، ع. م. ولي، هـ. ويو، أ. (2014). "من القاهرة الوسيطة إلى مدينة ماسدار الحديثة: دروس من دراسة مقارنة"**
*مدن وجمعيات مستدامة*
- الإسهام الأساسي: مقارنة كمّية للمورفولوجيا الحضرية الإسلامية التقليدية مع مدينة ماسدار المصمَّمة حسابياً عبر مؤشرات الأداء المناخي. يُثبت أن النسيج الحضري الوسيط يُحقّق أداءً مماثلاً لحلول التبريد السلبي المصمَّمة بهدف خاص.
- التطبيق على سوريا: الإطار المنهجي لمقارنة المورفولوجيا الحضرية السورية قبل الحرب مع معايير الأداء المناخي.
- الوصول: عبر الوصول المؤسسي

**رباط، ن. (2012). "ما العمارة الإسلامية أصلاً؟"**
*مجلة تاريخ الفن*
- الإسهام الأساسي: تفكيك نقدي لـ"العمارة الإسلامية" بوصفها فئة أكاديمية وعملية. يُقدّم حجة بأن المصطلح يُخفي أكثر مما يكشف ولا يمكنه أن يُرشد قرارات إعادة الإعمار.
- التطبيق على سوريا: إطار نقدي أساسي لأي مشروع إعادة إعمار يستند إلى "العمارة الإسلامية" مسوّغاً لقرارات التصميم.
- الوصول المفتوح: نعم — متاح على academia.edu

---

## نظم المعلومات الجغرافية في الآثار والتراث

**كارانثا-كانادس، ب. وآخرون. "التقنية الرقمية لتحديد موقع نظام تجميع مياه نافورة الكوادرادو في مونتيليا (قرطبة، إسبانيا) في القرن التاسع عشر"**
*العلوم التطبيقية*
- الإسهام الأساسي: منهجية لاستخدام السجلات التاريخية والتصوير الفوتوغرامتري ونظم المعلومات الجغرافية والرادار الأرضي لتحديد موقع نظام إدارة مياه من القرن التاسع عشر وتوثيقه وتحليله.
- التطبيق على سوريا: نموذج منهجي مباشر لتوثيق القنوات والأفلاج السورية من المصادر الأرشيفية والبعيدة.
- الوصول المفتوح: نعم — MDPI Applied Sciences

---

## تراث الحرب وتقييم الأضرار

**ستون، إ. (2008). "أنماط النهب في جنوب العراق"**
*مجلة أنتيكويتي*
- الإسهام الأساسي: الاستخدام الرائد لكشف التغييرات في صور الأقمار الصناعية للتوثيق المنهجي لنهب المواقع التراثية. أسّس الإطار المنهجي الذي طبّقته لاحقاً يونوسات وASOR CHI في سوريا.
- الوصول المفتوح: نعم

**برودي، ن. وصبرين، إ. (2018). "التنقيب غير القانوني وتجارة الممتلكات الثقافية السورية"**
*مجلة آثار الحقل*
- الإسهام الأساسي: تحليل منهجي لأنماط نهب المواقع التراثية السورية باستخدام صور الأقمار الصناعية وبيانات السوق.
- الوصول: محدود؛ تواصل مع المؤلفين`,
    },
  },

  // ─── Resource 4: Biomimicry / Climate Responsive Design ──────────────────
  {
    cover_image_key: null,
    content_type: 'resource',
    status: 'published',
    tags: ['biomimicry', 'sustainability', 'climate-adaptation', 'architecture', 'humanitarian-design'],
    metadata: { resource_type: 'reading_list' },
    en: {
      title: 'Biomimicry and Climate-Responsive Design Resources for Syrian Reconstruction',
      content: `A curated collection of resources on biomimicry, passive climate design, and vernacular architecture — filtered for relevance to the hot-arid and Mediterranean climatic zones that characterise most of Syria. Includes foundational texts, case studies, and technical tools.

---

## Foundational Texts

**Benyus, J. (1997). "Biomimicry: Innovation Inspired by Nature."** Harper Collins.
- Overview: The book that established biomimicry as a design field. Chapters on self-assembly, running on sunlight, and fitting form to function are directly relevant to post-war building design under resource constraints.
- Relevance to Syria: The concept of "conditions of life" as design constraints maps directly onto the constraints of reconstruction: scarce skilled labour, interrupted supply chains, extreme climate, and the need for structures that local communities can maintain.

**Norman, D. (2013). "The Design of Everyday Things."** Basic Books.
- Relevance: Foundation text on user-centred design; relevant for understanding how rebuilt Syrian spaces need to work for their users, not just perform climatically or look architecturally appropriate.

---

## Case Studies

**Eastgate Centre, Harare, Zimbabwe** (Mick Pearce / Arup, 1996)
- Concept: Termite mound ventilation applied to a commercial building; eliminates mechanical cooling in a hot climate through passive air circulation and high thermal mass.
- Resources: Published case study in Arup Journal; Mick Pearce's own documentation at mickpearce.com
- Relevance to Syria: Passive cooling for community buildings in reconstruction contexts; principle of thermal mass + passive ventilation applicable to rebuilt Syrian masonry construction.

**Masdar City, Abu Dhabi** (Foster + Partners, under construction)
- Resources: Hassan, Lee & Yoo comparative study (cited in reading list above); Autodesk Forma analysis; multiple peer-reviewed performance studies
- Critical note: Masdar is often cited as proof of concept for climate-responsive Islamic urbanism; its actual performance versus its design claims should be checked against independent monitoring data.

---

## Technical Tools

**Ladybug Tools** (ladybug.tools)
- What it is: A collection of free, open-source environmental analysis tools that integrate with Rhino/Grasshopper
- Relevant tools: Ladybug (climate analysis, sun path, wind rose), Honeybee (EnergyPlus/OpenStudio thermal simulation), Dragonfly (urban microclimate)
- Relevance to Syria: Running retrospective microclimate analysis of pre-war Syrian urban morphology; evaluating proposed reconstruction scenarios for climate performance before building

**AskNature Database** (asknature.org)
- What it is: The Biomimicry Institute's database of biological strategies searchable by function
- Search terms relevant to Syrian reconstruction: "regulate temperature," "collect water," "manage wind," "distribute resources," "resist stress"

**Climate Consultant** (energy-design-tools.aud.ucla.edu)
- What it is: Free tool for analysing climate data and identifying passive design strategies appropriate to a specific climate
- Relevance: Syrian climate files (.epw) are available from EnergyPlus.net for Aleppo, Damascus, Deir ez-Zor, and Latakia; Climate Consultant can generate passive design strategy recommendations for each

---

## Syrian Vernacular Architecture

**World Monuments Fund — Aleppo Recovery**
- Documentation of pre-war vernacular construction techniques and materials in the Aleppo context, relevant for reconstruction approaches.
- Access: wmf.org/project/aleppo-recovery

**Aga Khan Award for Architecture archives**
- Documenting award-winning projects that engage with vernacular Middle Eastern and Syrian architecture; useful precedent studies.
- Access: akdn.org/architecture/awards

**AKTC Aleppo Rehabilitation Programme documentation**
- Technical documentation of AKTC's pre-war and post-war work in the Aleppo old city.
- Access: Through AKTC on request`,
    },
    ar: {
      title: 'موارد التصميم المستوحى من الطبيعة والاستجابة المناخية لإعادة الإعمار السوري',
      content: `مجموعة منتقاة من الموارد حول المحاكاة الطبيعية والتصميم المناخي السلبي والعمارة المحلية — مُصفَّاة لملاءمة المناطق المناخية الحارة الجافة والمتوسطية التي تُهيمن على معظم سوريا. تشمل نصوصاً أساسية ودراسات حالة وأدوات تقنية.

---

## النصوص الأساسية

**بينيوس، ج. (1997). "المحاكاة الطبيعية: الابتكار المستوحى من الطبيعة."** هاربر كولنز.
- نظرة عامة: الكتاب الذي أرسى المحاكاة الطبيعية بوصفها مجالاً تصميمياً. فصول عن التجميع الذاتي والعمل بالطاقة الشمسية وملاءمة الشكل للوظيفة ذات صلة مباشرة بتصميم المباني بعد الحرب في ظل قيود الموارد.
- الصلة بسوريا: مفهوم "ظروف الحياة" بوصفها قيود تصميمية ينعكس مباشرةً على قيود إعادة الإعمار.

---

## دراسات الحالة

**مركز Eastgate، هراري، زيمبابوي** (ميك بيرس / أراب، 1996)
- المفهوم: تطبيق تهوية تلة النمل الأبيض على مبنى تجاري؛ يُلغي الحاجة إلى التبريد الميكانيكي في مناخ حار عبر دوران الهواء السلبي والكتلة الحرارية العالية.
- الصلة بسوريا: التبريد السلبي للمباني المجتمعية في سياق إعادة الإعمار؛ مبدأ الكتلة الحرارية + التهوية السلبية قابل للتطبيق على البناء الحجري السوري المُعاد إنشاؤه.

**مدينة ماسدار، أبوظبي** (فوستر + شركاه، قيد الإنشاء)
- الموارد: الدراسة المقارنة لحسن ولي ويو؛ تحليلات Autodesk Forma؛ دراسات أداء محكَّمة متعددة.
- ملاحظة نقدية: يُستشهَد بماسدار كثيراً دليلاً على جدوى التخطيط الحضري المستجيب مناخياً؛ يجب التحقق من أدائها الفعلي مقارنةً بادعاءات التصميم عبر بيانات رصد مستقلة.

---

## الأدوات التقنية

**Ladybug Tools** (ladybug.tools)
- ما هي: مجموعة أدوات تحليل بيئي مجانية مفتوحة المصدر تتكامل مع Rhino/Grasshopper
- الأدوات ذات الصلة: Ladybug (تحليل المناخ ومسار الشمس وردة الرياح)، Honeybee (محاكاة طاقة EnergyPlus)، Dragonfly (المناخ الدقيق الحضري)
- الصلة بسوريا: إجراء تحليل مناخ دقيق استرجاعي للمورفولوجيا الحضرية السورية قبل الحرب؛ تقييم سيناريوهات إعادة الإعمار المقترحة قبل البناء

**قاعدة بيانات AskNature** (asknature.org)
- ما هي: قاعدة بيانات معهد المحاكاة الطبيعية للاستراتيجيات البيولوجية قابلة للبحث بالوظيفة
- مصطلحات بحث ذات صلة بإعادة الإعمار السوري: "تنظيم الحرارة"، "تجميع المياه"، "إدارة الرياح"، "توزيع الموارد"، "مقاومة الإجهاد"

**Climate Consultant** (energy-design-tools.aud.ucla.edu)
- ما هو: أداة مجانية لتحليل بيانات المناخ وتحديد استراتيجيات التصميم السلبي المناسبة لمناخ محدد
- الصلة: ملفات المناخ السورية (.epw) متاحة من EnergyPlus.net لحلب ودمشق ودير الزور واللاذقية

---

## العمارة المحلية السورية

**صندوق الآثار العالمي — إعادة إعمار حلب**
- توثيق تقنيات البناء التقليدية والمواد في سياق حلب، ذو صلة بمناهج إعادة الإعمار.
- الوصول: wmf.org/project/aleppo-recovery

**أرشيف جائزة آغا خان للعمارة**
- توثيق المشاريع الحائزة على الجائزة التي تتفاعل مع العمارة الشرق أوسطية والسورية التقليدية.
- الوصول: akdn.org/architecture/awards`,
    },
  },

  // ─── Resource 5: Statistics and Data Visualization ───────────────────────
  {
    cover_image_key: null,
    content_type: 'resource',
    status: 'published',
    tags: ['data-visualization', 'statistics', 'humanitarian-research', 'research-methodology'],
    metadata: { resource_type: 'methodology' },
    en: {
      title: 'Statistics and Data Visualization Resources for Humanitarian Research',
      content: `A methodological resource for researchers who need to collect, analyse, and present data about Syria, displacement, and conflict-affected communities responsibly and rigorously. Covers data sources, visualisation tools, and critical frameworks for bias and ethical analysis.

---

## Primary Data Sources

**UNHCR Global Trends** (unhcr.org/global-trends)
- Refugee and IDP counts, demographic breakdowns, origin and destination countries
- Updated annually; Syria-specific data prominently featured
- Format: CSV, PDF, interactive visualisations

**OCHA Financial Tracking Service** (fts.unocha.org)
- Humanitarian funding flows to Syria; donor contributions, programme allocations
- Useful for: analysing which needs receive funding and which are underfunded

**World Bank Open Data — Syria** (data.worldbank.org/country/SY)
- Pre-war and post-war economic indicators; GDP, poverty, infrastructure
- Limitation: Data collection in-country has been severely disrupted; many series stop in 2010–2011

**Gapminder** (gapminder.org/data)
- Long-term demographic and development data with Syria coverage
- Excellent for historical baseline (pre-2011) and comparative context

**Our World in Data** (ourworldindata.org)
- Aggregated global data with contextual visualisations; Syria series available for conflict mortality, displacement, health outcomes
- Citation standard: Explicitly shows data sources and methodology for every chart

---

## Data Visualization Tools

**RawGraph** (rawgraphs.io)
- Free, browser-based tool for unusual chart types (alluvial diagrams, bump charts, beeswarm plots) not available in standard tools
- No data upload to server; processes locally
- Useful for: visualising displacement flows, funding allocation patterns

**Flourish** (flourish.studio)
- Template-based visualisation platform; easy-to-use, shareable
- Useful for: story-format data presentations; Syria timeline visualisations

**Datawrapper** (datawrapper.de)
- Simple, accessible chart and map tool; widely used in journalism and NGO reporting
- Free tier available

**Observable** (observablehq.com)
- JavaScript-based notebook for custom interactive visualisations
- Useful for: researchers with coding ability who need full control over visual output

---

## Critical Frameworks

**Criado Perez, C. (2019). "Invisible Women: Data Bias in a World Designed for Men."** Chatto & Windus.
- Key argument: Default data collection practices systematically exclude women; this produces datasets that appear neutral but encode male-centred perspectives.
- Apply to Syria: Before using any Syrian dataset, ask: were women included in the sample? Were data collectors able to access women? Do the categories used reflect women's actual activities and needs?

**O'Neil, C. (2016). "Weapons of Math Destruction: How Big Data Increases Inequality and Threatens Democracy."** Crown.
- Key argument: Algorithmic systems trained on historical data encode and amplify existing inequalities; presenting results as "objective" conceals this.
- Apply to Syria: Satellite damage classification algorithms, needs assessment scoring systems, and reconstruction prioritisation tools should be evaluated for whose disadvantage they systematise.

**Knaflic, C.N. (2015). "Storytelling with Data."** Wiley.
- Practical guide to presenting quantitative data clearly and honestly; applicable to any research communication context.

---

## Ethical Visualization Principles for Conflict Data

1. **Show uncertainty.** Never present a confidence interval as a single number, or a range as a point estimate.
2. **Preserve human scale.** When visualising large numbers of deaths or displaced persons, consider whether aggregation obscures individual experience in ways that are harmful.
3. **Attribute every source.** Every number in a chart should be traceable to a specific data collection event.
4. **Be explicit about what the data does not cover.** A population needs assessment that sampled accessible areas does not represent the whole population.
5. **Consider who will use this visualisation and how.** Data about Syrian military positions, individual displacement routes, or household locations should not be visualised in publicly accessible formats.`,
    },
    ar: {
      title: 'موارد الإحصاء وتصوير البيانات للبحث الإنساني',
      content: `مورد منهجي للباحثين الذين يحتاجون إلى جمع البيانات المتعلقة بسوريا والنزوح والمجتمعات المتضررة من الحرب وتحليلها وتقديمها بمسؤولية ودقة. يغطي مصادر البيانات وأدوات التصوير والأطر النقدية للتحيز والتحليل الأخلاقي.

---

## مصادر البيانات الأولية

**الاتجاهات العالمية لـ UNHCR** (unhcr.org/global-trends)
- أعداد اللاجئين والنازحين داخلياً وتوزيعاتهم الديموغرافية وبلدان الأصل والوجهة
- تُحدَّث سنوياً؛ بيانات خاصة بسوريا بارزة
- الصيغة: CSV، PDF، تصورات تفاعلية

**نظام تتبع التمويل OCHA** (fts.unocha.org)
- تدفقات التمويل الإنساني إلى سوريا؛ مساهمات المانحين وتخصيصات البرامج
- مفيد لـ: تحليل الاحتياجات التي تحظى بتمويل وتلك الممولة بشكل منقوص

**البيانات المفتوحة للبنك الدولي — سوريا** (data.worldbank.org/country/SY)
- مؤشرات اقتصادية قبل الحرب وبعدها؛ الناتج المحلي، والفقر، والبنية التحتية
- القيد: جمع البيانات داخل البلاد تعطّل بشدة؛ كثير من السلاسل تتوقف في 2010–2011

**Gapminder** (gapminder.org/data)
- بيانات ديموغرافية وتنموية على المدى البعيد مع تغطية سورية
- ممتاز للخط الأساسي التاريخي (ما قبل 2011) والسياق المقارن

**Our World in Data** (ourworldindata.org)
- بيانات عالمية مجمَّعة مع تصورات سياقية؛ سلاسل سورية متاحة للوفيات والنزوح والنتائج الصحية
- معيار الاستشهاد: يُظهر صراحةً مصادر البيانات والمنهجية لكل رسم

---

## أدوات تصوير البيانات

**RawGraph** (rawgraphs.io)
- أداة مجانية تعمل في المتصفح لأنواع رسوم غير تقليدية
- لا ترفع البيانات إلى خادم؛ تعالجها محلياً
- مفيد لـ: تصوير تدفقات النزوح وأنماط تخصيص التمويل

**Flourish** (flourish.studio)
- منصة تصوير قائمة على نماذج؛ سهلة الاستخدام وقابلة للمشاركة
- مفيد لـ: العروض التقديمية بأسلوب القصة؛ تصورات الجدول الزمني السوري

**Datawrapper** (datawrapper.de)
- أداة رسوم وخرائط بسيطة وميسورة؛ مستخدَمة على نطاق واسع في الصحافة وتقارير المنظمات غير الحكومية

---

## الأطر النقدية

**كريادو بيريز، ك. (2019). "النساء غير المرئيات: تحيز البيانات في عالم مصمَّم للرجال."**
- الحجة الأساسية: ممارسات جمع البيانات الافتراضية تستثني النساء منهجياً.
- التطبيق على سوريا: قبل استخدام أي مجموعة بيانات سورية، اسأل: هل أُدرجت النساء في العينة؟ هل استطاع جامعو البيانات الوصول إلى النساء؟

**أونيل، ك. (2016). "أسلحة تدمير رياضية: كيف تزيد البيانات الضخمة من عدم المساواة."**
- الحجة الأساسية: الأنظمة الخوارزمية المدرَّبة على بيانات تاريخية تُرسّخ التفاوتات القائمة وتُضخّمها.
- التطبيق على سوريا: يجب تقييم خوارزميات تصنيف الأضرار وأنظمة تسجيل الاحتياجات وأدوات تحديد أولويات إعادة الإعمار من حيث من تُنظّم إضراره.

---

## مبادئ التصوير الأخلاقي لبيانات الحرب

1. **أظهر عدم اليقين.** لا تُقدّم أبداً نطاق ثقة كرقم واحد.
2. **احافظ على المقياس الإنساني.** حين تُصوّر أعداداً كبيرة من الوفيات أو النازحين، تأمّل هل يُخفي التجميع التجربة الفردية.
3. **انسب كل مصدر.** كل رقم في رسم بياني يجب أن يكون قابلاً للتتبع إلى حدث جمع بيانات محدد.
4. **صرّح بما لا تُغطّيه البيانات.** تقييم احتياجات عيّنته المناطق الميسورة الوصول لا يُمثّل المجموع الكلي للسكان.`,
    },
  },
]
