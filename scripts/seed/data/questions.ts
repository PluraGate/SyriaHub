import type { SeedPost } from '../types'

export const questions: SeedPost[] = [
  // ─── Q1: GIS Datasets ────────────────────────────────────────────────────
  {
    cover_image_key: null,
    content_type: 'question',
    status: 'published',
    tags: ['gis', 'documentation', 'syria', 'open-data', 'remote-sensing'],
    en: {
      title: 'What GIS datasets are actually usable for Syrian site condition monitoring today?',
      content: `There are several openly advertised sources of satellite-derived data for Syrian heritage and infrastructure — UNOSAT, ASOR CHI, Copernicus EMS, Planet Labs through HDX, Sentinel-2 open access, ESRI's ArcGIS Living Atlas Syria layers — but the gap between "the data exists" and "the data is usable for a specific research question" is often large.

I'm trying to understand the practical reality of each dataset from people who have actually used them for Syrian heritage or urban condition monitoring.

**Specifically looking for assessments on:**
- Update frequency (when was the most recent update? is it maintained actively?)
- Spatial resolution and what it actually allows you to do (vs. what the specification claims)
- Coverage gaps — which Syrian regions or site types are underrepresented?
- Licensing for academic and NGO use
- Practical access barriers (registration requirements, data volume, API reliability)
- Known quality issues or biases in the damage classification

If you've used any of these datasets in your research, what did you find? What would you recommend to someone starting a site condition monitoring project for Syrian heritage today?`,
    },
    ar: {
      title: 'ما مجموعات بيانات نظم المعلومات الجغرافية القابلة للاستخدام فعلياً لرصد حالة المواقع السورية اليوم؟',
      content: `ثمة عدة مصادر مُعلَن عنها لبيانات الأقمار الصناعية المتعلقة بالتراث والبنية التحتية السورية — يونوسات، ومبادرات ASOR CHI، وCopernicus EMS، وPlanet Labs عبر منصة HDX، وSentinel-2 مفتوح المصدر، وطبقات ArcGIS Living Atlas لسوريا — غير أن الهوّة بين "البيانات موجودة" و"البيانات قابلة للاستخدام في سؤال بحثي بعينه" كثيراً ما تكون واسعة.

أسعى إلى فهم الواقع العملي لكل مجموعة بيانات من منظور من استخدمها فعلاً في رصد حالة التراث أو الأوضاع الحضرية السورية.

**أبحث تحديداً عن تقييمات لـ:**
- وتيرة التحديث (متى آخر تحديث؟ هل تُصان بانتظام؟)
- الدقة المكانية وما تُتيحه فعلاً مقارنةً بما تُعلنه المواصفات
- ثغرات التغطية — أي المناطق أو أنواع المواقع السورية ممثَّلة تمثيلاً ناقصاً؟
- الترخيص للاستخدام الأكاديمي والمؤسسات غير الحكومية
- عوائق الوصول العملية (متطلبات التسجيل، حجم البيانات، موثوقية الواجهة البرمجية)
- مشاكل الجودة أو التحيزات المعروفة في تصنيف الأضرار

إن كنت قد استخدمت أياً من هذه البيانات في بحثك، ماذا وجدت؟ وما الذي توصي به لمن يبدأ مشروعاً لرصد حالة مواقع التراث السوري اليوم؟`,
    },
  },

  // ─── Q2: Eyewitness vs Satellite ─────────────────────────────────────────
  {
    cover_image_key: null,
    content_type: 'question',
    status: 'published',
    tags: ['research-methodology', 'documentation', 'data-ethics', 'evidence', 'trust'],
    en: {
      title: 'How should we weight eyewitness accounts vs. satellite data when they contradict each other?',
      content: `This is a methodological question I keep running into. SyriaHub's trust framework distinguishes between proximity to evidence (T3) — field observation scores higher than remote sensing — but that framing seems to need more nuance when applied to specific conflict documentation scenarios.

**A concrete case type:** A satellite change detection analysis shows a heritage building as "heavily damaged/destroyed" (structure visible in 2013 imagery absent from 2017 imagery). An eyewitness who was in the neighbourhood in 2016 reports the structure was standing and being used. A second eyewitness report from 2019 says they visited the site and found rubble.

Which of these do you treat as authoritative, and why? What additional information would you seek?

**A second case type:** A damage assessment organisation classifies a site as "looted" based on disturbed surface imagery. Local residents who have returned describe the site as intact and report no looting activity. The organisation's methodology was built on training data from a different conflict context.

I'm interested in frameworks people use — both formal (like the T1–T5 dimensions) and informal — for navigating these contradictions. What does responsible documentation practice look like when your most granular data and your most proximate data disagree?`,
    },
    ar: {
      title: 'كيف نوازن بين شهادات شهود العيان وبيانات الأقمار الصناعية حين تتعارض؟',
      content: `هذا سؤال منهجي أعود إليه مراراً. يُميّز إطار الثقة في SyriaHub بين القرب من الدليل (م3) — إذ يحصل الرصد الميداني على تقييم أعلى من الاستشعار عن بُعد — لكن هذا الإطار يبدو في حاجة إلى مزيد من الدقة حين يُطبَّق على سيناريوهات توثيق الحرب المحددة.

**حالة ملموسة من النوع الأول:** تحليل كشف التغييرات عبر الأقمار الصناعية يُصنّف مبنى تراثياً بوصفه "متضرراً بشدة/مدمَّراً" (البنية المرئية في صور 2013 غائبة في صور 2017). شاهد عيان كان في الحي عام 2016 يُفيد بأن البنية كانت قائمة ومستخدَمة. تقرير شاهد عيان ثانٍ من 2019 يقول إنه زار الموقع ووجد أنقاضاً.

أيٌّ من هذه تعدّ مرجعاً موثوقاً، ولماذا؟ وما المعلومات الإضافية التي ستبحث عنها؟

**حالة من النوع الثاني:** تُصنّف منظمة تقييم أضرار موقعاً ما بوصفه "منهوباً" استناداً إلى صور تُظهر اضطراباً في السطح. سكان محليون عائدون يصفون الموقع بأنه سليم ولا يُفيدون بأي نشاط نهب. بُنيت منهجية المنظمة على بيانات تدريب مستمَدة من سياق حرب مختلف.

أودّ الاطلاع على الأطر التي يستخدمها الناس — الرسمية منها (كالأبعاد م1–م5) والعملية غير الرسمية — للتعامل مع هذه التناقضات. كيف تبدو ممارسة التوثيق المسؤولة حين تختلف البيانات الأكثر تفصيلاً عن البيانات الأقرب ميدانياً؟`,
    },
  },

  // ─── Q3: Qanat / Traditional Water Systems ───────────────────────────────
  {
    cover_image_key: null,
    content_type: 'question',
    status: 'published',
    tags: ['water-systems', 'heritage', 'syria', 'infrastructure', 'vernacular'],
    en: {
      title: 'Can traditional Syrian water management systems (qanat/aflaj) inform post-war infrastructure design?',
      content: `Syria has a rich tradition of gravity-fed water management — qanat channels, aflaj networks, cisterns, saqiya waterwheels — that predate modern infrastructure by centuries and that represented sophisticated local responses to the semi-arid and arid conditions of much of the country.

The war has damaged or destroyed significant parts of the modern water infrastructure, and in some areas traditional systems that were already in partial disuse have seen renewed interest as alternatives or supplements to damaged modern networks.

**Questions I'm trying to answer:**
1. Which traditional water management systems are documented, where, and in what condition? Is there any systematic survey of surviving qanat infrastructure in Syria?
2. Are there cases where damaged modern water infrastructure has been effectively replaced or supplemented by rehabilitated traditional systems?
3. What are the technical barriers to rehabilitating a qanat or aflaj system that has been out of use for decades? Is the expertise to do this still available among Syrian communities?
4. There's a paper on using digital technology to rediscover a 19th-century water catchment system in Spain (the Montilla study) — has any equivalent methodology been applied to Syrian qanat documentation?
5. What would need to be true for traditional water management systems to be a meaningful component of post-war water infrastructure planning, rather than just a heritage curiosity?

Looking especially for people with field knowledge of specific regions — the Hauran, the Aleppo region, the Khabur basin, or the coastal mountains.`,
    },
    ar: {
      title: 'هل يمكن لأنظمة إدارة المياه التقليدية السورية (القنوات/الأفلاج) أن تُوجّه تصميم البنية التحتية بعد الحرب؟',
      content: `تمتلك سوريا تراثاً غنياً في إدارة المياه بالجاذبية — قنوات وأفلاج وصهاريج وسواقٍ — سابقة للبنية التحتية الحديثة بقرون، وتُمثّل استجابات محلية متطورة لظروف شبه الجفاف والجفاف التي تسود معظم أنحاء البلاد.

أضرت الحرب بأجزاء كبيرة من البنية التحتية المائية الحديثة أو دمّرتها، وفي بعض المناطق شهدت الأنظمة التقليدية التي كانت خارج الخدمة جزئياً اهتماماً متجدداً بوصفها بدائل أو مكمّلات للشبكات الحديثة المتضررة.

**أسئلة أسعى للإجابة عنها:**
1. ما أنظمة إدارة المياه التقليدية الموثَّقة، وأين، وما حالتها؟ هل يوجد مسح منهجي للبنية التحتية للقنوات الباقية في سوريا؟
2. هل ثمة حالات حلّت فيها أنظمة تقليدية مُعادة إلى الخدمة محلّ البنية التحتية الحديثة المتضررة أو أسهمت في تكملتها؟
3. ما العوائق التقنية لإعادة تأهيل قناة أو فلج خرج عن الخدمة منذ عقود؟ هل لا يزال في متناول المجتمعات السورية الخبرةُ اللازمة لذلك؟
4. ثمة دراسة حول استخدام التقنية الرقمية لإعادة اكتشاف نظام تجميع مياه من القرن التاسع عشر في إسبانيا (دراسة مونتيليا) — هل طُبِّق أي منهج مماثل على توثيق القنوات السورية؟
5. ما الشروط اللازمة لكي تكون أنظمة المياه التقليدية مكوّناً ذا معنى في تخطيط البنية التحتية المائية بعد الحرب، لا مجرد أثر تراثي للفضول؟

أبحث بالدرجة الأولى عن أصحاب معرفة ميدانية بمناطق بعينها — الحوران، ومنطقة حلب، وحوض الخابور، والجبال الساحلية.`,
    },
  },

  // ─── Q4: Climate Performance and Reconstruction ──────────────────────────
  {
    cover_image_key: null,
    content_type: 'question',
    status: 'published',
    tags: ['urban-planning', 'aleppo', 'climate-adaptation', 'heritage', 'reconstruction'],
    en: {
      title: 'What reconstruction approaches best preserve pre-war urban climate performance in Aleppo\'s old city?',
      content: `Aleppo's historic core (the UNESCO-listed old city) was extensively damaged during the war. As reconstruction of residential and commercial fabric proceeds — both officially and through informal self-build — decisions are being made about street widths, building heights, courtyard retention, and material choices that will determine whether the rebuilt fabric retains the passive climate performance of the original, or replaces it with a thermally inferior but visually similar approximation.

The specific climate characteristics of Aleppo's historic core I'm trying to understand:
- How did the traditional street canyon geometry (narrow, high-walled lanes) manage summer heat and winter wind in the specific Aleppo microclimate?
- What was the thermal contribution of the covered suq system? Is the rebuilt suq (some sections have been restored) performing similarly?
- How much of the original building stock used traditional materials (basalt, limestone) with high thermal mass versus later modifications with brick/concrete?
- Are there any monitored microclimate data points from either pre-war Aleppo or the current partially-rebuilt areas?

I'm also interested in governance: who has standing to set reconstruction standards for the old city that would incorporate climate performance criteria? Is UNESCO's role here advisory or binding? What are the Syrian institutions that should be setting these standards?

Has anyone modelled (computationally or physically) what happens to pedestrian thermal comfort in the historic suq as the roofing coverage changes?`,
    },
    ar: {
      title: 'أي مناهج إعادة الإعمار تحافظ بشكل أفضل على الأداء المناخي الحضري لمدينة حلب القديمة قبل الحرب؟',
      content: `تعرّض النسيج التاريخي لمدينة حلب القديمة (المدرجة على قائمة اليونسكو) لأضرار واسعة خلال الحرب. مع تقدّم إعادة إعمار النسيج السكاني والتجاري — رسمياً وعبر البناء الذاتي غير الرسمي — تُتَّخذ قرارات تتعلق بعروض الشوارع وارتفاعات المباني والحفاظ على الأفنية واختيار المواد، ستُحدّد ما إذا كان النسيج المُعاد سيحتفظ بالأداء المناخي السلبي للأصل، أم سيستبدله بمحاكاة أدنى حرارياً وإن بدت بصرياً مشابهة.

الخصائص المناخية المحددة لمركز حلب التاريخي التي أسعى إلى فهمها:
- كيف أدارت هندسة ممرات الشوارع التقليدية (الأزقة الضيقة عالية الجدران) حرارة الصيف ورياح الشتاء في المناخ الدقيق لحلب تحديداً؟
- ما الإسهام الحراري لمنظومة السوق المسقوف؟ هل السوق المُعاد بناؤه (أُعيدت بعض الأقسام) يؤدي أداءً مشابهاً؟
- كم من الرصيد الإجمالي للمباني الأصلية استخدم مواد تقليدية (البازلت والكلس) ذات كتلة حرارية عالية مقابل تعديلات لاحقة بالطابوق والخرسانة؟
- هل تتوفر أي بيانات رصد للمناخ الدقيق من حلب قبل الحرب أو من المناطق المُعاد بناؤها جزئياً حالياً؟

أودّ أيضاً التعمق في الحوكمة: من يملك الصلاحية لوضع معايير إعادة الإعمار للمدينة القديمة التي تُدرج معايير الأداء المناخي؟ هل دور اليونسكو هنا استشاري أم ملزم؟ ما المؤسسات السورية التي ينبغي أن تضع هذه المعايير؟

هل صمّم أحد (حسابياً أو نموذجياً فيزيائياً) ما يحدث لراحة المشاة الحرارية في السوق التاريخي مع تغيّر نسبة تغطية الأسقف؟`,
    },
  },

  // ─── Q5: Intangible Heritage ─────────────────────────────────────────────
  {
    cover_image_key: null,
    content_type: 'question',
    status: 'published',
    tags: ['intangible-heritage', 'documentation', 'syria', 'oral-history', 'crafts'],
    en: {
      title: 'How do we document intangible heritage — craft knowledge, oral tradition, spatial practice — before it is permanently lost?',
      content: `Syria's material heritage destruction is well-documented and has received significant international attention and resources. The intangible heritage loss is less visible and has received far less systematic attention, but may in some ways be more irreversible.

I'm thinking specifically about:

**Construction craft knowledge:** Syrian master builders in ablaq stonework, muqarnas plasterwork, wooden mashrabiyya screens, geometric tilework, and traditional lime mortar preparation hold tacit knowledge — mix ratios, sequencing, hand-tool techniques, material sourcing — that is not written down and exists only in practice and memory. Many of these craftspeople are elderly, displaced, and not being sought out. When they die, this knowledge dies with them.

**Spatial and social knowledge:** Communities hold detailed knowledge of how their urban environments worked — which streets flooded in winter, where the shade fell in August, how the suq layout supported particular social practices, which buildings had which structural vulnerabilities. This knowledge is not in any archive.

**Oral historical knowledge:** Residents' layered memories of buildings and neighbourhoods — what happened where, who lived here, what this was — constitute a form of historical documentation that no satellite image or official record can replace.

**Questions:**
- Are there ongoing systematic efforts to document any of these categories in Syria? What methodologies are being used?
- What are the best existing models for this kind of documentation from other post-war contexts (Iraq? Bosnia? Cambodia)?
- How does this kind of documentation integrate with the formal heritage record — can oral accounts be incorporated into HBIM models in a structured way?
- Who should be doing this work, and who should own the resulting documentation?`,
    },
    ar: {
      title: 'كيف نوثّق التراث غير المادي — المعرفة الحرفية والتقليد الشفهي والممارسة المكانية — قبل ضياعه نهائياً؟',
      content: `تدمير التراث المادي السوري موثَّق توثيقاً جيداً وحظي باهتمام دولي وموارد كبيرة. خسارة التراث غير المادي أقل وضوحاً وتلقّت اهتماماً منهجياً أقل بكثير، لكنها في بعض الجوانب أكثر لارجعةً.

أفكّر تحديداً في:

**المعرفة الحرفية الإنشائية:** يحمل أساتذة البناء السوريون في الأبلق الحجري ومحاريب المقرنصات وشاشات المشربية الخشبية والبلاط الهندسي وإعداد الجير التقليدي معرفةً ضمنية — نسب الخلط والتسلسل وتقنيات الأدوات اليدوية ومصادر المواد — غير مكتوبة ولا توجد إلا في الممارسة والذاكرة. كثير من هؤلاء الحرفيين كبار في السن، مُهجَّرون، ولا يُسعى إليهم. حين يرحلون، ترحل معهم هذه المعرفة.

**المعرفة المكانية والاجتماعية:** تحمل المجتمعات معرفةً تفصيلية بآليات عمل بيئاتها الحضرية — أي الشوارع تفيض في الشتاء، وأين يقع الظل في آب، وكيف دعم تخطيط السوق ممارسات اجتماعية بعينها، وأي المباني يحمل ثغرات هيكلية. هذه المعرفة ليست في أي أرشيف.

**المعرفة التاريخية الشفهية:** ذكريات السكان المتراكمة عن المباني والأحياء — ما حدث أين، ومن سكن هنا، وما كان هذا — تُشكّل شكلاً من التوثيق التاريخي لا تستطيع أي صورة قمر صناعي أو سجل رسمي تعويضه.

**أسئلة:**
- هل تجري حالياً جهود منهجية لتوثيق أيٍّ من هذه الفئات في سوريا؟ ما المناهج المستخدَمة؟
- ما أفضل النماذج القائمة لهذا النوع من التوثيق في سياقات ما بعد الحرب المشابهة (العراق؟ البوسنة؟ كمبوديا؟)؟
- كيف يندمج هذا النوع من التوثيق مع السجل التراثي الرسمي — هل يمكن إدراج الروايات الشفهية في نماذج HBIM بطريقة منظَّمة؟
- من ينبغي أن يتولى هذا العمل، ومن ينبغي أن يملك التوثيق الناتج؟`,
    },
  },
]
