import { PrismaClient, Role, AttemptType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const optionBlock = (prefix) => ({
  optionA: `${prefix} — خيار أ`,
  optionB: `${prefix} — خيار ب`,
  optionC: `${prefix} — خيار ج`,
  optionD: `${prefix} — خيار د`,
});

async function main() {
  const adminHash = await bcrypt.hash('Admin123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@al-faheem.local' },
    update: {},
    create: {
      email: 'admin@al-faheem.local',
      passwordHash: adminHash,
      fullName: 'مدير النظام',
      role: Role.ADMIN,
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  /**
   * مواد منصة الفهيم: صور بأسلوب دراسي موحّد (مكتب، إضاءة هادئة، تركيز على الرياضيات والتحضير)
   * لتكون قريبة من تجربة الواجهة (نظافة، تعليم، اختبارات قدرات/تحصيلي).
   */
  const subjects = [
    {
      slug: 'algebra',
      nameAr: 'الجبر',
      nameEn: 'algebra',
      sortOrder: 1,
      description:
        'معادلات، متباينات، ونمذجة مسائل لبناء أساس قوي في الجبر يناسب التدريب على الاختبارات المحوسبة والقدرات.',
      descriptionEn:
        'Equations, inequalities, and word problems to build a solid algebra foundation for computer-based tests and Qudurat-style assessments.',
      imageUrl:
        'https://images.unsplash.com/photo-1596495578065-6e0769fa3fb0?w=1200&q=80&auto=format&fit=crop',
    },
    {
      slug: 'engineering',
      nameAr: 'الهندسة',
      nameEn: 'engineering',
      sortOrder: 2,
      description:
        'زوايا، أشكال، مساحات، ومسائل هندسية لتعزيز الفهم البصري والقياسي كما في أسئلة الهندسة في الاختبارات الموحدة.',
      descriptionEn:
        'Angles, shapes, area, and geometry problems to strengthen visual and measurement reasoning as in national standardized tests.',
      imageUrl:
        'https://images.unsplash.com/photo-1518133835870-267024d5029c?w=1200&q=80&auto=format&fit=crop',
    },
    {
      slug: 'statistics',
      nameAr: 'الإحصاء',
      nameEn: 'statistics',
      sortOrder: 3,
      description:
        'قراءة الجداول والرسوم، الوسط والوسيط، الاحتمالات البسيطة، وتمثيل البيانات لدعم جزء الإحصاء في القدرات والتحصيلي.',
      descriptionEn:
        'Reading tables and charts, mean and median, basic probability, and data representation for statistics sections in Qudurat and achievement tests.',
      imageUrl:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop',
    },
    {
      slug: 'calculus',
      nameAr: 'التفاضل والتكامل',
      nameEn: 'calculus',
      sortOrder: 4,
      description:
        'مقدمة منظمة للنهايات والمشتقات والتكامل التمهيدي مع تمارين تربط بين التغير والمنحنيات كما في مستويات التحضير المتقدم.',
      descriptionEn:
        'A structured introduction to limits, derivatives, and introductory integral calculus, linking rates of change and curves for advanced prep levels.',
      imageUrl:
        'https://images.unsplash.com/photo-1629828878326-f6fbfbf6ffe7?w=1200&q=80&auto=format&fit=crop',
    },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        sortOrder: s.sortOrder,
        description: s.description,
        descriptionEn: s.descriptionEn,
        imageUrl: s.imageUrl,
      },
      create: { ...s, isActive: true },
    });
  }

  const allSubjects = await prisma.subject.findMany();

  await prisma.subscriptionPlan.upsert({
    where: { slug: 'monthly' },
    update: {},
    create: {
      slug: 'monthly',
      name: 'الباقة الشهرية',
      priceCents: 70000,
      currency: 'USD',
      interval: 'month',
      sortOrder: 1,
    },
  });
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'yearly' },
    update: {},
    create: {
      slug: 'yearly',
      name: 'الباقة السنوية',
      priceCents: 140000,
      currency: 'USD',
      interval: 'year',
      sortOrder: 2,
    },
  });

  await prisma.examTemplate.upsert({
    where: { code: 'TRIAL_24' },
    update: {},
    create: {
      code: 'TRIAL_24',
      name: 'اختبار تجريبي شامل',
      attemptType: AttemptType.EXAM_TRIAL,
      questionCount: 24,
      totalDurationSec: 45 * 60,
      perQuestionSec: null,
      allowResume: true,
    },
  });
  await prisma.examTemplate.upsert({
    where: { code: 'TOPIC_24' },
    update: {},
    create: {
      code: 'TOPIC_24',
      name: 'اختبار موضوع',
      attemptType: AttemptType.EXAM_TOPIC,
      questionCount: 24,
      totalDurationSec: null,
      perQuestionSec: 90,
      allowResume: true,
    },
  });
  await prisma.examTemplate.upsert({
    where: { code: 'PRACTICE' },
    update: {
      name: 'جلسة تدريب',
      attemptType: AttemptType.PRACTICE,
      questionCount: 20,
      totalDurationSec: 7 * 24 * 3600,
      perQuestionSec: null,
      allowResume: true,
      isActive: true,
    },
    create: {
      code: 'PRACTICE',
      name: 'جلسة تدريب',
      attemptType: AttemptType.PRACTICE,
      questionCount: 20,
      totalDurationSec: 7 * 24 * 3600,
      perQuestionSec: null,
      allowResume: true,
    },
  });

  await prisma.siteAbout.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      badgeAr: '+20 سنة من الخبرة',
      badgeEn: '+20 years of experience',
      titleAr: 'الفهيم',
      titleEn: 'Al Faheem',
      bodyAr:
        'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات دولار بوت كويرات توب اليكويب ايتم باسمود فيليتيات. كويرات تيكنيديونت ليتسيوت انتويديكتوم نويساراد دونك كويرات ايت اميت، واليميكو ايتروديكتوم جيوامي ميو ايبسوم الكروبيتيشين كومودو بورت نيسي كونسيكوات.',
      bodyEn:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      imageUrl:
        'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop',
    },
  });

  await prisma.siteHomeVideo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titleAr: 'كيف تعمل منصتنا للطلاب؟',
      titleEn: 'How does our platform work for students?',
      bodyAr:
        'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات دولار بوت كويرات توب اليكويب ايتم باسمود فيليتيات. كويرات تيكنيديونت ليتسيوت انتويديكتوم نويساراد دونك كويرات ايت اميت.',
      bodyEn:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      thumbUrl:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
      videoUrl: null,
    },
  });

  await prisma.siteHero.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titleAr: 'تعلم في أي وقت و من أي مكان !',
      titleEn: 'Learn anytime, anywhere!',
      subtitleAr:
        'استمتع بالوصول إلى مئات الدورات التدريبية عالية الجودة التي يقدمها مدربون محترفون، صممت لمساعدتك على إتقان مهارات جديدة وتحقيق معرفتك، وتفتح المزيد من الفرص لتطوير وتحقيق أهدافك الشخصية.',
      subtitleEn:
        'Access hundreds of high-quality training courses led by professional instructors, designed to help you master new skills, grow your knowledge, and open more opportunities to reach your personal goals.',
      howItWorksAr: 'كيف تعمل ؟',
      howItWorksEn: 'How it works?',
      startNowAr: 'ابدأ الآن',
      startNowEn: 'Get started',
      laptopAltAr: 'الفهيم منصة التعلم',
      laptopAltEn: 'Al Faheem learning platform',
    },
  });

  await prisma.siteHomeStats.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      stat1Value: '+1000',
      stat1LabelAr: 'سؤال',
      stat1LabelEn: 'Questions',
      stat2Value: '100%',
      stat2LabelAr: 'محاكي للإمتحان الكمية',
      stat2LabelEn: 'Quant exam simulator',
      stat3Value: '4',
      stat3LabelAr: 'مواضيع',
      stat3LabelEn: 'Topics',
      titleAr: 'اختبر نفسك و حدد مستواك',
      titleEn: 'Test yourself and find your level',
      bodyAr:
        'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات دولار بوت كويرات توب اليكويب ايتم باسمود فيليتيات. كويرات تيكنيديونت ليتسيوت انتويديكتوم نويساراد دونك كويرات ايت اميت.',
      bodyEn:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
      ctaAr: 'ابدأ الاختبار الآن',
      ctaEn: 'Start the test now',
      imageUrl:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop',
      imageAltAr: 'تحديد المستوى',
      imageAltEn: 'Level assessment',
    },
  });

  await prisma.siteWhyUs.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titleAr: 'ما الذي يميزنا؟',
      titleEn: 'What makes us different?',
      item1Ar: 'اختبارات تجريبية غير محدودة',
      item1En: 'Unlimited practice tests',
      item2Ar: 'تجربة مجانية لمدة 7 أيام',
      item2En: '7-day free trial',
      item3Ar: 'تقارير تفصيلية للأداء',
      item3En: 'Detailed performance reports',
      item4Ar: 'الوصول الكامل لجميع الأسئلة',
      item4En: 'Full access to all questions',
    },
  });

  await prisma.siteContactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      introAr:
        'لوريم إيبسوم دولار سيت أميت كونسيكتور. فيليس فيغيات فيليت إد أكتور. ساجيتيس دونيك كوروسوس.',
      introEn:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus feugiat velit id auctor. Sagittis donic cursus.',
      phone: '518468',
      email: 'Trafikklar.co@gmail.com',
      facebookUrl: null,
      instagramUrl: null,
      whatsappUrl: null,
      youtubeUrl: null,
    },
  });

  await prisma.faqSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      introAr:
        'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات.',
      introEn:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      titleHighlightAr: 'الأسئلة',
      titleRestAr: ' الأكثر شيوعا',
      titleHighlightEn: 'Questions',
      titleRestEn: ' most asked',
    },
  });

  const faqItemCount = await prisma.faqItem.count();
  if (faqItemCount === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          scope: 'GENERAL',
          questionAr: 'كيف أبدأ استخدام المنصة؟',
          questionEn: 'How do I get started with the platform?',
          answerAr:
            'أنشئ حساباً من صفحة التسجيل، ثم اختر المادة والمستوى. يمكنك البدء بجلسة تدريب أو بالاختبار التجريبي من لوحة التحكم.',
          answerEn:
            'Sign up, then pick a subject and level. Start with practice mode or the trial test from your dashboard.',
          sortOrder: 0,
          isActive: true,
        },
        {
          scope: 'GENERAL',
          questionAr: 'هل هناك فترة تجريبية مجانية؟',
          questionEn: 'Is there a free trial?',
          answerAr:
            'نعم، يُفعّل الحساب الجديد عادةً بتجربة لمدة محددة يمكنك من خلالها استكشاف المحتوى. تفاصيل المدة تظهر في صفحة الاشتراكات وحسابك.',
          answerEn:
            'New accounts typically include a limited-time trial so you can explore content. See the subscriptions page and your profile for the exact period.',
          sortOrder: 1,
          isActive: true,
        },
        {
          scope: 'GENERAL',
          questionAr: 'ما الفرق بين التدريب والاختبار؟',
          questionEn: 'What is the difference between practice and an exam?',
          answerAr:
            'التدريب يركّز على حل الأسئلة بوتيرة مريحة مع مراجعة التوجيهات. الاختبار يحاكي ظروفاً زمنية وأسلوباً أقرب للاختبار الفعلي.',
          answerEn:
            'Practice lets you solve questions at your own pace with guidance. Exams simulate timing and conditions closer to a real test.',
          sortOrder: 2,
          isActive: true,
        },
        {
          scope: 'GENERAL',
          questionAr: 'ما طرق الدفع المتاحة؟',
          questionEn: 'Which payment methods are available?',
          answerAr:
            'تتوفر خيارات الدفع المعتمدة في صفحة الاشتراك والدفع ضمن المنصة، وفق الباقة والبلد. بعد إتمام الدفع تُحدَّث صلاحياتك تلقائياً.',
          answerEn:
            'Supported options are shown on the checkout/subscription page depending on plan and region. Access updates automatically after payment.',
          sortOrder: 3,
          isActive: true,
        },
        {
          scope: 'GENERAL',
          questionAr: 'هل المحتوى متاح بالعربية والإنجليزية؟',
          questionEn: 'Is content available in Arabic and English?',
          answerAr:
            'تُعرض واجهة المنصة بلغتك، وتتوفّر للعديد من المواد نصوص أو خيارات إضافية بالإنجليزية حيث يدعمها المحتوى.',
          answerEn:
            'The app follows your language settings, and many items include optional English text where the content supports it.',
          sortOrder: 4,
          isActive: true,
        },
        {
          scope: 'GENERAL',
          questionAr: 'كيف أتواصل مع الدعم الفني؟',
          questionEn: 'How can I contact support?',
          answerAr:
            'استخدم نموذج «تواصل معنا» في الموقع، أو بيانات التواصل المعروضة في صفحة الاتصال. سنرد في أقرب وقت ممكن.',
          answerEn:
            'Use the Contact form on the site or the details on the contact page. We will get back to you as soon as possible.',
          sortOrder: 5,
          isActive: true,
        },
      ],
    });
  }

  const paymentFaqCount = await prisma.faqItem.count({ where: { scope: 'PAYMENT' } });
  if (paymentFaqCount === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          scope: 'PAYMENT',
          questionAr: 'هل يمكنني إلغاء الاشتراك؟',
          questionEn: 'Can I cancel my subscription?',
          answerAr: 'نعم، يمكنك إلغاء الاشتراك في أي وقت من إعدادات الحساب.',
          answerEn: 'Yes, you can cancel anytime from your account settings.',
          sortOrder: 0,
          isActive: true,
        },
        {
          scope: 'PAYMENT',
          questionAr: 'ما هي طرق الدفع المتاحة؟',
          questionEn: 'What payment methods do you accept?',
          answerAr: 'نقبل بطاقات الائتمان والخصم المعتمدة (مثل VISA وMasterCard وMada) حيث يدعمها مزوّد الدفع.',
          answerEn: 'We accept major credit and debit cards (e.g. VISA, MasterCard, Mada) where supported by the payment provider.',
          sortOrder: 1,
          isActive: true,
        },
        {
          scope: 'PAYMENT',
          questionAr: 'هل يوجد ضمان لاسترداد المال؟',
          questionEn: 'Is there a money-back guarantee?',
          answerAr: 'نعم، نوفر ضمان استرداد المال خلال 14 يوماً من الاشتراك وفق الشروط المعروضة.',
          answerEn: 'Yes, we offer a refund within 14 days of purchase, subject to the terms shown at checkout.',
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
  }

  await prisma.testimonialsSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      titleAr: 'يقول طلابنا..',
      titleEn: 'What our students say',
      subtitleAr:
        'استمتع بمباشرة عن طلابنا الذين نجحوا مع التزامهم ومشاركتهم القوية من خلال منصة الدورات التدريبية عبر الإنترنت.',
      subtitleEn:
        'Hear from students who succeeded with commitment and strong engagement through our online training platform.',
    },
  });

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          nameAr: 'رانيا عبدالله',
          nameEn: 'Rania Abdullah',
          roleAr: 'المرحلة الثانوية',
          roleEn: 'High school',
          textAr:
            'تدريبات المنصة نظمت لي الوقت: الجبر والهندسة صار لها روتين يومي، والاختبار التجريبي عرّفني على ضغط الوقت قبل الاختبار الحقيقي.',
          textEn:
            'The platform helped me build a daily routine for algebra and geometry. The trial exam taught me how to handle time pressure before the real test.',
          sortOrder: 0,
          isActive: true,
        },
        {
          nameAr: 'أحمد محمد',
          nameEn: 'Ahmed Mohammed',
          roleAr: 'المرحلة الثانوية',
          roleEn: 'High school',
          textAr:
            'شرح الأسئلة بعد الحل كان مفيداً جداً؛ أفهم خطأي مباشرة بدل أتخمّن. الواجهة بالعربي راحتني في المذاكرة.',
          textEn:
            'Explanations after each attempt made mistakes clear right away. The Arabic UI made studying much more comfortable.',
          sortOrder: 1,
          isActive: true,
        },
        {
          nameAr: 'سارة أحمد',
          nameEn: 'Sara Ahmed',
          roleAr: 'المرحلة الثانوية',
          roleEn: 'High school',
          textAr:
            'قسم الإحصاء كان نقطة ضعفي؛ تمارين المستويات المختلفة خلّتني أتقدّم خطوة خطوة بدون إرهاق.',
          textEn:
            'Statistics was my weak spot. Levelled practice let me improve step by step without feeling overwhelmed.',
          sortOrder: 2,
          isActive: true,
        },
        {
          nameAr: 'محمود خالد',
          nameEn: 'Mahmoud Khaled',
          roleAr: 'المرحلة الثانوية',
          roleEn: 'High school',
          textAr:
            'جلسات التدريب الطويلة بدون قطع الاشتراك ساعدتني أراجع قبل الاختبار النهائي براحة، خصوصاً في التفاضل.',
          textEn:
            'Long practice sessions and steady access helped me review calculus calmly before finals.',
          sortOrder: 3,
          isActive: true,
        },
        {
          nameAr: 'نور الهدى',
          nameEn: 'Nour Al Huda',
          roleAr: 'المرحلة الثانوية',
          roleEn: 'High school',
          textAr:
            'أقدر تنوّع الأسئلة بين المواد؛ ما أحسّ أني أكرّر نفس النمط. التتبّع بعد كل جلسة يشعرني بالتقدم.',
          textEn:
            'I like the variety across subjects—questions don’t feel repetitive. Progress after each session feels real.',
          sortOrder: 4,
          isActive: true,
        },
        {
          nameAr: 'يوسف العتيبي',
          nameEn: 'Yousef Al-Otaibi',
          roleAr: 'التحضير للقدرات',
          roleEn: 'Qudurat prep',
          textAr:
            'جمعت بين الاختبار التجريبي والتدريب السريع؛ أوضحت لي المنصة أين أضعف قبل أسبوع من الموعد.',
          textEn:
            'I mixed trial exams with quick practice runs—the platform showed me weak areas a week before test day.',
          sortOrder: 5,
          isActive: true,
        },
      ],
    });
  }

  const qCount = await prisma.question.count();
  if (qCount > 0) {
    console.log('Seed OK (questions already present). Admin: admin@al-faheem.local / Admin123456');
    return;
  }

  let n = 0;
  for (const sub of allSubjects) {
    for (let d = 1; d <= 4; d++) {
      for (let i = 0; i < 8; i++) {
        n += 1;
        const stem = `سؤال تجريبي #${n} — ${sub.nameAr} — مستوى ${d}`;
        await prisma.question.create({
          data: {
            subjectId: sub.id,
            difficulty: d,
            stem,
            stemEn: `Sample question #${n} — ${sub.nameEn || sub.slug} — level ${d}`,
            ...optionBlock(`Q${n}`),
            optionAEn: `Choice A for Q${n}`,
            optionBEn: `Choice B for Q${n}`,
            optionCEn: `Choice C for Q${n}`,
            optionDEn: `Choice D for Q${n}`,
            correctIndex: i % 4,
            isPublished: true,
            includeInExam: true,
            explanation: `شرح مختصر للسؤال ${n}.`,
            explanationEn: `Short explanation for question ${n}.`,
          },
        });
      }
    }
  }

  console.log('Seed OK. Admin: admin@al-faheem.local / Admin123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
