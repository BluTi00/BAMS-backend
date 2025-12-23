import { ASSESSMENT_TYPE } from '../generated/client/enums'

export interface IEvaluationGuidelineItem {
  id: string
  code?: string
  titleNp: string
  title: string
  type: 'sum' | 'sum-leaf' | 'choice'
  fullMark?: number // for 'sum' and 'choice' types
  items?: {
    id: string
    titleNp: string
    title: string
    type?: 'sum-leaf' | 'choice'
    fullMark?: number // for 'sum-leaf' and 'choice' types
    assessmentStage?: ASSESSMENT_TYPE // to enable editing marks only for specific assessment types
    isAutoEvaluated?: boolean // to indicate if the criteria is rule based
    options?: {
      id: string
      titleNp: string
      title: string
      mark: number
      keys?: string[]
    }[]
  }[]
}

export interface IScoreSheet {
  id: string
  obtainedMarks?: number
  selectedOptionId?: string
}

export const evaluationGuidelines: IEvaluationGuidelineItem[] = [
  // General Evaluation Guidelines
  // Section 1
  {
    id: 'sec-1',
    titleNp: 'उद्यम व्यवसायको हालको अवस्था',
    title: 'Current Status of the Enterprise Business',
    type: 'sum', // sum of child items' marks
    fullMark: 12, // 2 + 3 + max( production options ) => 6 + 1
    items: [
      {
        id: 'sec-1.1',
        titleNp: '१. स्टार्टअपको रुपमा दर्ता भएको',
        title: '1. Registered as a Startup',
        type: 'sum-leaf', // leaf that contributes its mark to parent sum
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },
      {
        id: 'sec-1.2',
        titleNp: '२. प्रोटोटाइपको तह',
        title: '2. Level of Prototype',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
      {
        id: 'sec-1.3',
        titleNp: '३. उत्पादनको तह',
        title: '3. Level of Production',
        type: 'choice', // choose exactly one option here
        fullMark: 6, // max of options (used for UI / validations)
        assessmentStage: ASSESSMENT_TYPE.INTERVIEW,
        options: [
          {
            id: 'sec-1.3.a',
            titleNp: 'न्युनतम सम्भाव्य वस्तु (मिनिमम भायवल प्रोडक्ट)',
            title: 'Minimum Viable Product',
            mark: 2,
          },
          {
            id: 'sec-1.3.b',
            titleNp: 'व्यवसायिक उत्पादन (कमर्सियल प्रोडक्ट)',
            title: 'Commercial Product',
            mark: 6,
          },
        ],
      },
      {
        id: 'sec-1.4',
        titleNp: '४. उद्यम सम्बर्द्धन केन्द्र (BIC) मा आवद्धता ',
        title: '4. Affiliation with Business Incubation Center (BIC)',
        type: 'sum-leaf',
        fullMark: 1,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },
    ],
  },

  // Section 2
  {
    id: 'sec-2',
    titleNp: 'उच्च वृद्धिको सम्भावना',
    title: 'Potential for High Growth',
    type: 'sum', // sum of child items' marks
    fullMark: 10,
    items: [
      {
        id: 'sec-2.1',
        titleNp:
          '१. उद्योगको अघिल्लो आर्थिक वर्षको कारोवारमा भएको वृद्धि वा नयाँ हकमा कारोवार वृद्धिको अनुगमन',
        title:
          '1. Growth in Turnover in the Previous Financial Year or Monitoring of Turnover Growth in New Equity',
        type: 'choice',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.INTERVIEW,
        options: [
          {
            id: 'sec-2.1.a',
            titleNp: '२५ प्रतिशत सम्म',
            title: 'Up to 25 percent',
            mark: 1,
          },
          {
            id: 'sec-2.1.b',
            titleNp: '५० प्रतिशत सम्म',
            title: 'Up to 50 percent',
            mark: 2,
          },
          {
            id: 'sec-2.1.c',
            titleNp: '१०० प्रतिशत सम्म',
            title: 'Up to 100 percent',
            mark: 3,
          },
          {
            id: 'sec-2.1.d',
            titleNp: '१०० प्रतिशत भन्दा माथि',
            title: 'More than 100 percent',
            mark: 4,
          },
        ],
      },
      {
        id: 'sec-2.2',
        titleNp:
          '२. आयात प्रतिस्थापन गर्न सक्ने वा गर्न सक्ने सम्भावना भएको (नेपालमा अधिकतम आयात भएको वस्तु वा उत्पादन गर्ने)',
        title:
          '2. Ability or Potential to Replace Imports (Producing the Most Imported Goods or Products in Nepal)',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.INTERVIEW,
      },
      {
        id: 'sec-2.3',
        titleNp: '३. परियोजनाबाट उत्पादित वस्तुको बिक्रीको बजार',
        title: '3. Market for Sale of Goods Produced by the Project',
        type: 'choice',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
        options: [
          {
            id: 'sec-2.3.a',
            titleNp: 'आन्तरिक बजार',
            title: 'Internal Market',
            mark: 2,
            keys: ['DOMESTIC_MARKET'],
          },
          {
            id: 'sec-2.3.b',
            titleNp: 'आन्तरिक तथा अन्तर्राष्ट्रिय बजार',
            title: 'Internal and International Market',
            mark: 3,
            keys: ['DOMESTIC_MARKET', 'INTERNATIONAL_MARKET'],
          },
        ],
      },
    ],
  },

  // Section 3
  {
    id: 'sec-3',
    titleNp: 'प्रविधिको अबलम्बन (Technology Adoption)',
    title: 'Technology Adoption',
    type: 'sum', // sum of child items' marks
    fullMark: 15,
    items: [
      {
        id: 'sec-3.1',
        titleNp: '१.	प्रविधि उपयोगको अवस्था',
        title: '1. State of Technology Utilization',
        type: 'choice',
        fullMark: 10,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
        options: [
          {
            id: 'sec-3.1.a',
            titleNp: 'विद्युतीय प्रणालीमा कारोवारको लेखा राखेको',
            title: 'Keeping Business Accounts in the Electronic System',
            mark: 3,
            keys: ['TO_KEEP_BUSINESS_ACCOUNTS'],
          },
          {
            id: 'sec-3.1.b',
            titleNp: 'उत्पादन वा प्रशोधनमा प्रविधिको अबलम्बन गरेको ',
            title: 'Adoption of Technology in Production or Processing',
            mark: 5,
            keys: ['IN_PRODUCTION_PROCESS'],
          },
          {
            id: 'sec-3.1.c',
            titleNp: 'उत्पादन, प्रशोधन र भण्डारणमा प्रविधिको अबलम्बन गरेको',
            title:
              'Adoption of Technology in Production, Processing, and Storage',
            mark: 7,
            keys: [],
          },
          {
            id: 'sec-3.1.d',
            titleNp:
              'कारोवारको लेखा, उत्पादन, प्रशोधन, भण्डारण, बजारीकरणको कार्यमा  प्रविधिको अबलम्बन गरेको',
            title:
              'Adoption of Technology in Business Accounts, Production, Processing, Storage, and Marketing',
            mark: 10,
            keys: ['FULL_ADOPTION'],
          },
        ],
      },
      {
        id: 'sec-3.2',
        titleNp:
          '२.	आफैले प्रविधिको विकास गरी प्रविधिको अबलम्बन वा हस्तान्तरण गरेको',
        title:
          '2. Ability or Potential to Replace Imports (Producing the Most Imported Goods or Products in Nepal)',
        type: 'sum-leaf',
        fullMark: 5,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },
    ],
  },

  // Section 4
  {
    id: 'sec-4',
    titleNp: 'परियोजनामा प्रयोग हुने कच्चापदार्थको स्रोत',
    title: 'Source of Raw Materials Used in the Project',
    type: 'choice',
    fullMark: 10,
    items: [
      {
        id: 'sec-4.1',
        title: '',
        titleNp: '',
        type: 'choice',
        options: [
          {
            id: 'sec-4.1.a',
            titleNp: 'विदेशी कच्चा पदार्थ प्रयोग गरेमा',
            title: 'If Foreign Raw Materials are Used',
            mark: 2,
            keys: ['FULLY_FOREIGN'],
          },
          {
            id: 'sec-4.1.b',
            titleNp:
              'स्वदेशी र विदेशी कच्चा पदार्थको उपयोग गरी वस्तु उत्पादन गरेमा',
            title:
              'If Goods are Produced Using Domestic and Foreign Raw Materials',
            mark: 6,
            keys: ['MOSTLY_DOMESTIC', 'MOSTLY_FOREIGN'],
          },
          {
            id: 'sec-4.1.c',
            titleNp:
              'पूर्णरूपमा स्वदेशी कच्चा पदार्थ उपयोग गरी वस्तु तथा सेवा उत्पादन गरेमा',
            title:
              'If Goods and Services are Produced Using Completely Domestic Raw Materials',
            mark: 10,
            keys: ['FULLY_DOMESTIC', 'TRADITIONAL_LOCAL_MATERIALS'],
          },
        ],
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },
    ],
  },

  // Section 5
  {
    id: 'sec-5',
    titleNp: 'व्यावसायिक प्रस्तावको प्रस्तुतीकरण',
    title: 'Presentation of Business Proposal',
    type: 'sum',
    fullMark: 6,
    items: [
      {
        id: 'sec-5.1',
        titleNp: '१. परियोजना प्रतिको आत्मविश्वास',
        title: '1. Confidence in the Project',
        type: 'sum-leaf',
        fullMark: 1,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
      {
        id: 'sec-5.2',
        titleNp: '२. परियोजना प्रस्तावमा संलग्न सूचना तथा विवरणको जानकारी भएमा',
        title:
          '2. If There is Information on the Information and Details Attached to the Project Proposal',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
      {
        id: 'sec-5.3',
        titleNp: '३. परियोजनाको SWOT Analysis गरेको',
        title: '3. Conducted SWOT Analysis of the Project',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
    ],
  },

  // Section 6
  {
    id: 'sec-6',
    titleNp: 'उद्यमको क्रेडिट अप्राइजल',
    title: 'Credit Appraisal of the Enterprise',
    type: 'sum',
    fullMark: 15,
    items: [
      {
        id: 'sec-6.1',
        titleNp:
          '१. स्वपुँजी लगानीमा सञ्चालन गरेको वा ऋणको साँवा र व्याज नियमितरुपमा भुक्तानी गरेको ',
        title:
          '1. Operated with Equity Investment or Regularly Paid the Principal and Interest of the Loan',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
      {
        id: 'sec-6.2',
        titleNp:
          '२. वार्षिक नाफाको कम्तिमा १० प्रतिशत पुनः लगानी गरेको वा नयाँको हकमा पुनः लगानी गर्ने प्रतिबद्धता गरेको',
        title:
          '2. Reinvested at least 10 percent of Annual Profit or Committed to Reinvest in New Equity',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },
      {
        id: 'sec-6.3',
        titleNp: '३. व्यवसायको बीमा गरेको',
        title: '3. Insured the Business',
        type: 'sum-leaf',
        fullMark: 1,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sec-6.4',
        titleNp: '४. कूल लगानीमा स्वलगानी न्यूनतम ५० प्रतिशत भएको',
        title: '4. At least 50 Percent of Total Investment is Self-Investment',
        type: 'sum-leaf',
        fullMark: 6,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sec-6.5',
        titleNp:
          '५. वित्तीय जोखिमको पहिचान गरी न्यूनीकरण तथा व्यवस्थापनका उपाय संलग्न गरेको',
        title:
          '5. Identified Financial Risks and Attached Measures for Mitigation and Management',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
    ],
  },

  // Section 7
  {
    id: 'sec-7',
    titleNp: 'रोजगारीको अवस्था तथा प्रस्तावित रोजगारी',
    title: 'Employment Status and Proposed Employment',
    type: 'sum',
    fullMark: 12,
    items: [
      {
        id: 'sec-7.1',
        titleNp: '१. प्रत्यक्ष रोजगारी सिर्जना',
        title: '1. Creation of Direct Employment',
        type: 'choice',
        fullMark: 9,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sec-7.1.a',
            titleNp: '५ जना भन्दा कम',
            title: 'Less than 5 people',
            mark: 4,
          },
          {
            id: 'sec-7.1.b',
            titleNp: '५-१० जना सम्म',
            title: '5-10 people',
            mark: 6,
          },
          {
            id: 'sec-7.1.c',
            titleNp: '१० जना भन्दा बढी',
            title: 'More than 10 people',
            mark: 9,
          },
        ],
      },

      {
        id: 'sec-7.2',
        titleNp: '२. प्रस्तावित प्रत्यक्ष रोजगारी',
        title: '2. Proposed Direct Employment',
        type: 'choice',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sec-7.2.a',
            titleNp: '५ जना भन्दा कम',
            title: 'Less than 5 people',
            mark: 1,
          },
          {
            id: 'sec-7.2.b',
            titleNp: '५-१० जना सम्म',
            title: '5-10 people',
            mark: 2,
          },
          {
            id: 'sec-7.2.c',
            titleNp: '१० जना भन्दा बढी',
            title: 'More than 10 people',
            mark: 3,
          },
        ],
      },
    ],
  },

  // Sector Specific Evaluation Guidelines
  // Sector 1
  {
    id: 'sector-1',
    code: '1',
    titleNp: 'कृषि, वन तथा उत्पादनमूलक क्षेत्र',
    title: 'Agriculture, Forestry and Production Sector',
    type: 'sum',
    fullMark: 20,
    items: [
      {
        id: 'sector-1.1',
        titleNp: '१. शैक्षिक योग्यता',
        title: '1. Educational Qualification',
        type: 'choice',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sector-1.1.a',
            titleNp: 'माध्यामिक तहसम्म',
            title: 'Up to Secondary Level',
            mark: 1,
          },
          {
            id: 'sector-1.1.b',
            titleNp: 'सम्बन्धित क्षेत्रमा माध्यामिक तह भन्दा माथि',
            title: 'Above Secondary Level in Related Field',
            mark: 2,
          },
        ],
      },

      {
        id: 'sector-1.2',
        titleNp: '२. सम्बन्धित क्षेत्रको कम्तीमा एक वर्षको अनुभव',
        title: '2. At least One Year of Experience in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-1.3',
        titleNp: '३. सम्बन्धित क्षेत्रमा तालिम प्राप्त गरेको',
        title: '3. Trained in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-1.4',
        titleNp: '४. जमिन तथा भवनको स्वामित्व',
        title: '4. Ownership of Land and Building',
        type: 'choice',
        fullMark: 7,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
        options: [
          {
            id: 'sector-1.4.a',
            titleNp: 'आफ्नै स्वामित्व भएको',
            title: 'Own Ownership',
            mark: 7,
            keys: ['OWN_LAND'],
          },

          {
            id: 'sector-1.4.b',
            titleNp: 'भाडा/लिजमा लिएको',
            title: 'Rented/Leased',
            mark: 5,
            keys: ['RENTED_OR_LEASED_LAND'],
          },
        ],
      },

      {
        id: 'sector-1.5',
        titleNp:
          '५. सडक, विद्युत, खानेपानी, भण्डारण, चिस्यान केन्द्र तथा सञ्चारसँग सम्बन्धित पूर्वाधारको उपलब्धता',
        title:
          '5. Availability of Infrastructure Related to Roads, Electricity, Drinking Water, Storage, Cold Storage Centers, and Communication',
        type: 'sum-leaf',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-1.6',
        titleNp: '६. प्रशोधन तथा उत्पादन सम्बन्धी उपकरण भएको ।',
        title: '6. Processing and Production Related Equipment',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.INTERVIEW,
      },
    ],
  },

  // Sector 2
  {
    id: 'sector-2',
    code: '2',
    titleNp: 'सूचना प्रविधि तथा डिजिटल क्षेत्र',
    title: 'Information Technology and Digital Sector',
    type: 'sum',
    fullMark: 20,
    items: [
      {
        id: 'sector-2.1',
        titleNp: '१. शैक्षिक योग्यता',
        title: '1. Educational Qualification',
        type: 'choice',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sector-2.1.a',
            titleNp: 'सम्बन्धित क्षेत्रमा स्नातक तहसम्म',
            title: 'Up to Bachelor Level in Related Field',
            mark: 1,
          },
          {
            id: 'sector-2.1.b',
            titleNp: 'सम्बन्धित क्षेत्रमा स्नातक तह भन्दा माथि',
            title: 'Above Bachelor Level in Related Field',
            mark: 2,
          },
        ],
      },

      {
        id: 'sector-2.2',
        titleNp: '२. सम्बन्धित क्षेत्रको अनुभव ',
        title: '2. Experience in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-2.3',
        titleNp: '३. सम्बन्धित क्षेत्रमा तालिम प्राप्त गरेको',
        title: '3. Trained in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-2.4',
        titleNp: '४. प्रविधिको विकास ',
        title: '4. Technology Development',
        type: 'choice',
        fullMark: 5,
        assessmentStage: ASSESSMENT_TYPE.INTERVIEW,
        options: [
          {
            id: 'sector-2.4.a',
            titleNp: 'भईरहेको प्रविधिमा सुधार गरेको',
            title: 'Improved Existing Technology',
            mark: 3,
          },

          {
            id: 'sector-2.4.b',
            titleNp:
              'नयाँ प्रविधिहरू (प्लाटफर्म, सफ्टवेयर आदि) को विकास गरेको ',
            title: 'Developed New Technologies (Platform, Software, etc.)',
            mark: 5,
          },
        ],
      },

      {
        id: 'sector-2.5',
        titleNp: '५. डिजिटल सुरक्षा तथा गोपनियताका उपायहरु अवलम्बन गरेको',
        title: '5. Adopted Measures for Digital Security and Privacy',
        type: 'sum-leaf',
        fullMark: 5,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-2.6',
        titleNp: '६. जनताको दैनिक जीवन वा सेवा प्रवाहलाई सहज बनाएको',
        title: '6. Made Daily Life or Service Delivery Easier for People',
        type: 'sum-leaf',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
    ],
  },

  // Sector 3
  {
    id: 'sector-3',
    code: '3',
    titleNp: 'पूर्वाधार तथा यातायात क्षेत्र ',
    title: 'Infrastructure and Transportation Sector',
    type: 'sum',
    fullMark: 20,
    items: [
      {
        id: 'sector-3.1',
        titleNp: '१. शैक्षिक योग्यता',
        title: '1. Educational Qualification',
        type: 'choice',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sector-3.1.a',
            titleNp: 'माध्यामिक तहसम्म',
            title: 'Up to Secondary Level',
            mark: 1,
          },
          {
            id: 'sector-3.1.b',
            titleNp: 'सम्बन्धित क्षेत्रमा माध्यामिक तह भन्दा माथि',
            title: 'Above Secondary Level in Related Field',
            mark: 2,
          },
        ],
      },

      {
        id: 'sector-3.2',
        titleNp: '२. सम्बन्धित क्षेत्रको अनुभव ',
        title: '2. Experience in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-3.3',
        titleNp: '३. सम्बन्धित क्षेत्रमा तालिम प्राप्त गरेको',
        title: '3. Trained in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-3.4',
        titleNp: '४. पूर्वाधार विकासमा समुदायसँगको साझेदारी गरेको',
        title: '4. Partnered with the Community in Infrastructure Development',
        type: 'sum-leaf',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-3.5',
        titleNp: '५. उर्जाको प्रयोगको अवस्था',
        title: '5. State of Energy Use',
        type: 'choice',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.INTERVIEW,
        options: [
          {
            id: 'sector-3.5.a',
            titleNp: 'अनवीकरणीय उर्जाको प्रयोग गरेको',
            title: 'Used Non-Renewable Energy',
            mark: 2,
          },

          {
            id: 'sector-3.5.b',
            titleNp: 'हरित उर्जाको प्रयोग गरेको',
            title: 'Used Green Energy',
            mark: 4,
          },
        ],
      },

      {
        id: 'sector-3.6',
        titleNp:
          '६. खेर जाने कच्चा पदार्थ तथा उप उत्पादनको पुनः प्रयोग तथा व्यवस्थापन गरेको/योजना पेश गरेको',
        title: '6. Processing and Production Related Equipment',
        type: 'sum-leaf',
        fullMark: 6,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },
    ],
  },

  // Sector 4
  {
    id: 'sector-4',
    code: '4',
    titleNp: 'सामाजिक सेवा र पर्यटन क्षेत्र',
    title: 'Social Service and Tourism Sector',
    type: 'sum',
    fullMark: 20,
    items: [
      {
        id: 'sector-4.1',
        titleNp: '१. शैक्षिक योग्यता',
        title: '1. Educational Qualification',
        type: 'choice',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sector-4.1.a',
            titleNp: 'माध्यामिक तहसम्म',
            title: 'Up to Secondary Level',
            mark: 1,
          },
          {
            id: 'sector-4.1.b',
            titleNp: 'सम्बन्धित क्षेत्रमा माध्यामिक तह भन्दा माथि',
            title: 'Above Secondary Level in Related Field',
            mark: 2,
          },
        ],
      },

      {
        id: 'sector-4.2',
        titleNp: '२. सम्बन्धित क्षेत्रको अनुभव ',
        title: '2. Experience in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-4.3',
        titleNp: '३. सम्बन्धित क्षेत्रमा तालिम प्राप्त गरेको',
        title: '3. Trained in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-4.4',
        titleNp: '४. आधारभूत पूर्वाधारको उपलब्धता भएको',
        title: '4. Availability of Basic Infrastructure',
        type: 'sum-leaf',
        fullMark: 5,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-4.5',
        titleNp: '५. विपन्न तथा पिछडिएको वर्ग समुदायको पहुँच बढाउने',
        title: '5. Increasing Access to Poor and Marginalized Communities',
        type: 'sum-leaf',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-4.6',
        titleNp:
          '६. दुर शिक्षा तथा टेलिमेडिसिन जस्ता सेवाको प्रवर्द्धन बढाउने ',
        title:
          '6. Promoting Services such as Distance Education and Telemedicine',
        type: 'sum-leaf',
        fullMark: 5,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
    ],
  },

  // Sector 5
  {
    id: 'sector-5',
    code: '5',
    titleNp: 'सामाजिक सेवा र पर्यटन क्षेत्र',
    title: 'Traditional and Local Resources Sector',
    type: 'sum',
    fullMark: 20,
    items: [
      {
        id: 'sector-5.1',
        titleNp: '१. शैक्षिक योग्यता',
        title: '1. Educational Qualification',
        type: 'choice',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        options: [
          {
            id: 'sector-5.1.a',
            titleNp: 'माध्यामिक तहसम्म',
            title: 'Up to Secondary Level',
            mark: 1,
          },
          {
            id: 'sector-5.1.b',
            titleNp: 'सम्बन्धित क्षेत्रमा माध्यामिक तह भन्दा माथि',
            title: 'Above Secondary Level in Related Field',
            mark: 2,
          },
        ],
      },

      {
        id: 'sector-5.2',
        titleNp: '२. सम्बन्धित क्षेत्रको अनुभव ',
        title: '2. Experience in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
        isAutoEvaluated: true,
      },

      {
        id: 'sector-5.3',
        titleNp: '३. सम्बन्धित क्षेत्रमा तालिम प्राप्त गरेको',
        title: '3. Trained in the Related Field',
        type: 'sum-leaf',
        fullMark: 2,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-5.4',
        titleNp:
          '४. परम्परागत तथा स्थानीय समुदायमा उपलब्ध कच्चा पदार्थ प्रयोग गरेको',
        title:
          '4. Used Raw Materials Available in Traditional and Local Communities',
        type: 'sum-leaf',
        fullMark: 4,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-5.5',
        titleNp: '५. लगानीका लागि समुदायसँगको साझेदारी भएमा',
        title: '5. If There is Partnership with the Community for Investment',
        type: 'sum-leaf',
        fullMark: 3,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },

      {
        id: 'sector-5.6',
        titleNp:
          '६. परम्परागत तथा स्थानीय कच्चा पदार्थको दिगोपनाको अवस्था तथा वातावरणमा पार्ने प्रभाबको चित्रण गरेको',
        title:
          '6. Depicted the Sustainability of Traditional and Local Raw Materials and Their Impact on the Environment',
        type: 'sum-leaf',
        fullMark: 7,
        assessmentStage: ASSESSMENT_TYPE.EVALUATION,
      },
    ],
  },
]
