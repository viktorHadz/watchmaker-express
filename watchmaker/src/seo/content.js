import { siteProfile } from './siteProfile.js'

export const servicePageKeys = [
  'watchRepairLondon',
  'vintageWatchRepairLondon',
  'watchRestorationLondon',
  'mechanicalWatchServiceLondon',
  'pocketWatchRepairLondon',
  'watchRepairByPost',
]

export const homePageContent = {
  path: '/',
  eyebrow: 'Traditional Watch Workshop',
  title: 'Vintage & Mechanical Watch Repair',
  metaTitle: 'Vintage & Mechanical Watch Repair London | The Watchmaker',
  metaDescription: 'Independent watchmaker in London specialising in vintage and mechanical repair, restoration, and servicing for clients across the UK.',
  intro: 'Servicing, repair, and restoration for vintage and mechanical timepieces, from a London workshop with UK-wide enquiries welcome.',
  highlights: siteProfile.trustHighlights,
  sections: [
    {
      heading: 'Care you can trust',
      body: 'Diagnosis, servicing, repair, and restoration carried out with precision and respect for the watch.',
    },
    {
      heading: 'London workshop, UK clients',
      body: 'In-person appointments in London. Secure postal work available for clients elsewhere in the UK following enquiry.',
    },
    {
      heading: 'See the work first',
      body: 'Browse recent repairs and restorations, including before-and-after examples from the workshop.',
    },
  ],
  quickLinks: servicePageKeys,
}

export const repairsPageContent = {
  path: '/repairs',
  eyebrow: 'Estimates & Enquiries',
  title: 'Watch Repair Enquiries, Estimates, And Postal Repairs',
  metaTitle: 'Watch Repair London Estimates & Contact | The Watchmaker',
  metaDescription:
    'Request a watch repair estimate for vintage, mechanical, restoration, and postal repair work. London workshop enquiries with UK-wide postal service available.',
  intro:
    'Send clear photos, describe the fault, and include any known service history to start the estimate process for London enquiries or postal repairs from elsewhere in the UK.',
  sections: [
    {
      heading: 'What to include in your enquiry',
      body: 'Include the brand, movement type if known, what the watch is doing wrong, when it last ran well, and any previous repair history. Clear photos of the dial, case, movement, and damage help speed up the initial assessment.',
    },
    {
      heading: 'How the repair process works',
      body: 'Every job begins with an initial review and estimate. If the watch needs bench inspection before a final scope is confirmed, that is discussed before work proceeds, followed by approval, service work, and final checks.',
    },
    {
      heading: 'Urgent enquiries and UK-wide postage',
      body: 'If you are in London and need urgent help, get in touch first so the problem can be reviewed before any in-person arrangement is made. Clients elsewhere in the UK can use the postal service once the enquiry has been reviewed and the next steps confirmed.',
    },
  ],
  faqs: [
    {
      question: 'Do you offer free watch repair estimates?',
      answer:
        'Yes. Initial estimates are provided before any approved work begins, although complex pieces may need bench inspection before a final quote is confirmed.',
    },
    {
      question: 'Can I send my watch by post from outside London?',
      answer: 'Yes. Postal repairs can be arranged for clients outside London. Packing guidance, intake details, and next steps are outlined once the enquiry has been reviewed.',
    },
    {
      question: 'Do you only work on vintage and mechanical watches?',
      answer: 'No. While the focus is on vintage and mechanical work, other watches can still be assessed depending on the job.',
    },
    {
      question: 'Do you provide a warranty?',
      answer: siteProfile.warranty,
    },
  ],
  quickLinks: servicePageKeys,
}

export const galleryPageContent = {
  path: '/my-work',
  eyebrow: 'Workshop Gallery',
  title: 'Workshop Gallery & Repair Stories',
  metaTitle: 'Watch Repair Stories | The Watchmaker',
  metaDescription: 'Browse recent repair stories, restoration work, and before-and-after examples from an independent London watchmaker.',
  intro: 'Browse recent repair stories, before-and-after examples, and vintage or mechanical work completed for clients in London, across the UK and beyond.',
}

export const servicePages = {
  watchRepairLondon: {
    key: 'watchRepairLondon',
    path: '/watch-repair-london',
    title: 'Watch Repair London',
    metaTitle: 'Watch Repair London | Independent Mechanical Watchmaker',
    metaDescription: 'Independent watch repair in London for mechanical, vintage, and restoration work, with free estimates and UK-wide postal enquiries.',
    hero: 'Watch repair for mechanical, vintage, and restoration work, with practical advice before any service begins.',
    sections: [
      {
        heading: 'Specialist repair work',
        body: 'Each watch is properly assessed before any work begins. Servicing, repair, and restoration are planned based on the condition of the watch, not assumptions.',
      },
      {
        heading: 'When specialist repair matters',
        body: 'Specialist repair is important where originality, long-term reliability, or discontinued parts are involved. Each watch is assessed first, with clear advice on the most sensible approach.',
      },
      {
        heading: 'What happens after you enquire',
        body: 'After you get in touch, the watch and issue are reviewed and you receive a response with the next steps. This may include an estimate, further inspection, or advice before any work begins.',
      },
    ],
    faqs: [
      {
        question: 'What types of watches do you repair?',
        answer: 'The focus is on vintage and mechanical work, including manual-wind, automatic, and older pocket or wristwatches, but other watches can still be assessed depending on the job.',
      },
      {
        question: 'Can I get a quote before sending the watch in?',
        answer: siteProfile.estimates,
      },
      {
        question: 'Do you only work with London clients?',
        answer:
          'No. London and the UK are the main focus. But work has also been carried out for clients outside the UK. All interesting enquiries are welcome.',
      },
    ],
  },
  vintageWatchRepairLondon: {
    key: 'vintageWatchRepairLondon',
    path: '/vintage-watch-repair-london',
    title: 'Vintage Watch Repair London',
    metaTitle: 'Vintage Watch Repair London | Mechanical Restoration Specialist',
    metaDescription: 'Vintage watch repair in London, including restoration, servicing, and proper diagnosis for mechanical timepieces.',
    hero: 'Vintage watch repair in London for inherited watches, collectors’ pieces, and older mechanical timepieces that need careful handling.',
    sections: [
      {
        heading: 'Repairing vintage watches without losing character',
        body: 'Vintage work needs a different approach from modern service-centre repairs. Where possible, originality, patina, and period-correct character are preserved and the tradeoffs are explained before work begins.',
      },
      {
        heading: 'Common vintage issues',
        body: 'Dried lubrication, worn pivots, weak mainsprings, moisture ingress, dial damage, and earlier poor repairs are all common issues in vintage assessments.',
      },
      {
        heading: 'A better fit for older watches',
        body: 'This service suits owners who want careful, considered work on older watches rather than a quick retail repair counter approach.',
      },
    ],
    faqs: [
      {
        question: 'Do you repair inherited or sentimental watches?',
        answer:
          'Yes. Older watches with sentimental value are a core part of the work.'
      },
      {
        question: 'Can original parts and patina be preserved?',
        answer:
          'Where possible, yes. The aim is to discuss preservation, replacement, and visible refinishing before work begins.',
      },
      {
        question: 'Are vintage estimates final straight away?',
        answer:
          'Not always. Some vintage pieces need closer inspection before the final scope and parts requirements are clear.',
      },
    ],
  },
  watchRestorationLondon: {
    key: 'watchRestorationLondon',
    path: '/watch-restoration-london',
    title: 'Watch Restoration London',
    metaTitle: 'Watch Restoration London | Vintage & Mechanical Timepieces',
    metaDescription: 'Watch restoration in London for vintage and mechanical pieces, including repair, component assessment, and restoration planning.',
    hero: 'Watch restoration in London for timepieces that need more than routine servicing and require a considered approach.',
    sections: [
      {
        heading: 'Restoration starts with diagnosis',
        body: 'Restoration requires proper assessment. The movement, case, dial, hands, and overall condition are reviewed before the right level of work is agreed.',
      },
      {
        heading: 'Balancing originality and reliability',
        body: 'Some watches benefit from full restoration, while others are better suited to lighter intervention or stabilisation. The approach depends on the watch and the owner\’s priorities.'
      },
      {
        heading: 'See similar restoration work',
        body: 'The workshop gallery shows what restoration can involve, what can be improved, and how similar watches have responded to this kind of work.',
      },
    ],
    faqs: [
      {
        question: 'What is included in a restoration assessment?',
        answer:
          'Typically the movement condition, worn or missing parts, visible cosmetic issues, previous repairs, and the owner’s goals for the watch.',
      },
      {
        question: 'Do you restore cases, dials, and hands as well as movements?',
        answer: 'Yes, where appropriate. Restoration can include movement, dial, hand, and case work depending on the watch.',
      },
      {
        question: 'Is restoration suitable for every watch?',
        answer:
          'No. Some watches are better suited to stabilisation or careful servicing rather than a full cosmetic restoration.',
      },
    ],
  },
  mechanicalWatchServiceLondon: {
    key: 'mechanicalWatchServiceLondon',
    path: '/mechanical-watch-service-london',
    title: 'Mechanical Watch Service London',
    metaTitle: 'Mechanical Watch Service London | Independent Servicing',
    metaDescription: 'Mechanical watch servicing in London for manual and automatic watches, including diagnosis, overhaul, and preventative maintenance.',
    hero: 'Mechanical watch servicing in London for manual-wind and automatic watches that need proper inspection, cleaning, lubrication, and regulation.',
    sections: [
      {
        heading: 'Independent servicing for mechanical watches',
        body: 'Mechanical servicing reduces wear and keeps the movement running correctly. It suits owners who want reliable performance and preventative care before faults become more expensive.',
      },
      {
        heading: 'Signs a mechanical watch may need service',
        body: 'Common signs include poor timekeeping, reduced power reserve, intermittent running, moisture concerns, or an unknown service history.',
      },
      {
        heading: 'When servicing is the right answer',
        body: 'This service suits watches that are complete but no longer running correctly, especially where the goal is reliable performance rather than cosmetic restoration.',
      },
    ],
    faqs: [
      {
        question: 'How do I know if my mechanical watch needs a service?',
        answer:
          'Common signs include poor timekeeping, weak power reserve, intermittent stopping, or an unknown service history.',
      },
      {
        question: 'Do you service both automatic and manual-wind watches?',
        answer: 'Yes. Both automatic and manual-wind mechanical watches are suitable for enquiry.',
      },
      {
        question: 'Is a service the same as a restoration?',
        answer:
          'Not always. Servicing focuses on movement function and reliability, while restoration can also include broader cosmetic or historical considerations.',
      },
    ],
  },
  pocketWatchRepairLondon: {
    key: 'pocketWatchRepairLondon',
    path: '/pocket-watch-repair-london',
    title: 'Pocket Watch Repair London',
    metaTitle: 'Pocket Watch Repair London | Vintage Pocket Watch Specialist',
    metaDescription: 'Pocket watch repair in London for vintage and mechanical watches, including servicing, diagnosis, and restoration.',
    hero: 'Pocket watch repair in London for mechanical heirlooms, collectors’ pieces, and older watches that require careful handling.',
    sections: [
      {
        heading: 'Pocket watches need specialist handling',
        body: 'Pocket watches often carry age, rarity, and sentimental value. They require a more careful assessment than a typical modern wristwatch.',
      },
      {
        heading: 'Heirlooms, antiques, and workshop assessment',
        body: 'Older pocket watches may have handmade, worn, or obsolete parts, so proper inspection and planning are essential before the scope of work is agreed.',
      },
      {
        heading: 'Recent workshop examples help here',
        body: 'The workshop gallery shows what is realistic with antique and vintage pocket watches, including what can be improved and how similar pieces have responded to repair or restoration.',
      },
    ],
    faqs: [
      {
        question: 'Do you repair antique pocket watches?',
        answer: 'Yes. Antique and vintage pocket watch enquiries are suitable, although some pieces require closer inspection before the final scope is confirmed.',
      },
      {
        question: 'Can you advise on whether a pocket watch is worth restoring?',
        answer:
          'Yes. Part of the estimate process is helping the owner understand the likely scope and whether restoration is the right path.',
      },
      {
        question: 'Do you work on non-running pocket watches?',
        answer: 'Yes. Non-running watches are common and can be assessed as part of the repair or restoration process.',
      },
    ],
  },
  watchRepairByPost: {
    key: 'watchRepairByPost',
    path: '/watch-repair-by-post',
    title: 'Watch Repair By Post UK',
    metaTitle: 'Watch Repair By Post UK | Postal Watch Servicing & Restoration',
    metaDescription: 'Watch repair by post for UK clients outside London, including mechanical and vintage servicing, repair, and restoration.',
    hero: 'UK-wide watch repair by post for clients outside London looking for specialist mechanical, vintage, and restoration work.',
    sections: [
      {
        heading: 'Postal repairs for clients across the UK',
        body: 'Clients outside London can use the workshop by starting with an enquiry, sending detailed photos, and confirming the watch, fault, and service history before anything is posted.',
      },
      {
        heading: 'Secure packing and communication',
        body: 'Postal repairs work best when the watch is only sent once agreed. Packing guidance, intake details, and next steps are confirmed so the watch travels safely and arrives as expected.',
      },
      {
        heading: 'Why use postal repair',
        body: 'Postal repair gives access to the right level of work without being limited by location, especially for watches that need careful assessment and handling.',
      },
    ],
    faqs: [
      {
        question: 'How should I send my watch by post?',
        answer:
          'Once agreed, send the watch using a tracked and insured service. Pack it securely in a small box with padding so it cannot move in transit, and avoid envelopes or loose packaging.',
      },
      {
        question: 'Should I post the watch before contacting you?',
        answer:
          'No. Start with an enquiry and photos first so the watch, fault, and next steps can be reviewed before anything is sent.',
      },
      {
        question: 'What happens once you receive the watch?',
        answer:
          'The watch is checked in, assessed, and you are contacted with the next steps. This may include confirmation of the estimate or further inspection before any work begins.',
      },
    ],
  },
}

export const footerServiceLinks = [
  'watchRepairLondon',
  'vintageWatchRepairLondon',
  'watchRestorationLondon',
  'watchRepairByPost',
]

export function getServicePage(key) {
  return servicePages[key] || null
}

export function getServicePageLinks(keys = servicePageKeys) {
  return keys
    .map((key) => servicePages[key])
    .filter(Boolean)
    .map((page) => ({
      label: page.title,
      path: page.path,
      description: page.hero,
    }))
}
