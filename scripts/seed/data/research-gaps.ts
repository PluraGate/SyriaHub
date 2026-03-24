import type { SeedResearchGap } from '../types'

export const researchGaps: SeedResearchGap[] = [
  // ─── Gap 1: Sub-site GIS database ────────────────────────────────────────
  {
    discipline: 'Heritage Conservation',
    tags: ['gis', 'heritage-conservation', 'syria', 'spatial-data', 'documentation'],
    priority: 'critical',
    gap_type: 'data',
    is_strategic: true,
    spatial_context: 'Syrian Arab Republic — all governorates',
    temporal_context_start: '2011-03-01',
    temporal_context_end: null,
    en: {
      title: 'No Systematic GIS Database of Syrian Heritage Site Damage at Sub-Site Resolution',
      description: `Existing damage assessments (ASOR CHI, UNOSAT, UNESCO, ALIPH) document Syrian heritage site damage at the site level: a building or complex is classified as "damaged," "heavily damaged," or "destroyed." There is no publicly available, systematically maintained GIS database recording damage at the sub-site or feature level — which specific walls, rooms, decorative programs, structural elements, or archaeological layers have been affected — with timestamped, versioned updates.

This granularity is essential for HBIM-based reconstruction planning: without knowing which parts of a building survive, it is impossible to distinguish where reconstruction should aim for authenticity (surviving original fabric exists) versus where it must acknowledge a break in continuity (nothing survives to guide the reconstruction). It is also essential for prioritising stabilisation interventions and for evaluating reconstruction claims.

The technical barriers to creating this database are not insurmountable: sub-site annotation of satellite imagery, field reports, and social media documentation is feasible using existing GIS tools. The barriers are institutional — no organisation has taken responsibility for creating and maintaining this resource — and political, as sub-site data ownership is contested.

This gap directly blocks the application of the HBIM conservation methodologies (Saricaoglu & Saygi) and the digital twin approaches (Cesium/CityGML) that are described in the research on this platform. It is the most critical data gap in Syrian heritage documentation.`,
    },
    ar: {
      title: 'غياب قاعدة بيانات جغرافية منهجية لأضرار الحرب على المواقع التراثية السورية على مستوى التفاصيل الدقيقة',
      description: `تُسجّل تقييمات الأضرار القائمة (ASOR CHI، ويونوسات، واليونسكو، وALIPH) أضرار المواقع التراثية السورية على مستوى الموقع: يُصنَّف مبنى أو مجمع بأنه "مُتضرّر" أو "مُتضرّر بشدة" أو "مُدمَّر". لا توجد قاعدة بيانات جغرافية متاحة للجمهور، تُصان بمنهجية، تُسجّل الأضرار على مستوى الأجزاء أو العناصر الفردية — أي الجدران والغرف والبرامج الزخرفية والعناصر الهيكلية والطبقات الأثرية بعينها التي طالها الضرر — مع تحديثات زمنية ومُؤرشَفة بالإصدارات.

هذا المستوى من التفاصيل ضروري لتخطيط إعادة الإعمار المبني على HBIM: دون معرفة أي أجزاء من المبنى لا تزال قائمة، يستحيل التمييز بين ما ينبغي أن تستهدف إعادة إعماره الأصالة (نسيج أصلي باقٍ) وما يجب أن يُقرّ بقطيعة في الاستمرارية (لا شيء يبقى يُرشد إعادة البناء). وهو أيضاً ضروري لتحديد أولويات تدخلات التثبيت وتقييم مطالبات إعادة الإعمار.

العوائق التقنية لإنشاء هذه القاعدة ليست عسيرة: التعليق التفصيلي لصور الأقمار الصناعية والتقارير الميدانية وتوثيق الفضاء الإلكتروني على مستوى أجزاء المواقع ممكن بالأدوات الجغرافية القائمة. العوائق مؤسسية — لم تتحمّل أي منظمة مسؤولية إنشاء هذا المورد وصيانته — وسياسية، إذ ملكية البيانات على المستوى التفصيلي محلّ تنازع.

هذه الثغرة تعوق مباشرةً تطبيق منهجيات الحفاظ HBIM (صاريجاوغلو وسايغي) ومناهج التوأم الرقمي (Cesium/CityGML) الموصوفة في الأبحاث على هذه المنصة. إنها الثغرة البيانية الأكثر إلحاحاً في توثيق التراث السوري.`,
    },
  },

  // ─── Gap 2: Baseline Climate Data ────────────────────────────────────────
  {
    discipline: 'Architecture & Urban Planning',
    tags: ['urban-planning', 'climate-adaptation', 'syria', 'heritage-conservation', 'data-driven-design'],
    priority: 'high',
    gap_type: 'data',
    is_strategic: true,
    spatial_context: 'Aleppo, Damascus, Homs — historic city cores',
    temporal_context_start: '1970-01-01',
    temporal_context_end: '2011-03-01',
    en: {
      title: 'Missing Baseline Climate Performance Data for Syrian Historic Urban Cores',
      description: `The comparative study by Hassan, Lee, and Yoo demonstrates the value of measured microclimate data from historic urban fabrics for informing both conservation and new design. No equivalent dataset exists for Syrian historic city cores.

Pre-conflict meteorological station records for Syria are sparse and not spatially resolved to the urban-fabric level — they record conditions at airport or open-field stations, not within the narrow streets and courtyard spaces of the old city. There are no published computational fluid dynamics (CFD) simulation studies for Damascus's historic core, no street-level temperature transect measurements for Aleppo's suq system, and no urban heat island (UHI) quantification for any Syrian historic settlement.

Without this baseline data, it is impossible to:
- Quantify what the traditional urban fabric was providing in terms of passive cooling and wind management
- Evaluate whether reconstruction proposals for street widths, building heights, and courtyard retention will preserve or degrade that performance
- Compare reconstructed areas with surviving historic fabric to assess whether thermal performance has been maintained

The data that would allow retrospective simulation exists: archival satellite imagery for morphology extraction, published meteorological data for boundary conditions, and validated simulation tools (EnergyPlus, ENVI-met, Ladybug/Honeybee). What does not exist is the research effort to assemble and process it for Syrian contexts. This is a tractable research gap that any team with GIS, remote sensing, and building performance simulation capability could begin to address.`,
    },
    ar: {
      title: 'غياب بيانات الأداء المناخي المرجعية للأنسجة الحضرية التاريخية السورية',
      description: `تُثبت الدراسة المقارنة لحسن ولي ويو قيمة البيانات المناخية الدقيقة المقاسة من الأنسجة الحضرية التاريخية لإثراء قرارات الحفاظ والتصميم الجديد. لا يوجد أي مجموعة بيانات مكافئة للأنسجة الحضرية التاريخية السورية.

سجلات محطات الأرصاد الجوية السورية قبل الحرب شحيحة وغير مُحدَّدة مكانياً على مستوى النسيج الحضري — تُسجّل الأحوال في محطات المطارات أو الحقول المكشوفة، لا في الأزقة الضيقة والفضاءات الصحنية للمدينة القديمة. لا توجد دراسات محاكاة لديناميكا الموائع الحسابية منشورة للنسيج التاريخي لدمشق، ولا قياسات مقاطع حرارية على مستوى الشارع لمنظومة أسواق حلب، ولا تحديد لظاهرة الجزيرة الحرارية الحضرية لأي مستوطنة تاريخية سورية.

دون هذه البيانات الأساسية، يستحيل:
- تحديد ما كان النسيج الحضري التقليدي يوفّره من تبريد سلبي وإدارة للرياح كمياً
- تقييم ما إذا كانت مقترحات إعادة الإعمار بشأن عروض الشوارع وارتفاعات المباني والحفاظ على الأفنية ستصون هذا الأداء أم تُنزلق منه
- مقارنة المناطق المُعاد بناؤها مع النسيج التاريخي الباقي لتقييم الحفاظ على الأداء الحراري

البيانات التي ستُتيح المحاكاة الاسترجاعية موجودة: صور أرشيفية للأقمار الصناعية لاستخراج المورفولوجيا، وبيانات الأرصاد الجوية المنشورة للشروط الحدّية، وأدوات محاكاة مُتحقَّق منها (EnergyPlus، وENVI-met، وLadybug/Honeybee). ما يغيب هو الجهد البحثي لتجميع هذه البيانات ومعالجتها في السياقات السورية. هذه ثغرة بحثية قابلة للمعالجة يستطيع أي فريق يمتلك قدرات GIS والاستشعار عن بُعد ومحاكاة أداء المباني البدء في معالجتها.`,
    },
  },

  // ─── Gap 3: Craft Knowledge ───────────────────────────────────────────────
  {
    discipline: 'Architecture & Built Heritage',
    tags: ['intangible-heritage', 'syria', 'heritage-conservation', 'crafts', 'documentation'],
    priority: 'critical',
    gap_type: 'population',
    is_strategic: true,
    spatial_context: 'Syrian Arab Republic and Syrian diaspora communities',
    temporal_context_start: '2011-03-01',
    temporal_context_end: null,
    en: {
      title: 'No Documented Inventory of Surviving Traditional Construction Craft Knowledge in Syria',
      description: `Syrian master craftspeople in ablaq stonework (the characteristic alternating black-and-white banded masonry of Aleppo and the Hauran), muqarnas plasterwork, geometric tilework, wooden mashrabiyya screens, and traditional lime mortar preparation hold tacit knowledge that is not written down and exists only in practice and lived memory. This knowledge encompasses: specific material mix ratios, tool selection and technique, sequencing of operations, sourcing of traditional materials (specific limestone quarries, particular mineral pigments), and the aesthetic judgements that distinguish authentic craft from contemporary imitation.

The war drove these craftspeople out of their workshops and communities. Many are elderly. The displacement has not only removed them from their tools and materials but severed the apprenticeship relationships through which craft knowledge normally transmits across generations.

No systematic effort exists to inventory who these craftspeople are, where they are now, what knowledge they hold, and in what form that knowledge could be documented. The Aga Khan Trust for Culture and several Syrian heritage NGOs have worked with individual craftspeople in specific reconstruction contexts, but this is ad hoc and not cumulative.

The urgency cannot be overstated: this is a population-specific research gap where the population is actively diminishing through mortality and the absence of apprenticeship transmission. Every year without systematic documentation represents permanent loss. Data-driven approaches to cultural heritage documentation — systematic surveys, structured interviews, video documentation of practice, digital archiving — are directly applicable here, but the resources and coordination to apply them are lacking.`,
    },
    ar: {
      title: 'غياب جرد موثَّق للمعرفة الحرفية الإنشائية التقليدية الباقية في سوريا',
      description: `يحمل أساتذة الحرف السوريون في الأبلق الحجري (البناء المتناوب الأسود والأبيض المميز لحلب والحوران)، ومحاريب المقرنصات الجبسية، والبلاط الهندسي، وشاشات المشربية الخشبية، وإعداد الجير التقليدي، معرفةً ضمنية غير مكتوبة لا وجود لها إلا في الممارسة والذاكرة الحية. تشمل هذه المعرفة: نسب مزج مواد محددة، واختيار الأدوات والتقنيات، وتسلسل العمليات، ومصادر المواد التقليدية (محاجر حجر جيري بعينها، وأصبغة معدنية محددة)، والأحكام الجمالية التي تُميّز الحرفة الأصيلة عن المحاكاة المعاصرة.

أخرجت الحرب هؤلاء الحرفيين من ورشهم ومجتمعاتهم. كثيرون منهم كبار في السن. ولم يقطع التهجير صلتهم بأدواتهم ومواد عملهم فحسب، بل أنهى علاقات التلمذة الصناعية التي تنتقل عبرها المعرفة الحرفية عادةً عبر الأجيال.

لا يوجد أي جهد منهجي لإحصاء هؤلاء الحرفيين وتحديد أماكنهم ورصد ما يحملونه من معرفة وتحديد الأشكال التي يمكن بها توثيقها. تعاملت مؤسسة آغا خان للثقافة وعدة منظمات تراثية سورية غير حكومية مع حرفيين بأعيانهم في سياقات إعادة إعمار محددة، لكن ذلك يظل عشوائياً وغير تراكمي.

لا يمكن المبالغة في وصف الإلحاح: هذه ثغرة بحثية خاصة بفئة سكانية آخذة في التقلص فعلاً بسبب الوفاة وغياب التوارث عبر التلمذة. كل عام دون توثيق منهجي يُمثّل خسارة دائمة. المناهج القائمة على البيانات لتوثيق التراث الثقافي — مسوحات منهجية، ومقابلات منظَّمة، وتوثيق مصوَّر للممارسة، وأرشفة رقمية — قابلة للتطبيق مباشرةً هنا، لكن الموارد والتنسيق اللازمَين لتطبيقها مفقودان.`,
    },
  },

  // ─── Gap 4: Reconstruction Evaluation Methodology ────────────────────────
  {
    discipline: 'Architecture & Urban Planning',
    tags: ['urban-planning', 'islamic-architecture', 'heritage-conservation', 'research-methodology', 'syria'],
    priority: 'high',
    gap_type: 'methodological',
    is_strategic: false,
    spatial_context: 'Syria, Iraq, Yemen, Libya — cities damaged by war',
    temporal_context_start: '2003-01-01',
    temporal_context_end: null,
    en: {
      title: 'No Agreed Methodology for Evaluating Post-War Reconstruction Outcomes in Islamic Historic Urban Cores',
      description: `Post-war reconstruction of historic urban cores has proceeded in multiple conflict-affected Islamic cities — Fallujah (Iraq, from 2004), Mosul (Iraq, from 2017), Homs (Syria, from 2017), parts of Aleppo (Syria, from 2018) — without any agreed framework for evaluating whether the outcomes are good. "Good" in this context is genuinely multidimensional: it encompasses heritage authenticity, climate performance, social cohesion, economic recovery, and livability for returning residents. No published methodology integrates all of these dimensions into a coherent evaluation framework.

Existing evaluation frameworks address individual dimensions in isolation:
- Heritage authenticity assessment (UNESCO, ICOMOS Venice Charter) focuses on material continuity without addressing climate or social performance
- Post-occupancy evaluation (POE) in architecture addresses user experience and environmental performance but was not developed for post-war reconstruction contexts
- Humanitarian shelter assessments address immediate needs but not long-term livability or heritage outcomes

The comparative study methodology (Hassan, Lee & Yoo) provides one precedent for multi-metric evaluation, but is limited to climate performance and does not include heritage authenticity, social outcomes, or economic recovery.

Developing an integrated evaluation framework for post-war reconstruction in Islamic historic urban cores would:
1. Allow systematic comparison between reconstruction approaches in different cities
2. Enable learning across contexts (what worked in Fallujah? what has not worked in Homs?)
3. Provide a standard that funders, implementing organisations, and Syrian institutions could use to hold reconstruction accountable

This is a methodological gap that collaborative research — combining heritage conservation expertise, social science, building performance analysis, and community input — could address.`,
    },
    ar: {
      title: 'غياب منهجية متفق عليها لتقييم نتائج إعادة الإعمار بعد الحرب في الأنسجة الحضرية التاريخية الإسلامية',
      description: `مضت إعادة إعمار الأنسجة الحضرية التاريخية في مدن إسلامية متعددة متضررة من الحرب — الفلوجة (العراق، منذ 2004)، والموصل (العراق، منذ 2017)، وحمص (سوريا، منذ 2017)، وأجزاء من حلب (سوريا، منذ 2018) — دون أي إطار متفق عليه لتقييم ما إذا كانت النتائج جيدة. "الجيد" هنا متعدد الأبعاد فعلاً: يشمل الأصالة التراثية والأداء المناخي والتماسك الاجتماعي والتعافي الاقتصادي والقابلية للسكن للعائدين. لا توجد منهجية منشورة تدمج هذه الأبعاد كلها في إطار تقييم متماسك.

تُعالج أطر التقييم القائمة أبعاداً فردية بمعزل عن بعضها:
- تقييم الأصالة التراثية (اليونسكو، ميثاق البندقية ICOMOS) يُركّز على الاستمرارية المادية دون معالجة الأداء المناخي أو الاجتماعي
- تقييم ما بعد الإشغال في العمارة يعالج تجربة المستخدم والأداء البيئي لكنه لم يُطوَّر لسياقات إعادة الإعمار بعد الحرب
- تقييمات المأوى الإنساني تعالج الاحتياجات الآنية لكن ليس الأهلية للسكن على المدى البعيد أو نتائج التراث

تطوير إطار تقييم متكامل لإعادة الإعمار بعد الحرب في الأنسجة الحضرية التاريخية الإسلامية سيُتيح:
1. مقارنة منهجية بين مناهج إعادة الإعمار في مدن مختلفة
2. التعلم عبر السياقات (ما الذي نجح في الفلوجة؟ ما الذي لم ينجح في حمص؟)
3. توفير معيار يستطيع الممولون والمنظمات المنفّذة والمؤسسات السورية استخدامه لمحاسبة إعادة الإعمار

هذه ثغرة منهجية يستطيع البحث التعاوني — الجامع بين خبرة صون التراث والعلوم الاجتماعية وتحليل أداء المباني ومُدخلات المجتمع — معالجتها.`,
    },
  },
]
