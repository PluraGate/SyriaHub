import type { SeedPost } from '../types'

export const articles: SeedPost[] = [
  // ─── Article 1: GIS ──────────────────────────────────────────────────────
  {
    cover_image_key: 'scan-dec17-a',
    content_type: 'article',
    status: 'published',
    tags: ['gis', 'heritage-conservation', 'syria', 'spatial-data', 'documentation'],
    en: {
      title: 'GIS for Heritage Documentation in Wartime Syria',
      content: `## Why Geography Is Evidence

When a building is destroyed, what remains is location. Coordinates, extents, relationships to streets and water and other buildings — the spatial record outlasts the physical one. Geographic Information Systems (GIS) have become the primary tool for documenting Syrian heritage not because they are perfect, but because they can be operated remotely, updated continuously, and queried against other datasets in ways that photographs and written records cannot.

This article surveys the practical state of GIS-based heritage documentation in Syria: what datasets exist, where the coverage gaps are, and what workflows allow researchers to contribute meaningfully even without access to sites.

## What GIS Actually Captures

GIS is not a single tool but a family of spatial data practices. In the Syrian heritage context it encompasses:

- **Change detection** — comparing multi-temporal satellite imagery to identify structural damage, demolition, or illegal excavation. UNOSAT and AAAS have published systematic assessments of Aleppo, Homs, Raqqa, and Deir ez-Zor using this method.
- **Site condition mapping** — point and polygon layers recording the known state of heritage sites, updated as new imagery or field reports become available. ASOR Cultural Heritage Initiatives maintains the most comprehensive public database of this kind.
- **Infrastructure proximity analysis** — understanding how damage to roads, bridges, and water systems affects site access and the survival of salvage operations.
- **Landscape archaeology** — identifying unregistered or poorly documented sites from CORONA and Landsat imagery before conflict damage erases surface evidence entirely.

## Available Datasets

The following are directly useful for Syrian heritage research and openly accessible:

**UNOSAT Conflict Monitoring** — satellite-derived damage assessments for major Syrian cities. Coverage is urban-focused; rural and peri-urban sites are substantially underrepresented. Available at unosat.org.

**ASOR Cultural Heritage Initiatives** — the most granular open dataset for Syrian heritage site damage. Reports are site-level, updated periodically, with source documentation. Searchable at asor-syrianheritage.org.

**OpenStreetMap Humanitarian Layer** — community-maintained spatial data including roads, buildings, and POIs. Quality varies sharply by region; Aleppo and Damascus are well-mapped, rural Idlib is not.

**Copernicus Emergency Management Service** — post-event damage assessments for activations covering Syrian events. Full archive accessible at emergency.copernicus.eu.

**Aga Khan Trust for Culture** — pre-war digital survey data for selected sites (including parts of Aleppo's old city) is available to researchers on request through formal agreements.

## Working Without Site Access

The most consequential methodological shift in Syrian heritage documentation has been the acceptance of remote sensing as primary evidence. This is not an ideal workaround — it is the only option for most sites. The practical workflow for a researcher with no field access:

1. Establish a spatial baseline from archival satellite imagery (Google Earth historical layers, CORONA 1960s–1970s declassified imagery, pre-war Bing/Esri basemaps).
2. Download the most recent high-resolution imagery available (Planet Labs, Maxar via Humanitarian Data Exchange, Sentinel-2 open access).
3. Perform manual or semi-automated change detection to identify structural alterations.
4. Cross-reference findings against ASOR CHI, UNESCO, and ALIPH incident reports.
5. Record uncertainty explicitly — note the acquisition date of each image, the resolution limitations, and any occlusion by smoke, dust, or vegetation.

Offline QGIS with pre-downloaded tile caches is the standard field tool for researchers with intermittent connectivity. The QGIS Humanitarian Data Exchange plugin simplifies access to HDX layers directly within the application.

## Case: Tell Ain Dara and Madinat al-Far

Tell Ain Dara (Afrin district) sustained severe damage to its Neo-Hittite temple reliefs in January 2018. Satellite imagery published by the American Schools of Oriental Research confirmed extensive looting and structural collapse. The site had no pre-war 3D survey. All that remains for reconstruction planning is a set of published photographs, the ASOR damage assessment polygon, and a handful of Ottoman-era survey sketches in Istanbul archives.

Madinat al-Far (Raqqa governorate) presents a different problem: an Iron Age and early Islamic site that was substantially unexcavated before the war. CORONA imagery suggests surface scatter over a large area. No GIS layer records the full site extent. Any post-war assessment risks misidentifying the site boundary entirely.

Both cases illustrate the same underlying gap: the absence of a systematic sub-site resolution GIS database, created before or early in the war, that would allow genuine damage quantification rather than qualitative description.

## Limitations and Responsibilities

GIS data about Syrian heritage carries risks that researchers must acknowledge. Precise coordinates of unexcavated sites can guide looting as readily as they guide conservation. Data sharing protocols must distinguish between what is published openly, what is shared with verified researchers, and what is withheld entirely.

GPS jamming in active conflict zones has historically degraded the accuracy of field-collected coordinates. Researchers should record estimated positional error alongside all field-collected data.

Data sovereignty is unresolved. International organisations hold substantial spatial data about Syrian heritage that Syrian researchers, institutions, and communities cannot access. This is both an epistemic and a political problem.

## Toward a Syrian Heritage GIS Repository

What does not yet exist — and urgently needs to — is a centralised, systematically maintained GIS database recording heritage site damage at sub-site resolution, with versioned updates, open access for verified researchers, and clear data governance by Syrian institutions. The technical barriers are manageable. The institutional and political barriers are not. This is a research gap that SyriaHub is positioned to help address.`,
    },
    ar: {
      title: 'نظم المعلومات الجغرافية لتوثيق التراث في زمن الحرب على سوريا',
      content: `## لماذا الجغرافيا دليلٌ وشاهد

حين يُدمَّر مبنى، يبقى الموقع. الإحداثيات، والامتدادات المكانية، والعلاقة بالشوارع والمياه والمباني المجاورة — السجلُّ المكاني يصمد بعد زوال المادة. باتت نظم المعلومات الجغرافية (GIS) الأداةَ الأولى لتوثيق التراث السوري؛ ليس لأنها مثالية، بل لأنها تعمل عن بُعد، وتُحدَّث باستمرار، وتُقارَن مع مجموعات بيانات أخرى بطرق لا تستطيعها الصور أو الوثائق المكتوبة.

تستعرض هذه المقالة الحالة الراهنة لتوثيق التراث بالاعتماد على نظم المعلومات الجغرافية في سوريا: ما البيانات المتاحة، وأين الثغرات، وما المسارات التي تتيح للباحثين المساهمة دون الوصول إلى المواقع.

## ما الذي تُسجّله نظم المعلومات الجغرافية فعلاً

نظم المعلومات الجغرافية ليست أداةً واحدة، بل منظومة من ممارسات البيانات المكانية. في سياق التراث السوري، تشمل:

- **كشف التغييرات** — مقارنة صور الأقمار الصناعية عبر الزمن لرصد الأضرار الهيكلية، وعمليات الهدم، والتنقيب غير المشروع. نشرت كلٌّ من يونوسات والجمعية الأمريكية للتقدم في العلوم تقييمات منهجية لحلب وحمص والرقة ودير الزور بهذه الطريقة.
- **رسم خرائط حالة المواقع** — طبقات نقطية ومضلّعة تُسجّل الحالة المعروفة للمواقع التراثية، مُحدَّثة كلما توفّرت صور جديدة أو تقارير ميدانية. تُعدّ قاعدة بيانات مبادرات التراث الثقافي لـ ASOR الأشمل والأكثر إتاحةً في هذا المجال.
- **تحليل القرب من البنية التحتية** — فهم كيف تُؤثّر الأضرار اللاحقة بالطرق والجسور والمياه على إمكانية الوصول إلى المواقع واستمرارية عمليات الإنقاذ.
- **الأثريات الإقليمية** — رصد المواقع غير المسجّلة أو المُوثَّقة توثيقاً منقوصاً من خلال صور CORONA وLandsat قبل أن تمحو الحرب الأدلة السطحية كلياً.

## البيانات المتاحة

البيانات التالية مفيدة مباشرةً لأبحاث التراث السوري ومتاحة للجمهور:

**يونوسات لرصد الحرب** — تقييمات أضرار مستمَدة من صور الأقمار الصناعية للمدن السورية الكبرى. التغطية مُركَّزة في المناطق الحضرية؛ المواقع الريفية وشبه الحضرية ممثَّلة تمثيلاً ضعيفاً. متاحة على unosat.org.

**مبادرات التراث الثقافي ASOR** — أدق قاعدة بيانات مفتوحة لتوثيق أضرار المواقع التراثية السورية. التقارير بمستوى الموقع، تُحدَّث دورياً، مع توثيق المصادر. قابلة للبحث على asor-syrianheritage.org.

**الطبقة الإنسانية لخرائط OpenStreetMap** — بيانات مكانية يُسهم في صيانتها المجتمع، تشمل الطرق والمباني ونقاط الاهتمام. تتفاوت الجودة تفاوتاً حاداً بين المناطق؛ حلب ودمشق موثَّقتان جيداً، ريف إدلب أقل بكثير.

**خدمة كوبيرنيكوس لإدارة الطوارئ** — تقييمات الأضرار للأحداث السورية المُفعَّلة. يمكن الوصول إلى الأرشيف الكامل على emergency.copernicus.eu.

**مؤسسة آغا خان للثقافة** — بيانات مسح رقمي ما قبل الحرب لمواقع مختارة، منها أجزاء من مدينة حلب القديمة، متاحة للباحثين عبر اتفاقيات رسمية.

## العمل بلا وصول ميداني

التحوّل المنهجي الأهم في توثيق التراث السوري هو قبول الاستشعار عن بُعد دليلاً أساسياً. ليس هذا حلاً بديلاً مؤقتاً — بل هو الخيار الوحيد المتاح لمعظم المواقع. المسار العملي للباحث الذي لا يستطيع الوصول الميداني:

1. إنشاء خط أساس مكاني من صور أرشيفية (الطبقات التاريخية في Google Earth، صور CORONA المُفرَج عنها من الستينيات والسبعينيات، خرائط Bing/Esri قبل الحرب).
2. تنزيل أحدث صور عالية الدقة المتاحة (Planet Labs، Maxar عبر منصة تبادل البيانات الإنسانية، Sentinel-2 المفتوح المصدر).
3. إجراء كشف التغييرات يدوياً أو بأدوات شبه آلية لتحديد التعديلات الهيكلية.
4. مقارنة النتائج مع تقارير ASOR CHI واليونسكو وALIPH.
5. توثيق عدم اليقين بصراحة — تاريخ التقاط كل صورة، حدود الدقة، وأي حجب بسبب الدخان أو الغبار أو الغطاء النباتي.

يُعدّ QGIS بلا اتصال مع ذاكرة تخزين مؤقتة مُحمَّلة مسبقاً الأداةَ الميدانية المعتمدة للباحثين في بيئات الاتصال المتقطّع.

## حالتا تل عين دارا ومدينة الفار

تعرّض تل عين دارا (منطقة عفرين) لأضرار جسيمة في نقوشه الحجرية النيو-حثية في يناير 2018. أكّدت صور الأقمار الصناعية التي نشرتها ASOR نهب واسع النطاق وانهياراً هيكلياً. لم تخضع المواقع لمسح ثلاثي الأبعاد قبل الحرب. ما تبقّى لتخطيط إعادة الإعمار لا يعدو مجموعةً من الصور المنشورة، وكثافةَ ASOR للضرر، وعدداً من رسومات المسح العثمانية المحفوظة في أرشيفات إسطنبول.

مدينة الفار (محافظة الرقة) تُقدّم مشكلة مختلفة: موقع من العصر الحديدي والإسلامي المبكر كان إلى حدٍّ بعيد غير مُنقَّب قبل الحرب. تُشير صور CORONA إلى انتشار للبقايا السطحية على رقعة واسعة، دون أي طبقة GIS تُحدّد حدود الموقع الكاملة. أي تقييم لما بعد الحرب يجازف بتحديد حدود الموقع بالكامل بطريقة خاطئة.

كلتا الحالتين تُجسّد الثغرة ذاتها: غياب قاعدة بيانات جغرافية منهجية على مستوى دقيق داخل الموقع، كان يُفترض إنشاؤها قبل الحرب أو في مراحلها الأولى، لتُتيح قياساً حقيقياً للأضرار لا مجرد وصف نوعي.

## نحو مستودع جغرافي للتراث السوري

ما لا يوجد بعد — وهو أمر عاجل — قاعدة بيانات جغرافية مركزية، تُصان بمنهجية، تُسجّل أضرار مواقع التراث على مستوى دقيق داخل كل موقع، مع تحديثات مُؤرشفة زمنياً، وإتاحة مفتوحة للباحثين الموثوقين، وحوكمة بيانات واضحة بقيادة مؤسسات سورية. العوائق التقنية محدودة. العوائق المؤسسية والسياسية أعمق بكثير. هذه ثغرة بحثية يمكن لـ SyriaHub أن يُسهم في معالجتها.`,
    },
  },

  // ─── Article 2: HBIM ─────────────────────────────────────────────────────
  {
    cover_image_key: 'scan-dec17-b',
    content_type: 'article',
    status: 'published',
    tags: ['hbim', 'heritage-conservation', 'syria', 'digital-documentation', 'aleppo'],
    en: {
      title: 'Documenting What\'s Lost: HBIM for Syrian Built Heritage',
      content: `## The Problem of the Unreachable Site

Heritage Building Information Modelling (HBIM) was developed as a tool for managing and conserving standing structures: capturing as-built geometry through laser scanning or photogrammetry, enriching it with material, historical, and maintenance data, and using the resulting model for conservation planning, guided intervention, and long-term management.

Syria challenges every assumption in that workflow. Laser scanning is impossible when a site is in a conflict zone or occupied. Photogrammetry requires proximity. And the buildings that most urgently need modelling — Aleppo's medieval Khan al-Wazir, the Umayyad Mosque before its minaret was destroyed, the stelae at Tell Ain Dara — were never modelled before the damage occurred.

What HBIM can still offer for Syrian heritage is not the clean, complete workflow its developers envisioned. It is something more fragmentary and more urgent: a methodology for building partial models from whatever survives — archival photographs, old survey drawings, traveller sketches, Ottoman land records, and satellite imagery — and using those models to support reconstruction decisions and authenticity assessment.

## Remote HBIM: What It Requires

Building an HBIM model without site access requires three inputs that, in combination, can approximate what direct survey would provide:

**Archival photography.** Pre-war photographs from published sources, institutional archives, and traveller collections can be processed through photogrammetric software (Agisoft Metashape, RealityCapture) to generate point clouds with significant gaps and variable resolution, but real geometric data. The Manar al-Athar archive at the University of Oxford holds thousands of pre-war Syrian heritage photographs systematically catalogued by site.

**Historical drawings and surveys.** Ottoman-era cadastral surveys, early twentieth-century French Mandate documentation, and post-independence Syrian archaeological records exist in scattered archives. The Syrian Directorate-General of Antiquities held substantial pre-war survey material; the accessibility and condition of that archive is itself an open research question.

**Satellite-derived geometry.** Commercial satellite imagery at 30–50cm resolution can establish roofline geometry, building footprint, and relative height for many structures. Combined with known architectural typology, this constrains the model even where direct measurement is impossible.

The resulting HBIM model is not a high-precision digital twin. It is a structured hypothesis about a building's geometry and material composition, with explicit uncertainty bounds attached to each element.

## The Damage Assessment Application

The most immediate use of remote HBIM for Syrian heritage is damage quantification. Once a pre-war model exists — however fragmentary — it can be compared with post-war satellite imagery and published damage assessments to produce a structured record of what has been lost, at what level of confidence.

This matters for reconstruction planning in a specific way: it allows informed decisions about whether a feature should be rebuilt (sufficient evidence exists), reconstructed with acknowledged uncertainty (partial evidence), or memorialised rather than rebuilt (insufficient evidence to justify any particular reconstruction). The distinction is architecturally and ethically significant.

The Saricaoglu and Saygi HBIM methodology paper demonstrates this workflow applied to heritage sites with known damage patterns. Its contribution to Syrian practice is a template for how to systematise these decisions rather than leaving them to ad hoc judgement.

## The Aga Khan Trust and the Aleppo Precedent

The Aga Khan Trust for Culture conducted substantial pre-war conservation work in Aleppo's old city, including digital documentation of selected buildings. After 2011, that documentation became the primary evidence base for understanding what those buildings looked like before damage.

The AKTC's approach in Aleppo since 2018 — working with local craftspeople, Syrian institutions, and international technical advisors — represents the closest existing precedent for HBIM-informed reconstruction in a Syrian context. The methodology they have developed for the al-Madina Souq rehabilitation is directly transferable: systematic survey of surviving fabric, explicit acknowledgement of replaced versus original material, version-controlled records of intervention decisions.

## What an Open HBIM Library Would Enable

The single most valuable infrastructure investment for Syrian heritage documentation would be an open, accessible HBIM library: partial models of threatened and damaged Syrian heritage sites, built from archival sources, with explicit uncertainty documentation, governed by Syrian institutions, and accessible to researchers, conservation practitioners, and reconstruction planners worldwide.

This does not currently exist. The data that would feed it is fragmented across universities, NGOs, government archives, and private collections in multiple countries. Assembling it is a coordination problem as much as a technical one — and it is exactly the kind of structured, collaborative research effort that platforms like SyriaHub are designed to support.`,
    },
    ar: {
      title: 'توثيق ما فُقد: نمذجة معلومات التراث للبيئة المبنية السورية',
      content: `## إشكالية الموقع البعيد المنال

طُوِّرت نمذجة معلومات مباني التراث (HBIM) أصلاً لإدارة المباني القائمة والحفاظ عليها: التقاط هندستها الفعلية بالمسح الليزري أو التصوير الفوتوغرامتري، وإثراؤها ببيانات المواد والتاريخ والصيانة، ثم استخدام النموذج الناتج في تخطيط الترميم وتوجيه التدخل والإدارة على المدى البعيد.

سوريا تُربك كل افتراض في هذا المسار. المسح الليزري مستحيل داخل مناطق الحرب. التصوير الفوتوغرامتري يستلزم القُرب. والمباني الأشد إلحاحاً في الحاجة إلى النمذجة — خان الوزير في حلب القديمة، المسجد الأموي قبل تدمير مئذنته، المسلّات في تل عين دارا — لم تُنمذَج قبل وقوع الأضرار.

ما تستطيع تقديمه نمذجة HBIM للتراث السوري ليس المسار الكامل النظيف الذي تصوّره مطوّروها. إنه شيء أكثر تشظّياً وأعظم إلحاحاً: منهجية لبناء نماذج جزئية مما بقي — صور أرشيفية، رسومات مسح قديمة، لوحات رحالة، سجلات عقارية عثمانية، وصور أقمار صناعية — واستخدام هذه النماذج لدعم قرارات إعادة الإعمار وتقييم الأصالة.

## نمذجة HBIM عن بُعد: متطلباتها

بناء نموذج HBIM دون وصول ميداني يستلزم ثلاثة مدخلات تُقارب معاً ما كان يوفّره المسح المباشر:

**التصوير الأرشيفي.** يمكن معالجة الصور الأرشيفية التي توفّرت قبل الحرب — من مصادر منشورة وأرشيفات مؤسسية ومجموعات رحالة — ببرامج فوتوغرامترية كـ Agisoft Metashape وRealityCapture لاستخراج سُحُب نقطية بها ثغرات ودقة متفاوتة، لكنها تحتوي بيانات هندسية حقيقية. يضمّ أرشيف مَنَار الأثر بجامعة أكسفورد آلاف الصور للمواقع التراثية السورية مُفهرَسة بحسب الموقع.

**الرسومات والمسوحات التاريخية.** مسوحات كاداسترالية عثمانية، وتوثيق فرنسي من زمن الانتداب في مطلع القرن العشرين، وسجلات آثار سورية ما بعد الاستقلال — جميعها موزّعة في أرشيفات متناثرة. احتفظت المديرية العامة للآثار والمتاحف في سوريا بمواد مسح ضخمة قبل الحرب؛ إمكانية الوصول إلى هذا الأرشيف وحالته هي بحدّ ذاتهما سؤال بحثي مفتوح.

**الهندسة المُستمَدة من الأقمار الصناعية.** الصور التجارية بدقة 30–50 سم تُتيح تحديد هندسة الخط العلوي للبناء وبصمته الأرضية وارتفاعه النسبي للمباني الكثيرة. مقرونة بالمعرفة بالنمط المعماري المعتاد، تُقيّد النموذج حتى حين يستحيل القياس المباشر.

النموذج الناتج ليس توأماً رقمياً عالي الدقة. بل هو فرضية منظَّمة عن هندسة مبنى وتركيبته المادية، مع حدود عدم يقين صريحة مرفقة بكل عنصر.

## تطبيق تقييم الأضرار

الاستخدام الأكثر إلحاحاً لنمذجة HBIM عن بُعد للتراث السوري هو تحديد الأضرار كمياً. بمجرد وجود نموذج ما قبل الحرب — مهما كانت درجة اكتماله — يمكن مقارنته مع صور أقمار صناعية ما بعد الحرب وتقارير الأضرار المنشورة لإنتاج سجل منظَّم بما فُقد، مع مستوى ثقة واضح لكل عنصر.

هذا يهمّ تخطيط إعادة الإعمار بطريقة محدّدة: يُتيح اتخاذ قرارات مدروسة بشأن ما إذا كان ينبغي إعادة بناء عنصر ما (الأدلة كافية)، أو إعادة بنائه مع الإقرار بالشكوك (أدلة جزئية)، أو إحياء ذكراه دون إعادة بنائه (الأدلة غير كافية لتبرير أي إعادة بناء بعينها). هذا التمييز له أهمية معمارية وأخلاقية بالغة.

## مؤسسة آغا خان وسابقة حلب

أجرت مؤسسة آغا خان للثقافة عملاً ضخماً في ترميم المدينة القديمة بحلب قبل الحرب، شمل توثيقاً رقمياً لمباني مختارة. بعد عام 2011، غدا هذا التوثيق قاعدة الأدلة الأولية لفهم هيئة تلك المباني قبل الأضرار.

نهج مؤسسة آغا خان في حلب منذ 2018 — بالعمل مع حرفيين محليين ومؤسسات سورية ومستشارين تقنيين دوليين — يُمثّل أقرب سابقة قائمة لإعادة إعمار مُستنيرة بـ HBIM في السياق السوري. المنهجية التي طوّروها لإعادة تأهيل سوق المدينة قابلة للتطبيق مباشرةً: مسح منهجي للنسيج الباقي، إقرار صريح بالمواد المستبدَلة مقابل الأصيلة، وسجلات محكومة بالإصدارات لقرارات التدخل.

## ما سيُتيحه مستودع HBIM مفتوح

الاستثمار البنيوي الأكثر قيمة لتوثيق التراث السوري هو مكتبة HBIM مفتوحة وميسورة: نماذج جزئية للمواقع التراثية السورية المهددة والمتضررة، مبنية من المصادر الأرشيفية، مع توثيق صريح لعدم اليقين، تحكمها مؤسسات سورية، ومتاحة للباحثين والممارسين وصانعي قرار إعادة الإعمار في كل أنحاء العالم.

هذا المستودع غير موجود حتى الآن. البيانات التي ستُغذّيه مبعثرة في جامعات ومنظمات غير حكومية وأرشيفات حكومية ومجموعات خاصة في بلدان عديدة. تجميعها مشكلة تنسيق بالدرجة الأولى قبل أن تكون تقنية — وهي بالضبط نوع العمل البحثي التعاوني المنظَّم الذي صُمِّمت منصة SyriaHub لدعمه.`,
    },
  },

  // ─── Article 3: Islamic Urban Climatology ────────────────────────────────
  {
    cover_image_key: 'scan-dec27',
    content_type: 'article',
    status: 'published',
    tags: ['islamic-architecture', 'urban-planning', 'syria', 'climate-adaptation', 'reconstruction'],
    en: {
      title: 'Islamic Urban Climatology — Lessons for Rebuilding Syrian Cities',
      content: `## What Urban Form Knows

Syrian cities did not become climatically intelligent by accident. The courtyard house, the covered suq, the narrow shaded street, the wind scoop — each of these is a data-driven design decision refined over centuries of empirical observation. The orientation of a building, the width of a lane, the height-to-width ratio of a street canyon: these encode information about prevailing winds, solar angles, and the thermal behaviour of stone. When conflict destroys that fabric, it doesn't just destroy buildings. It destroys an accumulated database of environmental solutions.

This article argues that any serious approach to rebuilding Syrian cities must begin with a systematic analysis of what the pre-war urban fabric was already doing — not as nostalgic preservation but as evidence-based design.

## The Cairo-Masdar Framework

The comparative study by Abbas M. Hassan, Hyowon Lee, and UooSang Yoo — "From Medieval Cairo to Modern Masdar City: Lessons Learned through a Comparative Study" — provides a template for exactly this kind of analysis. Their framework compares traditional Islamic urban morphology with the computationally designed Masdar City across metrics including street orientation, canyon aspect ratio, courtyards as thermal buffers, and pedestrian comfort in the public realm.

The most striking finding is that medieval Cairo performs comparably to Masdar City on several passive cooling metrics, despite the latter being explicitly designed with simulation tools that medieval builders obviously did not have. The explanation is evolutionary: the urban fabric of Cairo accumulated over many generations of building, demolition, and rebuilding, with forms that worked thermally persisting and those that didn't being adapted or replaced. It is a data-driven process — just one that ran on human survival and comfort rather than software.

## Syrian Vernacular Climate Solutions

The same logic applies to Syrian historic cities. Each climate zone has its own vocabulary:

**Damascus** (semi-arid Mediterranean): The courtyard house (bayt) is the primary thermal unit. Interior courtyards with central pools and dense plantings create micro-climates substantially cooler than the surrounding city. The pool functions as a passive evaporative cooler; the vegetation provides shade and transpiration cooling. Street widths in the old city are calibrated to provide shade for most of the day without blocking cross-ventilation entirely.

**Aleppo** (semi-arid, more continental): Similar courtyard typology, but with heavier masonry and higher thermal mass to handle greater diurnal temperature swings. The suq system — covered markets with a sequential series of high-vaulted roofs — creates a continuously shaded pedestrian network that remains usable even at peak summer temperatures.

**Deir ez-Zor** (hot arid): Traditional wind scoops (badgirs) catch prevailing north winds and direct them into building interiors. Rooftop sleeping areas exploit the differential between daytime and nighttime temperatures. Construction materials are predominantly mud brick, chosen for high thermal mass and local availability.

## What the Data Shows — and What's Missing

Several studies have quantified the thermal performance of traditional Islamic urban morphology using contemporary computational tools. Computational fluid dynamics simulations consistently show that the narrow, shaded street canyons of traditional Arab cities reduce pedestrian-level air temperature by 2–5°C compared to equivalent open spaces in summer conditions.

The critical gap for Syria is the absence of site-specific baseline data. No systematic microclimate measurements were taken of Damascus's old city, Aleppo's historic core, or Homs's pre-war fabric. No CFD simulation studies exist for these specific morphologies. When reconstruction planners now make decisions about street widths in rebuilt Homs, they are doing so without any quantified understanding of what the original fabric was providing climatically.

This is not irretrievable. Archival satellite imagery can derive urban morphology metrics (street orientation, building footprint, courtyard dimensions, height-to-width ratios) for pre-war fabric. Published climate data can provide the boundary conditions for retrospective simulation. The work is painstaking but technically feasible.

## Rabbat's Warning and the Authenticity Problem

Nasser Rabbat's question — "What is Islamic Architecture Anyway?" — is not an academic diversion in this context. It is a direct challenge to anyone planning to rebuild Syrian cities.

"Islamic architecture" is not a single system or a design code that can be applied. It is a label applied retrospectively to an enormous diversity of buildings across fourteen centuries and three continents. The courtyard house of Damascus, the madrasa of Cairo, and the mosque of Córdoba are all "Islamic architecture" in the sense of having been built by Muslim societies — but they share no common design vocabulary that could guide reconstruction decisions.

What this means practically: the fact that a reconstructed building uses pointed arches and geometric tile-work does not make it climatically appropriate for its specific location. Only a building whose morphology is calibrated to the local microclimate — orientation, massing, shading strategy, material — will deliver the thermal performance that makes rebuilding worthwhile.

## A Research Agenda

The immediate research priorities are:
1. Deriving pre-war urban morphology metrics from archival satellite imagery for the major Syrian cities.
2. Running retrospective microclimate simulations to establish what the destroyed fabric was providing.
3. Developing climate-informed reconstruction guidelines for each Syrian climatic zone that are based on this evidence rather than on stylistic assumptions.

None of this can be done by a single research group. It requires the kind of collaborative, cumulative, data-sharing platform that SyriaHub is designed to support.`,
    },
    ar: {
      title: 'المناخية الحضرية الإسلامية — دروس لإعادة بناء المدن السورية',
      content: `## ما تعرفه الأشكال الحضرية

لم تكن المدن السورية ذكيةً مناخياً بالمصادفة. بيتُ الفناء، والسوق المسقوف، والشارع الضيق المُظلَّل، والملقف — كلٌّ من هذه قرارٌ تصميمي مدروس تلقائياً، اصطُفِيَ على مدى قرون من الملاحظة التجريبية. توجيه المبنى، وعرض الدرب، ونسبة ارتفاع الشارع إلى عرضه — كلها تُضمِّن معلومات عن الرياح السائدة وزوايا الشمس والسلوك الحراري للحجر. حين تُدمِّر الحرب هذا النسيج، لا تدمّر مبانيَ فحسب. بل تُدمِّر قاعدةَ بيانات متراكمة من الحلول البيئية.

تُقدّم هذه المقالة الحجة بأن أي نهج جاد لإعادة بناء المدن السورية يجب أن يبدأ بتحليل منهجي لما كان النسيج الحضري قبل الحرب يُنجزه فعلاً — لا بوصفه حفاظاً نوستالجياً، بل تصميماً قائماً على الأدلة.

## إطار القاهرة وماسدار

تقدّم الدراسة المقارنة لعباس حسن وهيونج لي وأوسانج يو — "من القاهرة الوسيطة إلى مدينة ماسدار الحديثة" — نموذجاً لهذا النوع من التحليل. يقارن إطارهم البحثي المورفولوجيا الحضرية الإسلامية التقليدية بمدينة ماسدار المُصمَّمة حاسوبياً عبر مقاييس من بينها: توجيه الشوارع، ونسبة ارتفاع الممرات، والأفنية بوصفها مخازن حرارية، وراحة المشاة في الفضاء العام.

النتيجة الأكثر لفتاً هي أن القاهرة الوسيطة تُساوي مدينة ماسدار في عدة مؤشرات تبريد سلبي، رغم أن الأخيرة صُمِّمت بأدوات محاكاة دقيقة لم يمتلكها البنّاؤون في العصور الوسطى. التفسير تطوّري: النسيج الحضري للقاهرة تراكم عبر أجيال من البناء والهدم وإعادة البناء، مع استمرار الأشكال الناجحة حرارياً وتكيّف أو زوال ما لم ينجح منها. إنه مسار قائم على البيانات — لكنه يعمل بالبقاء الإنساني والراحة بدلاً من البرمجيات.

## الحلول المناخية السورية التقليدية

المنطق ذاته ينطبق على المدن التاريخية السورية. لكل منطقة مناخية قاموسها المعماري:

**دمشق** (شبه جاف متوسطي): بيت الفناء هو الوحدة الحرارية الأساسية. تخلق الأفنية الداخلية مع أحواض المياه المركزية والنباتات الكثيفة مناخات دقيقة أبرد بكثير مما حولها. الحوض يعمل مبرِّداً تبخيرياً سلبياً؛ الغطاء النباتي يوفّر الظل وتبريد التبخر. عروض الشوارع في المدينة القديمة مُعايَرة لتوفير الظل معظم ساعات النهار دون قطع التهوية الطبيعية كلياً.

**حلب** (شبه جاف قاري أكثر): نمط الفناء ذاته مع بناء أثقل وكتلة حرارية أعلى لاستيعاب تذبذبات حرارية يومية أكبر. منظومة الأسواق المسقوفة — أسواق متتالية بأسقف مقبّبة مرتفعة — تُشكّل شبكة مشاة مُظلَّلة باستمرار تبقى صالحة للاستخدام حتى في ذروة حرارة الصيف.

**دير الزور** (حار جاف): الملاقف التقليدية تلتقط الرياح الشمالية السائدة وتوجّهها إلى داخل المباني. مناطق النوم على الأسطح تستغل الفارق بين درجات الحرارة النهارية والليلية. مواد البناء هي الطابوق الطيني في الغالب، اختيرت لكتلتها الحرارية العالية وتوافرها المحلي.

## ما تُظهره البيانات — وما يغيب

أثبتت دراسات عديدة بالأدوات الحاسوبية المعاصرة الأداء الحراري للمورفولوجيا الحضرية الإسلامية التقليدية. تُظهر محاكاة ديناميكا الموائع الحسابية باستمرار أن ممرات الشوارع الضيقة المُظلَّلة في المدن العربية التقليدية تُخفّض درجة حرارة الهواء عند مستوى المشاة بـ 2–5 درجات مئوية مقارنةً بالفضاءات المكشوفة المعادلة في ظروف الصيف.

الثغرة الحرجة بالنسبة لسوريا هي غياب البيانات الأساسية الخاصة بكل موقع. لم تُجرَ أي قياسات منهجية للمناخ الدقيق في المدينة القديمة بدمشق أو النسيج التاريخي لحلب أو نسيج حمص قبل الحرب. لا توجد دراسات محاكاة لهذه المورفولوجيات المحددة. حين يتخذ مخططو إعادة الإعمار الآن قرارات بشأن عروض الشوارع في حمص المُعاد بناؤها، يفعلون ذلك دون أي فهم كمّي لما كان النسيج الأصلي يُقدّمه مناخياً.

هذا ليس مستعصياً على الإصلاح. صور الأقمار الصناعية الأرشيفية تستطيع اشتقاق مؤشرات المورفولوجيا الحضرية (توجيه الشوارع، بصمات المباني، أبعاد الأفنية، نسب الارتفاع إلى العرض) للنسيج السوري قبل الحرب. البيانات المناخية المنشورة توفّر الشروط الحدّية للمحاكاة الاسترجاعية. العمل دقيق لكنه ممكن تقنياً.

## تحذير رباط وإشكالية الأصالة

سؤال الدكتور ناصر رباط — "ما العمارة الإسلامية أصلاً؟" — ليس استطراداً أكاديمياً في هذا السياق. بل هو تحدٍّ مباشر لكل من يخطّط لإعادة بناء المدن السورية.

"العمارة الإسلامية" ليست منظومة واحدة أو كود تصميمي يمكن تطبيقه. إنها تسمية أُلصقت بأثر رجعي على تنوع هائل من المباني عبر أربعة عشر قرناً وثلاث قارات. بيت الفناء في دمشق، ومدرسة القاهرة، ومسجد قرطبة — كلها "عمارة إسلامية" بمعنى أنها بُنيت في مجتمعات مسلمة — لكنها لا تتشارك قاموساً تصميمياً مشتركاً يُرشد قرارات إعادة الإعمار.

ما يعنيه هذا عملياً: مجرد استخدام بناء معاد بناؤه للأقواس المدببة والبلاطات الهندسية لا يجعله ملائماً مناخياً لموقعه تحديداً. فقط المبنى الذي تتناسب هندسته مع المناخ الدقيق المحلي — توجيهاً وكتلةً واستراتيجيةَ تظليل ومواد — سيُحقّق الأداء الحراري الذي يجعل إعادة البناء ذا قيمة حقيقية.

## أجندة بحثية مقترحة

الأولويات البحثية العاجلة:
1. اشتقاق مؤشرات المورفولوجيا الحضرية قبل الحرب من صور الأقمار الصناعية الأرشيفية للمدن السورية الكبرى.
2. إجراء محاكاات مناخ دقيق استرجاعية لتحديد ما كان النسيج المُدمَّر يوفّره.
3. تطوير إرشادات إعادة إعمار واعية مناخياً لكل منطقة مناخية سورية مستندة إلى هذه الأدلة لا إلى افتراضات أسلوبية.

لا يمكن لمجموعة بحثية واحدة إنجاز هذا. الأمر يتطلب منصة تعاونية تراكمية لتبادل البيانات — وهو بالضبط ما صُمِّم SyriaHub لدعمه.`,
    },
  },

  // ─── Article 4: Biomimicry ────────────────────────────────────────────────
  {
    cover_image_key: 'scan-jan22-a',
    content_type: 'article',
    status: 'published',
    tags: ['biomimicry', 'infrastructure', 'syria', 'water-systems', 'humanitarian-design'],
    en: {
      title: 'Biomimicry as a Framework for Post-War Infrastructure in Syria',
      content: `## Speed and Resilience Are Usually in Conflict

Post-war infrastructure reconstruction faces a fundamental tension. Urgency demands fast, standardised solutions — the kind that international procurement systems know how to deliver quickly. Resilience demands locally adapted, redundant, self-repairing systems — the kind that take years to develop and that no catalogue stocks. Biomimicry, the practice of learning design strategies from natural systems, offers a set of principles that may be able to resolve this tension in Syria's specific context.

This is not a utopian argument. Slime moulds are not going to rebuild Aleppo's water supply. The argument is narrower: specific biomimetic design principles — network redundancy derived from biological systems, passive climate control derived from termite mound ventilation, water capture strategies derived from desert organisms — have been demonstrated at scale and are directly applicable to Syrian post-war reconstruction challenges.

## Water Infrastructure as the Primary Case

Syria's water infrastructure was already under severe stress before 2011. The combined effects of a decade-long drought (2006–2010), intensive groundwater extraction, and the degradation of traditional water management systems had depleted aquifers and disrupted seasonal water flow across the country.

The war added deliberate targeting of water infrastructure to this picture. Pumping stations, treatment plants, and distribution networks were damaged or destroyed in every major theatre of operations. In Aleppo, the Suleiman al-Halabi water treatment plant was repeatedly damaged, leaving much of the city dependent on trucked water or unverified local sources.

Traditional Syrian water management systems — qanat channels, aflaj networks, cisterns — represented millennia of adaptation to precisely these kinds of stress conditions. They are, in biomimetic terms, nature-derived solutions to the problem of distributing water in arid and semi-arid environments without centralised infrastructure. Several of them remain partially functional in rural areas where the war's infrastructure destruction was less complete.

The paper on digital technology for the Montilla water catchment system in Córdoba provides a direct methodological precedent: using historical records, photogrammetry, and GIS to locate, document, and revive a nineteenth-century water system that had fallen out of use. The same approach could be applied systematically to Syrian qanat documentation — identifying surviving systems, mapping their routes, assessing their condition, and evaluating their potential for rehabilitation.

## Network Resilience and the Slime Mould Principle

The slime mould Physarum polycephalum has been extensively studied for its ability to grow network structures that are simultaneously efficient and resilient. When Tokyo researchers grew slime mould in a geometry matching Tokyo's geography (with oat flakes representing population centres and light barriers representing obstacles), the mould produced a network closely matching the actual Tokyo rail system — efficient, but also with redundant pathways that allow the network to continue functioning when individual connections fail.

This principle has direct application to water and electricity distribution design in post-war Syrian cities. Current international reconstruction practice tends to rebuild point-to-point infrastructure: a single treatment plant serving a single distribution network, with no redundancy. When any node fails, the system fails. A network designed around biological redundancy principles would maintain multiple pathways between sources and consumers, degrade gracefully rather than catastrophically, and be more resistant to both natural failure and deliberate attack.

## Passive Cooling for Displacement Settlements

The termite mound is the paradigm case in biomimetic architecture for passive ventilation. Macrotermes michaelseni mounds maintain interior temperatures within a narrow range despite extreme diurnal temperature swings, through a system of ventilation shafts that exploit differential pressure and the thermal mass of the mound structure. The Eastgate Centre in Harare, Zimbabwe — designed by Mick Pearce with Arup engineers — applied this principle to a commercial building, eliminating the need for conventional air conditioning in a hot climate.

Syrian displacement settlements present a related design challenge: large numbers of people living in temporary or semi-permanent structures in hot-arid or semi-arid climates, with no access to grid electricity and no budget for mechanical cooling. Biomimetic passive cooling principles — high thermal mass, strategic ventilation openings, evaporative cooling from water features — can dramatically improve thermal comfort at minimal cost. Several humanitarian architecture organisations have begun exploring these approaches; the evidence base for their effectiveness in Syrian climatic conditions is thin and constitutes a research gap.

## The Institutional Barrier

The most significant obstacle to biomimetic design in Syrian reconstruction is not technical but institutional. International humanitarian procurement operates through standardised catalogues: prefabricated shelter units, modular water treatment systems, established electrical grid components. These systems exist because they can be procured quickly and delivered at scale. Biomimetically-informed designs, even when cheaper and more resilient in the long run, require upfront design work that procurement timelines do not accommodate.

Changing this requires advocacy backed by evidence: documented case studies showing that biomimetic infrastructure delivers better long-term outcomes than standard approaches in comparable contexts. Building that evidence base in the Syrian context is a legitimate and important research contribution.`,
    },
    ar: {
      title: 'المحاكاة الطبيعية إطاراً لإعادة بناء البنية التحتية بعد الحرب في سوريا',
      content: `## السرعة والمرونة في تعارض دائم

تواجه إعادة بناء البنية التحتية بعد الحرب توتراً جوهرياً. الإلحاح يقتضي حلولاً سريعة ومعيارية — النوع الذي تعرف منظومات المشتريات الدولية كيف تُسلّمه بسرعة. المرونة تقتضي أنظمة متكيّفة محلياً ومتعددة المسارات وقادرة على الإصلاح الذاتي — النوع الذي يستغرق سنوات لتطويره ولا يتوفر في أي كتالوج. تُقدّم المحاكاة الطبيعية، أي استلهام استراتيجيات التصميم من الأنظمة الطبيعية، مجموعةً من المبادئ قادرة على معالجة هذا التوتر في السياق السوري تحديداً.

هذه ليست حجة طوباوية. العفن اللزج لن يُعيد بناء شبكة المياه في حلب. الحجة أضيق من ذلك: مبادئ تصميمية بيوميمتيكية بعينها — تكرارية الشبكات المستمَدة من الأنظمة البيولوجية، والتحكم المناخي السلبي المستمَد من تهوية تلال النمل الأبيض، واستراتيجيات تجميع المياه المستمَدة من كائنات الصحراء — ثبت نجاعتها على نطاق واسع وهي قابلة للتطبيق مباشرةً على تحديات إعادة البناء ما بعد الحرب في سوريا.

## البنية التحتية المائية: الحالة الأساسية

كانت البنية التحتية المائية في سوريا تعاني أصلاً ضغطاً حاداً قبل عام 2011. المفاعيل المتراكمة لجفاف دام عقداً (2006–2010)، واستنزاف المياه الجوفية المكثَّف، وتدهور أنظمة الإدارة المائية التقليدية — كلها أدّت إلى نضوب طبقات المياه الجوفية واضطراب التدفق الموسمي في أرجاء البلاد.

أضافت الحرب إلى هذه الصورة استهداف البنية التحتية المائية عمداً. أُلحقت أضرار بمحطات الضخ ومعالجة المياه وشبكات التوزيع في كل مسرح رئيسي للعمليات. في حلب، تعرّضت محطة تصفية المياه "سليمان الحلبي" للتدمير مراراً، مما أجبر قسماً كبيراً من المدينة على الاعتماد على المياه المنقولة بالصهاريج أو مصادر محلية غير موثوقة.

أنظمة الإدارة المائية التقليدية السورية — القنوات والأفلاج والصهاريج — تمثّل آلاف السنين من التكيّف مع هذه الظروف الضاغطة تحديداً. وهي، من منظور المحاكاة الطبيعية، حلول مستمَدة من الطبيعة لمشكلة توزيع المياه في البيئات الجافة وشبه الجافة دون الاعتماد على بنية تحتية مركزية. لا يزال عدد منها يعمل جزئياً في المناطق الريفية التي طالها تدمير البنية التحتية بصورة أقل حدة.

تُقدّم الدراسة البحثية حول التقنية الرقمية لتحديد موقع نظام تجميع مياه "فوينتي ديل كوادرادو" في مونتيليا بالأندلس سابقةً منهجية مباشرة: استخدام السجلات التاريخية والتصوير الفوتوغرامتري ونظم المعلومات الجغرافية لتحديد موقع نظام مياه من القرن التاسع عشر كان قد خرج عن الاستخدام، وتوثيقه وإحيائه. الأسلوب ذاته يمكن تطبيقه منهجياً على توثيق القنوات السورية.

## مرونة الشبكة ومبدأ العفن اللزج

دُرس العفن اللزج Physarum polycephalum دراسةً موسّعة لقدرته على نمو هياكل شبكية تجمع بين الكفاءة والمرونة في آن واحد. حين زرع باحثون يابانيون هذا الكائن في تضاريس تحاكي جغرافية طوكيو، أنتج الكائن شبكةً تشبه إلى حدٍّ بعيد نظام سكك حديد طوكيو الفعلي — شبكة كفوءة لكنها تضمّ مسارات تكرارية تُتيح للشبكة الاستمرار حين تنقطع وصلات بعينها.

لهذا المبدأ تطبيق مباشر في تصميم شبكات توزيع المياه والكهرباء في المدن السورية ما بعد الحرب. ميل الممارسة الدولية الراهنة في إعادة الإعمار هو إعادة بناء بنية تحتية من نقطة إلى نقطة: محطة معالجة واحدة تخدم شبكة توزيع وحيدة دون أي تكرار. حين تخفق أي عقدة، تخفق المنظومة كلها. شبكة مُصمَّمة على مبادئ التكرارية البيولوجية ستحافظ على مسارات متعددة بين المصادر والمستهلكين، وتتراجع في أدائها بصورة تدريجية لا كارثية، وتكون أكثر قدرة على مقاومة الأعطال الطبيعية والهجمات المتعمدة على حدٍّ سواء.

## التبريد السلبي لمخيمات النزوح

تلة النمل الأبيض هي النموذج الأبرز في العمارة البيوميمتيكية للتهوية السلبية. تحافظ تلال Macrotermes michaelseni على درجات حرارة داخلية ضمن نطاق ضيق رغم التذبذبات الحرارية اليومية الحادة، من خلال منظومة قنوات تهوية تستغل فوارق الضغط والكتلة الحرارية لبنية التلة. مركز Eastgate في هراري بزيمبابوي — من تصميم ميك بيرس بالتعاون مع مهندسي Arup — طبّق هذا المبدأ على مبنى تجاري، محذوفاً الحاجة إلى التكييف التقليدي في مناخ حار.

مخيمات النزوح السورية تُطرح تحدياً تصميمياً مشابهاً: أعداد كبيرة من الناس تقطن في مبانٍ مؤقتة أو شبه دائمة في مناطق حارة جافة أو شبه جافة، دون اتصال بشبكة الكهرباء ودون ميزانية للتبريد الميكانيكي. مبادئ التبريد السلبي البيوميمتيكي — كتلة حرارية عالية، فتحات تهوية استراتيجية، تبريد تبخيري من عناصر مائية — تستطيع تحسين الراحة الحرارية تحسيناً ملموساً بتكلفة ضئيلة.

## الحاجز المؤسسي

أكبر عقبة أمام التصميم البيوميمتيكي في إعادة الإعمار السورية ليست تقنية بل مؤسسية. تعمل المشتريات الإنسانية الدولية عبر كتالوجات موحّدة: وحدات مأوى جاهزة، وأنظمة معالجة مياه نمطية، ومكوّنات شبكة كهربائية ثابتة. هذه الأنظمة موجودة لأنه يمكن شراؤها بسرعة وتسليمها على نطاق واسع. أما التصاميم المستوحاة بيوميمتيكياً، حتى حين تكون أرخص وأكثر مرونة على المدى البعيد، فتستلزم عملاً تصميمياً مسبقاً لا تتسع له جداول زمنية للمشتريات.

تغيير هذا الواقع يستلزم مناصرةً مدعومة بأدلة: دراسات حالة موثَّقة تُثبت أن البنية التحتية البيوميمتيكية تُحقّق نتائج أفضل على المدى البعيد من المناهج المعيارية في سياقات مماثلة. بناء هذه القاعدة الدليلية في السياق السوري إسهام بحثي مشروع وذو قيمة.`,
    },
  },

  // ─── Article 5: Data Ethics ───────────────────────────────────────────────
  {
    cover_image_key: 'scan-jan22-b',
    content_type: 'article',
    status: 'published',
    tags: ['data-ethics', 'documentation', 'syria', 'privacy', 'research-methodology'],
    en: {
      title: 'Data Ethics and the Documentation of War in Syria',
      content: `## Why Ethics Cannot Be an Afterthought

Data-driven research methodology — the subject of this lecture series — carries implicit assumptions about the contexts in which it operates. It assumes researchers can access data, that data accurately represents what it claims to represent, that sharing data creates knowledge without creating harm, and that the people whose lives are represented in data have some relationship to its collection and use.

None of these assumptions hold cleanly in the Syrian context. Data about Syrian individuals, locations, and communities can endanger lives. The populations most affected by the war are systematically underrepresented in most datasets. International organisations holding critical data often cannot or do not share it with Syrian researchers. And the communities whose built heritage, displacement, and survival are being documented have rarely been consulted about how that documentation is conducted or what it is used for.

This is not an argument against data-driven research in Syria. It is an argument that the ethics of that research cannot be retrofitted onto completed work. They need to be embedded in methodology from the beginning.

## The Five Trust Dimensions Applied

SyriaHub's trust framework — five dimensions that attach to every piece of research on this platform — is directly applicable to the Syrian data ethics problem.

**T1 (Source)**: Who is speaking, and what is their relationship to what they are describing? A satellite image processed by a European institution tells you something different from a report by a Syrian researcher who was present, which tells you something different again from the testimony of a community member whose neighbourhood is the subject of the report. None of these is automatically more reliable; each requires different kinds of critical reading.

**T2 (Method)**: Is the methodology documented in enough detail to be reproducible and critiqued? "Satellite-derived damage assessment" is not a method; it is a category of methods with very different implications for accuracy, bias, and completeness. The specific algorithm, training data, and validation approach must be stated.

**T3 (Proximity)**: How close was the researcher to the phenomenon being described? Remote sensing from satellite imagery has high geographic precision but low contextual resolution. Field testimony has high contextual resolution but is subject to the specific position and experience of the witness. Both are legitimate; neither should be presented as if it were the other.

**T4 (Temporal)**: When was the data collected, and is it still current? Conflict conditions change rapidly. A damage assessment from 2015 is not a description of conditions in 2024. Temporal metadata must be explicit.

**T5 (Validation)**: Has the finding been independently corroborated? The epistemic risk of circular citation — where multiple organisations rely on a single underlying source without acknowledging it — is particularly acute in Syrian research, where the number of organisations with genuine independent access to ground truth is very small.

## The Invisible Women Problem

Caroline Criado Perez's "Invisible Women" documents the systematic underrepresentation of women in data across almost every domain of human knowledge. The pattern is particularly sharp in conflict and displacement data.

Syrian women's displacement experiences, economic strategies, health outcomes, and household decisions are substantially underrepresented in most datasets about Syria. The organisations with the best field access — military actors, male-dominated aid organisations operating in conservative areas — collect data that reflects male interlocutors and male-centred concerns. The populations that are hardest to reach for data collection (women in besieged areas, women in informal settlements, women in communities where engagement with foreigners is socially restricted) are precisely those whose experiences are most important to document.

Researchers using Syrian data should systematically ask: who is and is not represented in this dataset? What are the structural reasons for that underrepresentation? And what would it require to address it?

## Data Sovereignty and the Colonial Pattern

The data most relevant to Syrian reconstruction — detailed spatial records of heritage sites, pre-war urban surveys, geological and hydrological maps, population and displacement records — is disproportionately held by European and North American institutions: universities, NGOs, UN agencies, government databases.

Syrian researchers, institutions, and communities often cannot access data about Syria that international organisations hold. This is described as a problem of data protection, security sensitivity, or institutional capacity — and in individual cases, each of these explanations may be accurate. But the pattern as a whole reproduces a colonial dynamic: the resources of a country, including its information resources, are held and controlled by foreign institutions.

This does not mean the data should be published without restriction. Some data genuinely would endanger lives if published openly. But the decision about what to restrict and how should involve Syrian researchers and communities as principal actors, not as afterthoughts.

## Practical Guidelines for SyriaHub Researchers

The following commitments operationalise these principles for researchers contributing to this platform:

1. **State your positionality explicitly.** Where were you when you collected or accessed this data? What is your relationship to the Syrian communities you are describing?

2. **Document data provenance.** Where did your data come from? Who collected it, when, under what conditions, and with whose consent?

3. **Be explicit about what you cannot know.** Remote sensing cannot tell you what a destroyed building meant to the people who lived in it. Displacement statistics cannot tell you about the social fabric that displacement broke. State the limits of your evidence.

4. **Anonymise appropriately.** Individual-level data about Syrian civilians — locations, displacement routes, economic activities, social networks — should be handled with the assumption that it could be used to cause harm, even when your intentions are protective.

5. **Ask who benefits.** Your research will be read by people with different interests. Before publishing data, ask who could use it and how.`,
    },
    ar: {
      title: 'أخلاقيات البيانات وتوثيق الحرب على سوريا',
      content: `## لماذا لا يمكن إرجاء الأخلاقيات

تحمل منهجية البحث القائمة على البيانات — موضوع هذه السلسلة من المحاضرات — افتراضات ضمنية حول السياقات التي تعمل فيها. تفترض أن الباحثين يستطيعون الوصول إلى البيانات، وأن البيانات تُمثّل بدقة ما تدّعي تمثيله، وأن مشاركة البيانات تُولّد المعرفة دون إيقاع الضرر، وأن الناس الذين تُمثَّل حياتهم في البيانات يحافظون على علاقة ما مع طريقة جمعها واستخدامها.

لا يصمد أيٌّ من هذه الافتراضات في السياق السوري. قد تُعرّض البيانات المتعلقة بالأفراد والمواقع والمجتمعات السورية الأرواح للخطر. الفئات الأكثر تضرراً من الحرب ممثَّلة تمثيلاً منقوصاً في معظم مجموعات البيانات. كثيراً ما لا تستطيع المنظمات الدولية التي تمتلك بيانات حيوية — أو لا ترغب — في مشاركتها مع الباحثين السوريين. والمجتمعات التي تُوثَّق تراثها المعماري ونزوحها وصمودها نادراً ما استُشيرت في آلية إجراء هذا التوثيق أو أغراض استخدامه.

هذا ليس حجةً ضد البحث القائم على البيانات في سوريا. بل هو حجة بأن أخلاقيات هذا البحث لا يمكن إلصاقها بالعمل بعد إنجازه. يجب أن تكون مُدمجة في المنهجية من البداية.

## الأبعاد الخمسة للثقة تُطبَّق هنا

يرتبط إطار الثقة في SyriaHub — خمسة أبعاد تُرافق كل قطعة بحث على هذه المنصة — ارتباطاً مباشراً بمشكلة أخلاقيات البيانات السورية.

**م1 (المصدر)**: من يتحدث، وما علاقته بما يصفه؟ صورة قمر صناعي تُعالجها مؤسسة أوروبية تُخبرك بشيء مختلف عن تقرير باحث سوري كان حاضراً، وهذا بدوره يختلف عن شهادة فرد من المجتمع الذي يعيش في الحي موضوع التقرير. لا شيء منها أكثر موثوقية تلقائياً؛ كل منها يتطلب قراءة نقدية من نوع مختلف.

**م2 (المنهجية)**: هل المنهجية موثَّقة بما يكفي لتكون قابلة للتكرار والنقد؟ "تقييم الأضرار المستمَد من الأقمار الصناعية" ليس منهجاً؛ إنه فئة من المناهج ذات دلالات مختلفة تماماً من حيث الدقة والتحيز والشمولية. يجب ذكر الخوارزمية المحددة وبيانات التدريب ومنهج التحقق.

**م3 (القرب)**: ما درجة قرب الباحث من الظاهرة الموصوفة؟ الاستشعار عن بُعد عبر الأقمار الصناعية يتمتع بدقة جغرافية عالية لكن قدرة سياقية منخفضة. الشهادة الميدانية تتمتع بقدرة سياقية عالية لكنها تنطوي على موقع الشاهد وتجربته تحديداً. كلاهما مشروع؛ لا ينبغي تقديم أي منهما كأنه الآخر.

**م4 (الزمنية)**: متى جُمعت البيانات، وهل لا تزال راهنة؟ تتغيّر أحوال الحرب بسرعة. تقييم الأضرار الصادر عام 2015 لا يصف الأوضاع عام 2024. يجب أن تكون البيانات الوصفية الزمنية صريحة وظاهرة.

**م5 (التحقق)**: هل النتيجة موثَّقة بصورة مستقلة؟ الخطر المعرفي للاستشهاد الدائري — حيث تعتمد منظمات متعددة على مصدر أصلي واحد دون الإقرار بذلك — حادٌّ بشكل خاص في البحث السوري، إذ أن عدد المنظمات التي تمتلك فعلاً وصولاً مستقلاً إلى حقيقة الميدان ضئيل للغاية.

## مشكلة النساء غير المرئيات

وثّقت كارولاين كريادو بيريز في "النساء غير المرئيات" التمثيل المنقوص المنهجي للمرأة في البيانات عبر تقريباً كل مجال من مجالات المعرفة الإنسانية. النمط يبرز بحدة خاصة في بيانات الحرب والنزوح.

تجارب النزوح للمرأة السورية، واستراتيجياتها الاقتصادية، ومآلات صحتها، وقراراتها الأسرية — كلها ممثَّلة تمثيلاً ناقصاً في معظم مجموعات البيانات المتعلقة بسوريا. المنظمات ذات أفضل وصول ميداني — الجهات العسكرية ومنظمات الإغاثة ذات الغالبية الذكورية العاملة في مناطق محافظة — تجمع بيانات تعكس وسطاء ذكوراً ومخاوف تتمحور حول الذكور. الفئات التي يصعب الوصول إليها لجمع البيانات هي تحديداً تلك الأهم في توثيقها.

على الباحثين المستخدمين للبيانات السورية أن يسألوا منهجياً: من مُمثَّل في هذه البيانات ومن لا يُمثَّل؟ ما الأسباب البنيوية لهذا التمثيل الناقص؟ وما الذي يتطلبه تصحيحه؟

## سيادة البيانات والنمط الاستعماري

البيانات الأشد صلةً بإعادة الإعمار السورية — سجلات مكانية مفصّلة للمواقع التراثية، ومسوحات حضرية ما قبل الحرب، وخرائط جيولوجية وهيدرولوجية، وسجلات السكان والنزوح — تمتلكها بصورة غير متناسبة مؤسسات أوروبية وأمريكية شمالية: جامعات، ومنظمات غير حكومية، ووكالات أممية، وقواعد بيانات حكومية.

كثيراً ما لا يستطيع الباحثون والمؤسسات والمجتمعات السورية الوصول إلى بيانات عن سوريا تحتفظ بها منظمات دولية. يُوصف هذا بأنه مشكلة حماية بيانات، أو حساسية أمنية، أو قدرة مؤسسية — وقد يكون كل تفسير من هذه صحيحاً في حالات بعينها. لكن النمط في مجمله يُعيد إنتاج ديناميكية استعمارية: موارد بلد، بما فيها موارده المعلوماتية، تُحتجَز وتُدار من قِبل مؤسسات أجنبية.

هذا لا يعني أن تُنشَر البيانات دون قيود. بعض البيانات ستُعرّض أرواحاً للخطر فعلاً إذا نُشرت علناً. لكن القرار بشأن ما يُقيَّد وكيف يجب أن يشمل الباحثين والمجتمعات السورية بوصفهم أطرافاً فاعلة أساسية، لا هامشاً يُستشار في آخر اللحظة.

## إرشادات عملية لباحثي SyriaHub

الالتزامات التالية تُرسّخ هذه المبادئ للباحثين المساهمين في هذه المنصة:

1. **صرّح بموقعيتك صراحةً.** أين كنت حين جمعت هذه البيانات أو وصلت إليها؟ ما علاقتك بالمجتمعات السورية التي تصفها؟

2. **وثّق أصل البيانات.** من أين جاءت بياناتك؟ من جمعها، ومتى، وتحت أي ظروف، وبموافقة من؟

3. **كن صريحاً بشأن ما يستحيل معرفته.** لا تستطيع صور الأقمار الصناعية إخبارك بما كان يعنيه مبنى مدمَّر للناس الذين عاشوا فيه. لا تستطيع إحصاءات النزوح إخبارك عن النسيج الاجتماعي الذي مزّقه النزوح. صرّح بحدود دليلك.

4. **عالج إخفاء الهوية بمسؤولية.** البيانات الفردية عن المدنيين السوريين — المواقع، ومسارات النزوح، والأنشطة الاقتصادية، والشبكات الاجتماعية — يجب التعامل معها بافتراض أنها قد تُستخدَم للإضرار، حتى حين تكون نواياك حمائية.

5. **اسأل من يستفيد.** ستقرأ بحثك أطراف ذات مصالح مختلفة. قبل نشر البيانات، اسأل من يمكنه استخدامها وكيف.`,
    },
  },

  // ─── Article 6: Digital Twins ─────────────────────────────────────────────
  {
    cover_image_key: 'scan-jan22-c',
    content_type: 'article',
    status: 'published',
    tags: ['digital-twin', 'heritage-conservation', 'syria', 'gis', 'future-trends'],
    en: {
      title: 'Digital Twins for Syrian Heritage Sites — Potentials and Limits',
      content: `## Redefining the Digital Twin for Heritage

The concept of a digital twin was developed for operational infrastructure: a real-time computational model of a physical system, continuously updated with sensor data, used to monitor performance, predict failures, and simulate interventions before implementing them in the physical world. A factory, a power grid, a smart city district — systems where continuous data flows and real-time feedback loops are both technically achievable and operationally valuable.

Syrian heritage sites present a fundamentally different problem. The value of a digital twin for Aleppo's Umayyad Mosque or the Crac des Chevaliers is not operational monitoring. It is multi-temporal record-keeping: a structured representation of what the site looked like before war damage, what damage has been documented, what interventions have been undertaken, and what the current state is — or was, as of the last available evidence. For an inaccessible or destroyed site, a "twin" can only be a hypothesis, not a real-time mirror.

Reframing the digital twin as a multi-temporal evidence archive rather than a real-time operational tool opens up approaches that are actually feasible with the data available for Syrian heritage.

## What Layers Can Be Built

A digital twin for a Syrian heritage site need not be complete to be useful. It can be built incrementally as data becomes available, with explicit version control and uncertainty documentation at each layer.

**Pre-war geometry layer.** Sources include: pre-war photogrammetry and laser scan data (where it exists, primarily from institutional conservation projects), archival photographs processed through SfM (Structure from Motion), historical drawings and survey records, and medium-resolution satellite imagery. This layer establishes the baseline for damage assessment.

**Conflict period damage layer.** Sources include: UNOSAT and ASOR CHI damage assessments, satellite change detection analyses, social media imagery from within conflict zones (processed with appropriate authentication), and reports from field observers during ceasefires or humanitarian pauses.

**Current condition layer.** Sources include: most recent available satellite imagery, any post-war field surveys that have been possible, and community-contributed documentation from residents who have returned or diaspora members who have visited.

**Intervention record layer.** Sources include: documentation from reconstruction and stabilisation projects, before-and-after documentation by implementing organisations, and version-controlled records of reconstruction decisions.

## Cesium and CityGML as Infrastructure

The Cesium platform — based on the open 3D Tiles standard — is the most practical existing infrastructure for multi-temporal 3D heritage documentation at city scale. It handles heterogeneous data (point clouds, 3D meshes, vector overlays, raster imagery) within a common geospatial framework, supports temporal animation, and is accessible through both desktop and web interfaces.

CityGML, the Open Geospatial Consortium standard for semantic 3D city models, provides the data schema for relating geometry to attributes: a column is not just a mesh but an object with material properties, construction date, historical significance, damage status, and intervention history. The combination of Cesium for visualisation and CityGML for semantic structure gives Syrian heritage documentation a path toward interoperable, cumulatively updatable 3D records.

## The Dead Twin Problem

A digital twin without data updates is not a twin. It is a model. For Syrian heritage sites where field access remains impossible — most sites in areas that experienced heavy fighting — the "twin" can only be updated from remote sources: satellite imagery and community-contributed photography.

Community-sourced updating is the most promising avenue. Syrian diaspora communities have been photographing sites they visit, uploading images to social media, and contributing to platforms like Wikimapia and OpenStreetMap throughout the war. This data is unstructured, inconsistently geotagged, and highly variable in quality — but it represents a continuous stream of ground-truth documentation that systematic remote sensing cannot provide.

A structured pipeline for ingesting, authenticating, geotagging, and integrating community-contributed imagery into a digital twin model is technically achievable. It requires collaboration between communities, technical platforms, and institutional partners — exactly the kind of coordination infrastructure that SyriaHub is designed to support.

## What a Syrian Heritage Digital Twin Consortium Would Look Like

The institutions with relevant capacity are fragmented: universities with GIS expertise, NGOs with field documentation programs, diaspora organisations with community networks, international heritage organisations with technical and financial resources, and Syrian institutions with the legitimacy and local knowledge that no external partner can substitute.

A Syrian Heritage Digital Twin Consortium would need to address:
- **Data governance**: who controls what data, who can access it, and how are Syrian institutions positioned as principals rather than recipients?
- **Technical standards**: common formats (3D Tiles, CityGML, GeoJSON) and metadata standards to enable interoperability
- **Sustainability**: what keeps the models updated after project funding ends?
- **Community participation**: how are residents, diaspora, and craft knowledge holders included as contributors, not just subjects?

These are governance and coordination problems, not technical ones. They are also exactly the kinds of problems that a research platform with a strong epistemic culture — like SyriaHub — is positioned to help think through.`,
    },
    ar: {
      title: 'التوائم الرقمية للمواقع التراثية السورية — إمكانيات وحدود',
      content: `## إعادة تعريف التوأم الرقمي لخدمة التراث

طُوِّر مفهوم التوأم الرقمي للبنية التحتية التشغيلية: نموذج حسابي آني لنظام مادي، يُحدَّث باستمرار ببيانات المجسّات، ويُستخدَم لمراقبة الأداء والتنبؤ بالأعطال ومحاكاة التدخلات قبل تطبيقها على الواقع. مصنع، أو شبكة طاقة، أو منطقة مدينة ذكية — أنظمة تكون فيها تدفقات البيانات المستمرة وحلقات التغذية الراجعة الآنية ممكنة تقنياً ذات قيمة تشغيلية.

المواقع التراثية السورية تُطرح مشكلة مختلفة جوهرياً. قيمة التوأم الرقمي للجامع الأموي في حلب أو قلعة الحصن ليست المراقبة التشغيلية. إنها صون السجل متعدد الأبعاد الزمنية: تمثيل منظَّم لما بدا عليه الموقع قبل أضرار الحرب، وما وُثِّق من أضرار، وما أُجري من تدخلات، وما الحال الراهنة — أو ما كانت عليه لحظة آخر دليل متاح. لموقع بعيد المنال أو مُدمَّر، لا يعدو "التوأم" أن يكون فرضيةً لا مرآةً آنية.

إعادة صياغة التوأم الرقمي بوصفه أرشيف أدلة متعدد الأبعاد الزمنية بدلاً من أداة تشغيلية آنية يفتح مسارات ممكنة فعلاً مع البيانات المتاحة للتراث السوري.

## ما الطبقات التي يمكن بناؤها

لا يشترط اكتمال التوأم الرقمي لموقع تراثي سوري كي يكون مفيداً. يمكن بناؤه تراكمياً كلما توفّرت البيانات، مع توثيق صريح للإصدارات وعدم اليقين في كل طبقة.

**طبقة الهندسة قبل الحرب.** مصادرها: بيانات فوتوغرامترية ومسح ليزري قبل الحرب (حيث يتوفر، بصورة رئيسية من مشاريع الصون المؤسسية)، وصور أرشيفية مُعالَجة بتقنية SfM (بنية الحركة)، ورسومات ومسوحات تاريخية، وصور أقمار صناعية بدقة متوسطة. هذه الطبقة تُرسي الخط الأساسي لتقييم الأضرار.

**طبقة أضرار الحرب.** مصادرها: تقييمات أضرار يونوسات وASOR CHI، وتحليلات كشف التغييرات عبر الأقمار الصناعية، وصور الفضاء الإلكتروني من داخل مناطق الحرب (مُعالَجة بتوثيق مصادرها)، وتقارير مراقبين ميدانيين خلال الهدنات.

**طبقة الحال الراهنة.** مصادرها: أحدث صور أقمار صناعية متاحة، وأي مسوحات ميدانية بعد الحرب أمكن إجراؤها، وتوثيق مجتمعي مُسهَم به من السكان العائدين أو أبناء الشتات الزائرين.

**طبقة سجل التدخلات.** مصادرها: توثيق مشاريع إعادة الإعمار والتثبيت، وتوثيق قبل وبعد من المنظمات المنفّذة، وسجلات محكومة بالإصدارات لقرارات إعادة الإعمار.

## Cesium وCityGML بوصفهما بنية تحتية

منصة Cesium — المبنية على معيار 3D Tiles المفتوح — هي أعملية بنية تحتية قائمة للتوثيق ثلاثي الأبعاد متعدد الأبعاد الزمنية للتراث على مستوى المدينة. تتعامل مع بيانات غير متجانسة (سُحُب نقطية، وشبكات ثلاثية الأبعاد، وطبقات متجهية، وصور نقطية) ضمن إطار جيومكاني موحَّد، وتدعم التحريك الزمني، ويمكن الوصول إليها عبر واجهات سطح المكتب والويب.

CityGML، معيار الاتحاد الجيومكاني المفتوح لنماذج المدن الدلالية الثلاثية الأبعاد، يوفّر مخطط البيانات لربط الهندسة بالسمات: العمود ليس مجرد شبكة بل كائن له خصائص مادية وتاريخ بناء وأهمية تاريخية وحالة ضرر وتاريخ تدخلات. الجمع بين Cesium للتصوير وCityGML للبنية الدلالية يفتح لتوثيق التراث السوري مساراً نحو سجلات ثلاثية الأبعاد قابلة للتشغيل التبادلي وللتحديث التراكمي.

## مشكلة التوأم الميت

توأم رقمي دون تحديثات بيانات ليس توأماً. إنه نموذج. للمواقع التراثية السورية التي لا يزال الوصول الميداني إليها متعذراً — معظم المواقع في مناطق شهدت قتالاً ضارياً — لا يمكن تحديث "التوأم" إلا من مصادر بعيدة: صور أقمار صناعية وتصوير مُقدَّم من المجتمع.

التحديث من المصادر المجتمعية هو المسار الأكثر واعدية. ظلّت مجتمعات الشتات السوري طوال سنوات الحرب تُصوّر مواقع تزورها، وترفع صوراً على الفضاء الإلكتروني، وتساهم في منصات Wikimapia وOpenStreetMap. هذه البيانات غير منظّمة، ووسوم إحداثياتها متفاوتة، وجودتها متباينة — لكنها تُشكّل تدفقاً مستمراً من التوثيق الميداني لا يستطيع الاستشعار عن بُعد المنهجي توفيره.

خط تدفق منظَّم لاستيعاب الصور المُسهَم بها مجتمعياً وتوثيق مصادرها وإضافة بيانات الإحداثيات وإدماجها في نموذج التوأم ممكن تقنياً. يتطلب تعاوناً بين المجتمعات والمنصات التقنية والشركاء المؤسسيين — وهو تحديداً نوع البنية التنسيقية التي يدعمها SyriaHub.

## كيف سيبدو اتحاد التوائم الرقمية للتراث السوري

المؤسسات ذات الكفاءات الملائمة مبعثرة: جامعات ذات خبرة GIS، ومنظمات غير حكومية ذات برامج توثيق ميداني، ومنظمات شتات لها شبكات مجتمعية، ومنظمات تراث دولية ذات موارد تقنية ومالية، ومؤسسات سورية تمتلك الشرعية والمعرفة المحلية التي لا يمكن لأي شريك خارجي أن يعوّضها.

اتحاد التوائم الرقمية للتراث السوري سيحتاج إلى معالجة:
- **حوكمة البيانات**: من يتحكم في أي بيانات، ومن يمكنه الوصول إليها، وكيف تُعاد المؤسسات السورية أطرافاً فاعلة أساسية لا مجرد متلقّين؟
- **المعايير التقنية**: تنسيقات مشتركة (3D Tiles، وCityGML، وGeoJSON) ومعايير بيانات وصفية لضمان التشغيل التبادلي.
- **الاستدامة**: ما الذي يُبقي النماذج مُحدَّثة بعد انتهاء تمويل المشروع؟
- **المشاركة المجتمعية**: كيف يُشرَك السكان وأبناء الشتات وحاملو المعرفة الحرفية مساهمين لا مجرد موضوع دراسة؟

هذه مشاكل حوكمة وتنسيق، لا تقنية. وهي أيضاً بالضبط أنواع المشاكل التي تتمتع بأفضل وضع لمعالجتها منصة بحثية ذات ثقافة معرفية راسخة — كـ SyriaHub.`,
    },
  },
]
