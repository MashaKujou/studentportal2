export interface ProgramInfo {
  id: string;
  name: string;
  category: 'SHS' | 'College' | 'Tesda';
  badge: string;
  desc: string;
  duration: string;
  coverImg: string;
  modalImg?: string;
  fullDesc: string;
  requirements?: string[];
}

export const programsInfo: ProgramInfo[] = [
  {
    id: 'abm',
    name: 'ABM',
    category: 'SHS',
    badge: 'Senior High School Track (Academic Strand)',
    desc: 'Accountancy, Business and Management',
    duration: '2-Year Program',
    coverImg: '/course_pics/abm.png',
    fullDesc: 'The ABM strand is designed for students who intend to take up business courses in college. Focuses on financial management, business management, corporate operations, and accounting.'
  },
  {
    id: 'gas',
    name: 'GAS',
    category: 'SHS',
    badge: 'Senior High School Track (Academic Strand)',
    desc: 'General Academic Strand',
    duration: '2-Year Program',
    coverImg: '/course_pics/gas.png',
    fullDesc: 'GAS offers a mix of subjects from other academic strands, providing a well-rounded foundation for various college degrees.'
  },
  {
    id: 'humss',
    name: 'HUMSS',
    category: 'SHS',
    badge: 'Senior High School Track (Academic Strand)',
    desc: 'Humanities and Social Sciences',
    duration: '2-Year Program',
    coverImg: '/course_pics/humss.png',
    fullDesc: 'HUMSS is for students looking into degrees in journalism, communication arts, liberal arts, education, and other social science-related courses.'
  },
  {
    id: 'he',
    name: 'HE',
    category: 'SHS',
    badge: 'Senior High School Track (Tech-Voc Strand)',
    desc: 'Home Economics',
    duration: '2-Year Program',
    coverImg: '/course_pics/he.png',
    fullDesc: 'Provides skills in hospitality, tourism, and culinary arts, preparing students for National Certificate (NC) assessments.'
  },
  {
    id: 'ict',
    name: 'ICT',
    category: 'SHS',
    badge: 'Senior High School Track (Tech-Voc Strand)',
    desc: 'Information and Communications Technology',
    duration: '2-Year Program',
    coverImg: '/course_pics/ict.png',
    fullDesc: 'Equips students with skills in computer programming, animation, and web design.'
  },
  {
    id: 'bsma',
    name: 'BS Management Accounting',
    category: 'College',
    badge: 'Bachelor of Science',
    desc: 'Management Accounting',
    duration: '4-Year Program',
    coverImg: '/course_pics/bsma.png',
    modalImg: '/course_pics/collegeModal/bsma.png',
    fullDesc: 'Provides solid business management skills coupled with an understanding of financial operations and strategic decision-making.'
  },
  {
    id: 'btvted',
    name: 'Technical-Vocational Teacher Education',
    category: 'College',
    badge: 'Bachelor of Science',
    desc: 'Technical-Vocational Teacher Education',
    duration: '4-Year Program',
    coverImg: '/course_pics/btvted.png',
    modalImg: '/course_pics/collegeModal/btvted.png',
    fullDesc: 'Provides solid business management skills coupled with an understanding of financial operations and strategic decision-making.'
  },
  {
    id: 'entrep',
    name: 'Entrepreneurship',
    category: 'College',
    badge: 'Bachelor of Science',
    desc: 'Entrepreneurship',
    duration: '4-Year Program',
    coverImg: '/course_pics/bse.png',
    modalImg: '/course_pics/collegeModal/bse.png',
    fullDesc: 'Develops skills in starting, managing, and scaling businesses, fostering a strong entrepreneurial mindset.'
  },
  {
    id: 'it-diploma',
    name: 'Information Technology',
    category: 'College',
    badge: 'Diploma',
    desc: 'IT Diploma Program',
    duration: '3-Year Program',
    coverImg: '/course_pics/dit.png',
    modalImg: '/course_pics/collegeModal/dit.png',
    fullDesc: 'Focuses on practical IT skills including networking, software development, and systems administration.'
  },
  {
    id: 'dhrt',
    name: 'Hotel and Restaurant Technology',
    category: 'College',
    badge: 'Diploma',
    desc: 'Diploma in Hotel and Restaurant Technology',
    duration: '3-Year Program',
    coverImg: '/course_pics/dhrt.png',
    modalImg: '/course_pics/collegeModal/dhrt.png',
    fullDesc: 'Prepares students for the hospitality industry with intensive training in food and beverage service, housekeeping, and front office operations.'
  }
];

export const tesdaprogramsInfo: ProgramInfo[] = [
  {
    id: 'crp-ncii',
    name: 'Collaborative Robot Programming NCII',
    category: 'Tesda',
    badge: 'National Certificate II',
    desc: 'Collaborative Robot Programming',
    duration: 'Short Course',
    coverImg: '/course_pics/tesda_CoBot.png',
    fullDesc: "This program equips individuals with the necessary skills to plan, coordinate, and execute events such as conferences, corporate events, and exhibitions.",
    requirements: [
      'At lease SHS Graduate',
      '2 Copies - Form 138/Diploma (for High School graduate of CSA)',
      '2 Copies - TOR/Diploma (for College Students)',
      '2 Copies - Birth Certificate (PSA Authenticated)',
      '2 Copies - Marriage Certificate (for Married applicants)',
      '2 Copies - Valid ID',
      '3 Photo Copies of Valid ID w/ 3 specimen signature',
      '2 pcs - 2x2 ID Picture (White Background, formal attire, w/ nametag FN MI LN)',
      '3 pcs - 1x1 ID Picture (White Background, formal attire.',
      '1 pc  - Long brown envelope'
    ]
  },
  {
    id: 'ems-nciii',
    name: 'Events Management Services NCIII',
    category: 'Tesda',
    badge: 'National Certificate III',
    desc: 'Events Management',
    duration: 'Short Course',
    coverImg: '/course_pics/tesda_eventmanagement.png',
    fullDesc: 'This program equips individuals with the necessary skills to plan, coordinate, and execute events such as conferences, corporate events, and exhibitions.',
    requirements: [
      'At lease SHS Graduate',
      '2 Copies - Form 138/Diploma (for High School graduate of CSA)',
      '2 Copies - TOR/Diploma (for College Students)',
      '2 Copies - Birth Certificate (PSA Authenticated)',
      '2 Copies - Marriage Certificate (for Married applicants)',
      '2 Copies - Valid ID',
      '3 Photo Copies of Valid ID w/ 3 specimen signature',
      '2 pcs - 2x2 ID Picture (White Background, formal attire, w/ nametag FN MI LN)',
      '3 pcs - 1x1 ID Picture (White Background, formal attire.',
      '1 pc  - Long brown envelope'
    ]
  },
  {
    id: 'bpp-ncii',
    name: 'Bread & Pastry Production NCII',
    category: 'Tesda',
    badge: 'National Certificate III',
    desc: 'Bread & Pastry Production',
    duration: 'Short Course',
    coverImg: '/course_pics/tesda_bpp.png',
    fullDesc: 'This program equips individuals with the necessary skills to plan, coordinate, and execute events such as conferences, corporate events, and exhibitions.',
    requirements: [
      'At lease SHS Graduate',
      '2 Copies - Form 138/Diploma (for High School graduate of CSA)',
      '2 Copies - TOR/Diploma (for College Students)',
      '2 Copies - Birth Certificate (PSA Authenticated)',
      '2 Copies - Marriage Certificate (for Married applicants)',
      '2 Copies - Valid ID',
      '3 Photo Copies of Valid ID w/ 3 specimen signature',
      '2 pcs - 2x2 ID Picture (White Background, formal attire, w/ nametag FN MI LN)',
      '3 pcs - 1x1 ID Picture (White Background, formal attire.',
      '1 pc  - Long brown envelope'
    ]
  },
  {
    id: '',
    name: 'Computer System Servicing NCII',
    category: 'Tesda',
    badge: 'National Certificate II',
    desc: 'Computer System Servicing',
    duration: 'Short Course',
    coverImg: '/course_pics/tesda_CSS.png',
    fullDesc: 'This program equips individuals with the necessary skills to plan, coordinate, and execute events such as conferences, corporate events, and exhibitions.',
    requirements: [
      'At lease SHS Graduate',
      '2 Copies - Form 138/Diploma (for High School graduate of CSA)',
      '2 Copies - TOR/Diploma (for College Students)',
      '2 Copies - Birth Certificate (PSA Authenticated)',
      '2 Copies - Marriage Certificate (for Married applicants)',
      '2 Copies - Valid ID',
      '3 Photo Copies of Valid ID w/ 3 specimen signature',
      '2 pcs - 2x2 ID Picture (White Background, formal attire, w/ nametag FN MI LN)',
      '3 pcs - 1x1 ID Picture (White Background, formal attire.',
      '1 pc  - Long brown envelope'
    ]
  },

];
