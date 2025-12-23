import { APPLICATION_STATUS } from '../generated/client/client'
import { includeAddress, includeMedia } from '../constants/constant'
import { BadRequestError } from '../errors'
import { convertText, getNepaliAlphabet } from './digitConverter'
import { ADToBS } from './dateFunction'
import { constructAddress, readTemplate } from './helper'
import { db } from '../db/db.server'
import path from 'path'
import { getTemplateFolderPath } from './path.utils'
import puppeteer from 'puppeteer'
import { getBase64Image, getMediaAbsolutePath } from './pdf.utils'
import { getNepaliLabel } from './applicationConstant'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import { initPuppeteerCluster } from './puppeteerCluster'

// Constants
const blankSpace = '____________'
const tickMark = '&#x2611;' // symbol -> ☑
const emptyBox = '&#9744;' // symbol -> ☐
// const crossMark = '&#x2612;' // symbol -> ☒
const bulletMark = '•'

export const generateApplicationPdf = async (
  applicationId: string,
  isUserRole?: boolean,
  enablePuppeteerCluster: boolean = false
) => {
  const application = await db.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      officeAddress: includeAddress,
      applicationCycle: true,
      media: includeMedia,
      entrepreneurProfile: {
        include: {
          temporaryAddress: includeAddress,
          permanentAddress: includeAddress,
        },
      },
      projectIntroduction: {
        include: {
          startupSector: true,
          startupSubSector: true,
        },
      },
      projectAnalysis: true,
      riskImpactAnalysis: true,
      swotAnalysis: true,
      financialAnalysis: true,
      workPlan: true,
      productUsage: true,
      proposer: {
        include: {
          media: includeMedia,
        },
      },
      user: {
        select: {
          role: true,
        },
      },
    },
  })

  if (!application) {
    throw new BadRequestError('Application not found')
  }

  const {
    productUsage,
    projectIntroduction,
    projectAnalysis,
    riskImpactAnalysis,
    swotAnalysis,
    financialAnalysis,
    workPlan,
    entrepreneurProfile,
    proposer,
  } = application

  // --------- PREPARE DATA FOR TEMPLATE ---------
  // application registration detail
  const hideRegistrationDetail =
    isUserRole && application.status === APPLICATION_STATUS.INCOMPLETE

  const applicationRegistrationNumber = hideRegistrationDetail
    ? ''
    : application.applicationCode || ''

  const applicationRegistrationDate = hideRegistrationDetail
    ? ''
    : convertText(ADToBS(application.createdAt), 'ne') || ''

  // ------ COMPANY PROFILE SECTION -------
  const officeAddress = application.officeAddress as any

  const officeProvince = officeAddress?.province
    ? officeAddress.province?.provinceTitleNepali || ''
    : ''
  const officeDistrict = officeAddress?.district
    ? officeAddress.district.districtTitleNepali || ''
    : ''

  const officeMunicipality = officeAddress?.municipality
    ? officeAddress.municipality.municipalityTitleNepali || ''
    : ''

  const officeWard = officeAddress?.ward
    ? officeAddress.ward.wardNumberNepali || ''
    : ''
  const officeLocality = officeAddress?.locality || ''

  const companyProfileData = [
    {
      title: '१. फर्म, कम्पनी वा उद्योगको विवरण',
      isBulletPoint: true,
      sectionData: [
        {
          label: 'फर्म / कम्पनी / उद्योगको नाम',
          value: application?.firmCompanyIndustryNameNp,
        },
        {
          label: 'सुरु दर्ता भएको निकाय',
          value: application?.initialRegistrationOffice,
        },
        {
          label: '',
          group: [
            {
              label: 'दर्ता मिति',
              value: application?.registrationDate,
            },

            {
              label: 'दर्ता नम्बर',
              value: application?.registrationNumber,
            },
          ],
        },
        {
          label: 'उधम सम्बर्धन केन्द्रमा आबद्ध',
          radioOptions: [
            {
              label: 'रहेको',
              checked: application?.isAffiliatedWithEPC,
            },
            {
              label: 'नरहेको',
              checked: !application?.isAffiliatedWithEPC,
            },
          ],
        },
        {
          label: 'स्थायी लेखा नम्बर',
          value: application?.panNumber,
        },

        {
          label:
            'कारोबार सुरू गर्न इजाजत आवश्यक पर्ने फर्म, कम्पनी वा उद्योगको हकमा इजाजत जारी गर्ने निकाय',
          value: application?.licenseProviderOffice,
        },
        {
          label: '',
          group: [
            {
              label: 'इजाजत प्राप्त मिति',
              value: application?.licenseIssuanceDate,
            },

            {
              label: 'इजाजत बहाल रहने अवधि',
              value: application?.licenseValidityPeriod,
              lineBreak: true,
            },
          ],
        },
        {
          label: '',
          group: [
            {
              label: 'मुख्य कारोबार स्थल वा कार्यालय रहेको ठेगाना: प्रदेश',
              value: officeProvince,
            },

            {
              label: 'जिल्ला',
              value: officeDistrict,
            },

            {
              label: ' गा.पा./न.पा./उ.म.न.पा./म.न.पा.',
              value: officeMunicipality,
            },

            {
              label: 'वार्ड नं.',
              value: officeWard,
            },

            {
              label: 'टोल',
              value: officeLocality,
            },

            {
              label: 'टेलिफोन नं.',
              value: application?.officeTelephone,
            },

            {
              label: 'इमेल',
              value: application?.officeEmail,
            },

            {
              label: 'वेबसाइट',
              value: application?.officeWebsite,
            },
          ],
        },
        {
          label: '',
          group: [
            {
              label: 'प्रस्तावक (आधिकारिक प्रतिनिधि)को नाम थर',
              value: application?.representativeName,
            },

            {
              label: 'पद/दर्जा',
              value: application?.representativeDesignation,
            },

            {
              label: 'टेलिफोन नं.',
              value: application?.representativeTelephone,
            },

            {
              label: 'मोबाइल नं.',
              value: application?.representativeMobile,
            },

            {
              label: 'इमेल',
              value: application?.representativeEmail,
            },
          ],
        },
      ],
    },
  ]

  const companyProfileHtml = getSectionHtml({
    data: companyProfileData,
  })

  // ------- ENTREPRENEUR PROFILE SECTION ---------
  const entrepreneurList = entrepreneurProfile
    .map((entrepreneur: any, index: number) => {
      return `
        <tr>
          <td>${convertText(index + 1, 'ne')}</td>
          <td>${entrepreneur?.name} ${entrepreneur.isMainEntrepreneur ? '<br>(मुख्य उद्यमी)</br>' : ''} </td>
          <td>${entrepreneur?.citizenshipNumber}</td>
          <td>${constructAddress(entrepreneur.permanentAddress, 'ne')}</td>
          <td>${constructAddress(entrepreneur.temporaryAddress, 'ne')}</td>
          <td>
					${[
            entrepreneur?.educationalQualification,
            entrepreneur?.training,
            entrepreneur?.experience,
          ]
            .filter(Boolean)
            .join(' / ')}
					</td>
          <td>${convertText(entrepreneur?.mobileNumber, 'ne')}</td>
        </tr>
        `
    })
    .join('')

  // ------- PRODUCT USAGE SECTION ---------
  const productAndUsageData = [
    {
      title: '३. उत्पादन हुने वस्तु र यसको उपयोगको विवरण',
      isNpAlphaNumbering: true,
      sectionData: [
        {
          label: 'वस्तु वा सेवाको नाम',
          value: productUsage?.productOrServiceName,
        },
        {
          label: 'वस्तु वा सेवाको प्रकृति',
          value: productUsage?.productOrServiceNature,
        },
        {
          label: 'लक्षित ग्राहक तथा बजार',
          value: productUsage?.targetCustomerAndMarket,
        },
        {
          label:
            'वस्तु वा सेवाको कुनै ट्रेडमार्क, प्याटेन्ट, डिजाइन वा भौगोलिक संकेत',
          radioOptions: [
            {
              label: 'भएको',
              checked: productUsage?.hasTrademarkPatentDesignGeographical,
            },
            {
              label: 'नभएको',
              checked: !productUsage?.hasTrademarkPatentDesignGeographical,
            },
          ],
        },
        {
          label: 'वस्तु वा सेवाका मुख्य विशेषता',
          value: productUsage?.mainFeaturesOfProductOrService,
        },
        {
          label: 'वस्तु वा सेवाको विशेष उपयोगिता',
          value: productUsage?.specialUtilityOfProductOrService,
        },
        {
          label: 'वस्तु वा सेवाको गुणस्तर प्रमाणिकरण',
          radioOptions: [
            {
              label: 'गरेको',
              checked: productUsage?.qualityCertificationOfProductOrService,
            },
            {
              label: 'नगरेको',
              checked: !productUsage?.qualityCertificationOfProductOrService,
            },
          ],
        },
        {
          label: 'उत्पादनमा अवलम्बन भएको वा हुने प्रविधि',
          value: productUsage?.technologyAdoptedInProduction,
        },
        {
          label: 'अवलम्बन भएको वा हुने प्रविधि आफै उत्पादन',
          radioOptions: [
            {
              label: 'गरेको',
              checked: productUsage?.isTechnologySelfProduced,
            },
            {
              label: 'नगरेको',
              checked: !productUsage?.isTechnologySelfProduced,
            },
          ],
        },
        {
          label: 'प्रविधि अवलम्बन गर्ने उद्देश्य',
          value: getNepaliLabel(productUsage?.technologyAdoptionPurpose),
        },
        {
          label: 'कच्चा पदार्थको स्रोत',
          value: productUsage?.sourceOfRawMaterials,
        },
      ],
    },
  ]

  const productAndUsageHtml = getSectionHtml({
    data: productAndUsageData,
  })

  // ------- PROJECT INTRODUCTION SECTION ---------
  let startupSectorName = ''
  if (application?.projectIntroduction?.startupSectorId) {
    const startupSector = await db.startupSector.findUnique({
      where: {
        id: application?.projectIntroduction?.startupSectorId as string,
      },
    })
    startupSectorName = startupSector?.nameNp || ''
  }

  let starupSubSectorName = ''
  if (application?.projectIntroduction?.startupSubSectorId) {
    const startupSubSector = await db.startupSubSector.findUnique({
      where: {
        id: application?.projectIntroduction?.startupSubSectorId as string,
      },
    })
    starupSubSectorName = startupSubSector?.nameNp || ''
  }

  const projectIntroductionData = [
    {
      title: '',
      sectionData: [
        {
          label: '१. परियोजनाको परिचय (दुई सय शब्दमा नबढ्ने गरी)',
          value: projectIntroduction?.projectIntroduction,
          lineBreak: true,
        },

        {
          label: '२. परियोजनाको उद्देश्य (पचास शब्दमा नबढ्ने गरी)',
          value: projectIntroduction?.projectObjective,
          lineBreak: true,
        },

        {
          label: '३. उद्यमको क्षेत्र (दफा ३ सँग सम्बन्धित) / उपक्षेत्र',
          value: startupSectorName
            ? `${startupSectorName} / ${starupSubSectorName}`
            : undefined,
        },
      ],
    },

    {
      title: '',
      isIndent: true,
      sectionData: [
        {
          label: 'क. परियोजना सरकारको प्राथमिकता प्राप्त क्षेत्रस‌ँग सम्बन्धित',
          radioOptions: [
            {
              label: 'रहेको',
              checked: projectIntroduction?.isProjectInPrioritySector,
            },
            {
              label: 'नरहेको',
              checked: !projectIntroduction?.isProjectInPrioritySector,
            },
          ],
        },
      ],
    },
  ]

  const projectIntroductionHtml = getSectionHtml({
    data: projectIntroductionData,
  })

  // ------- PROJECT ANALYSIS SECTION ---------
  const projectAnalysisData = [
    {
      title:
        'अ) स्टार्टअप उद्यमको रूपमा रहने आधार (दफा ४ अनुसारका मापदण्डसमेत सम्बन्धित सबैमा चिनो लगाउने):',
      sectionData: [
        {
          label: '(क) उद्योग दर्ता गर्ने निकायमा स्टार्टअपको रुपमा दर्ता',
          radioOptions: [
            {
              label: 'भएको',
              checked: projectAnalysis?.isRegisteredAsStartup,
            },
            {
              label: 'नभएको',
              checked: !projectAnalysis?.isRegisteredAsStartup,
            },
          ],
        },

        {
          label: '(ख) प्रविधिको प्रयोग (टेक इनेबल्ड)',
          radioOptions: [
            {
              label: 'भएको',
              checked: projectAnalysis?.isTechEnabled,
            },
            {
              label: 'नभएको',
              checked: !projectAnalysis?.isTechEnabled,
            },
          ],
        },

        {
          label: '(ग) उद्यम स्थापना भएको दस वर्ष',
          radioOptions: [
            {
              label: 'नाघेको',
              checked: projectAnalysis?.isEstablishedMoreThan10Years,
            },
            {
              label: 'ननाघेको',
              checked: !projectAnalysis?.isEstablishedMoreThan10Years,
            },
          ],
        },

        {
          label:
            '(घ) उद्यमको वार्षिक कारोबार कुनै आ.व.मा पन्ध्र करोड रूपैयाँभन्दा बढी',
          radioOptions: [
            {
              label: 'भएको',
              checked: projectAnalysis?.isAnnualTurnoverExceeded15Crores,
            },
            {
              label: 'नभएको',
              checked: !projectAnalysis?.isAnnualTurnoverExceeded15Crores,
            },
          ],
        },

        {
          label:
            '(ङ) कुनै वस्तु वा सेवाको उत्पादन वा वितरण प्रक्रियामा उपभोक्ताले भोग्दै आएको समस्यालाई समाधान गर्न नयाँ प्रविधिको उपयोग एवं सिर्जनशील सोचको प्रयोग',
          radioOptions: [
            {
              label: 'भएको',
              checked: projectAnalysis?.isInnovativeTechnologyUsed,
            },
            {
              label: 'नभएको',
              checked: !projectAnalysis?.isInnovativeTechnologyUsed,
            },
          ],
        },

        {
          label: '(च) उद्यमीले हालसम्म गरेको स्वलगानी रु.',
          value: projectAnalysis?.selfInvestmentAmount,
        },

        {
          label: '(छ) स्टार्टअप उद्यम कर्जाका लागि माग गरिएको रकम रु.',
          value: projectAnalysis?.requestedLoanAmount,
        },

        {
          label: '(ज) गत आर्थिक वर्षको बिक्री रकम: रू.',
          value: projectAnalysis?.lastFiscalYearSalesAmount,
        },

        {
          label: '(झ) कर्जा सूचना केन्द्रको कालोसूचीमा',
          radioOptions: [
            {
              label: 'रहेको',
              checked: projectAnalysis?.isBlacklistedInCreditBureau,
            },
            {
              label: 'नरहेको',
              checked: !projectAnalysis?.isBlacklistedInCreditBureau,
            },
          ],
        },

        {
          label:
            '(ञ) प्रस्तावित परियोजनाको लागि नेपाल सरकार, प्रदेश सरकार वा स्थानीय तहबाट हालसम्म अन्य कुनै अनुदान वा सहुलियत',
          radioOptions: [
            {
              label: 'लिएको',
              checked: projectAnalysis?.isOtherGovGrantReceived,
            },
            {
              label: 'नलिएको',
              checked: !projectAnalysis?.isOtherGovGrantReceived,
            },
          ],
        },
      ],
    },
    {
      title:
        'आ) परियोजना सञ्‍चालनबाट हुने नवप्रवर्तनीय कार्य (मिल्ने कुनै एकमा चिनो लगाउने):',
      sectionData: [
        {
          label:
            '(क) विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको समग्र प्रणालीमा नवीन पद्धतिको विकास',
          radioOptions: [
            {
              label: '',
              checked:
                projectAnalysis?.innovativeWork === 'SYSTEM_WIDE_INNOVATION',
            },
          ],
        },

        {
          label:
            '(ख) विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको खास क्षेत्रमा नवीन पद्धतिको विकास',
          radioOptions: [
            {
              label: '',
              checked:
                projectAnalysis?.innovativeWork === 'SPECIFIC_AREA_INNOVATION',
            },
          ],
        },

        {
          label:
            '(ग) विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको कुनै प्रक्रियामा नवीन पद्धतिको विकास',
          radioOptions: [
            {
              label: '',
              checked: projectAnalysis?.innovativeWork === 'PROCESS_INNOVATION',
            },
          ],
        },

        {
          label:
            'त्यस्तो नवीन पद्धति सम्बन्धी संक्षिप्‍त विवरण (पचास शब्दमा नबढ्ने गरी)',
          value: projectAnalysis?.innovativeWorkDescription,
          lineBreak: true,
        },
      ],
    },
    {
      title: '',
      sectionData: [
        {
          label:
            'इ) आगामी एक वर्षको अवधिमा थप रोजगारी सिर्जनाको सम्भाव्य सङ्ख्या',
          value: projectAnalysis?.nextYearEstimatedJobCreation,
        },
        {
          label:
            'ई) परियोजनाबाट उत्पादित वस्तु वा सेवा बिक्रीको बजार (कुनै एकमा  चिनो लगाउने)',
          lineBreak: true,
          radioOptions: [
            {
              label: 'स्वदेशी बजार',
              checked: projectAnalysis?.productMarket === 'DOMESTIC_MARKET',
            },
            {
              label: 'अन्तर्राष्ट्रिय बजार',
              checked:
                projectAnalysis?.productMarket === 'INTERNATIONAL_MARKET',
            },

            {
              label: 'स्वदेशी तथा अन्तर्राष्ट्रिय दुवै बजार',
              checked: projectAnalysis?.productMarket === 'BOTH_MARKETS',
            },
          ],
        },

        {
          label:
            'उ) परियोजनामा प्रयोग हुने प्रत्यक्ष कच्चापदार्थको स्रोत (कुनै एकमा चिनो लगाउने)',
          lineBreak: true,
          radioOptions: [
            {
              label: 'पूर्णरूपमा स्वदेशी',
              checked: projectAnalysis?.rawMaterialSource === 'FULLY_DOMESTIC',
            },
            {
              label: 'पूर्णरूपमा वैदेशिक',
              checked: projectAnalysis?.rawMaterialSource === 'FULLY_FOREIGN',
            },
            {
              label: 'अधिकतम स्वदेशी',
              checked: projectAnalysis?.rawMaterialSource === 'MOSTLY_DOMESTIC',
            },
            {
              label: 'अधिकतम वैदेशिक',
              checked: projectAnalysis?.rawMaterialSource === 'MOSTLY_FOREIGN',
            },

            {
              label: 'परम्परागत तथा स्थानीय कच्चापदार्थको प्रयोग भएको',
              checked:
                projectAnalysis?.rawMaterialSource ===
                'TRADITIONAL_LOCAL_MATERIALS',
            },
          ],
        },

        {
          label: 'ऊ) प्रस्तावित परियोजनाको विषयक्षेत्रमा मुख्य उद्यमीको अनुभव',
          lineBreak: true,
          radioOptions: [
            {
              label: 'अनुभव नभएको',
              checked:
                projectAnalysis?.entrepreneurialExperience === 'NO_EXPERIENCE',
            },

            {
              label: 'दुई वर्षभन्दा कम अनुभव भएको',
              checked:
                projectAnalysis?.entrepreneurialExperience ===
                'LESS_THAN_TWO_YEARS',
            },

            {
              label: 'दुई वर्ष वा सोभन्दा बढीको अनुभव भएको',
              checked:
                projectAnalysis?.entrepreneurialExperience ===
                'TWO_YEARS_OR_MORE',
            },
          ],
        },
      ],
    },
  ]
  const projectAnalysisHtml = getSectionHtml({
    data: projectAnalysisData,
  })

  // ------- RISK IMPACT ANALYSIS SECTION ---------
  const riskImpactAnalysisData = [
    {
      title: 'ऋ) जोखिम पहिचान तथा व्यवस्थापनः',
      sectionData: [
        {
          label: 'परियोजनाको जोखिम विश्लेषण कार्य गरिएको',
          radioOptions: [
            {
              label: 'छ',
              checked: riskImpactAnalysis?.isRiskAnalysisDone,
            },
            {
              label: 'छैन',
              checked: !riskImpactAnalysis?.isRiskAnalysisDone,
            },
          ],
        },

        {
          label: 'गरिएको छ भने जोखिमको विषय (पचास शब्दमा नबढ्ने गरी)',
          lineBreak: true,
          value: riskImpactAnalysis?.riskFactor,
        },

        {
          label:
            'जोखिम न्यूनीकरण तथा व्यवस्थापनको योजना (एक सय शब्दमा नबढ्नेगरी)',
          lineBreak: true,
          value: riskImpactAnalysis?.riskMitigationPlan,
        },
      ],
    },

    {
      title:
        'ए) प्रस्तावित परियोजनाको कार्यान्वयनबाट वस्तु वा सेवा प्रवाहमा हुने सुधार (कुनै एकमा चिनो लगाउने)',
      sectionData: [
        {
          label:
            'विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको गुणस्तर अभिवृद्धि हुने',
          radioOptions: [
            {
              label: 'हुन्छ',
              checked: riskImpactAnalysis?.isQualityImproved,
            },

            {
              label: 'हुँदैन',
              checked: !riskImpactAnalysis?.isQualityImproved,
            },
          ],
        },

        {
          label: 'विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको वित्तीय लागत घटाउने',
          radioOptions: [
            {
              label: 'घटाउँछ',
              checked: riskImpactAnalysis?.isQualityImproved,
            },

            {
              label: 'घटाउँदैन',
              checked: !riskImpactAnalysis?.isQualityImproved,
            },
          ],
        },

        {
          label: 'विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको समय घटाउने',
          radioOptions: [
            {
              label: 'घटाउँछ',
              checked: riskImpactAnalysis?.isTimeReduced,
            },

            {
              label: 'घटाउँदैन',
              checked: !riskImpactAnalysis?.isTimeReduced,
            },
          ],
        },
      ],
    },
  ]

  const riskImpactAnalysisHtml = getSectionHtml({
    data: riskImpactAnalysisData,
  })

  // ------ SWOT ANALYSIS SECTION ---------
  const swotAnalysisData = [
    {
      title: 'ऐ) परियोजनाको SWOT Analysis:',
      sectionData: [
        {
          label: 'सबल पक्ष (एक सय शब्दमा नबढ्ने गरी)',
          value: swotAnalysis?.strength,
          lineBreak: true,
        },

        {
          label: 'कमजोर पक्ष (एक सय शब्दमा नबढ्ने गरी)',
          value: swotAnalysis?.weakness,
          lineBreak: true,
        },

        {
          label: 'अवसर (एक सय शब्दमा नबढ्ने गरी)',
          value: swotAnalysis?.opportunity,
          lineBreak: true,
        },

        {
          label: 'चुनौती (एक सय शब्दमा नबढ्ने गरी)',
          value: swotAnalysis?.threat,
          lineBreak: true,
        },
      ],
    },

    {
      title: '',
      sectionData: [
        {
          label: `ओ) परियोजनाले वस्तु वा सेवा उत्पादन र बिक्री आरम्भ गरेको मिति <span class="bold">${swotAnalysis?.productionStartDate || blankSpace}</span> वा आरम्भ हुने अपेक्षित मिति`,
          value: swotAnalysis?.expectedProductionStartDate,
        },

        {
          label: 'औ) परियोजना मुनाफामा जाने अपेक्षित आर्थिक वर्ष',
          value: swotAnalysis?.expectedProfitableFiscalYear,
        },
        {
          label:
            'अं) परियोजना स्थलमा पूर्वाधारको अवस्था (सम्बन्धित सबैमा चिनो लगाउने)',
          lineBreak: true,
          radioOptions: [
            {
              label: 'विद्युत्',
              checked: swotAnalysis?.isElectricityAvailable,
            },
            {
              label: 'सडक',
              checked: swotAnalysis?.isRoadAvailable,
            },

            {
              label: 'सञ्‍चार',
              checked: swotAnalysis?.isCommunicationAvailable,
            },

            {
              label: 'खानेपानी',
              checked: swotAnalysis?.isDrinkingWaterAvailable,
            },

            {
              label: 'भवन',
              checked: swotAnalysis?.isBuildingAvailable,
            },
          ],
        },
        {
          label: 'भूमिको उपलब्धता',
          lineBreak: true,
          isIndent: true,
          radioOptions: [
            {
              label: `आफ्नै स्वामित्वको`,
              checked: swotAnalysis?.landAvailability === 'OWN_LAND',
            },

            {
              label: 'भाडा वा लिजमा',
              checked:
                swotAnalysis?.landAvailability === 'RENTED_OR_LEASED_LAND',
            },
          ],
        },

        {
          label: 'अन्य (खुलाउने)',
          value: swotAnalysis?.otherFacilities,
          isIndent: true,
        },

        {
          label: 'परियोजनामा साझेदारिको विवरण',
          value: swotAnalysis?.partnershipDetailsInProject,
          isIndent: true,
        },

        {
          label:
            'अ:) परियोजना सञ्चालनको क्रममा खेर जाने कच्चापदार्थ लगायत अन्य बाइ प्रोडक्टको पुन: प्रयोग',
          radioOptions: [
            {
              label: 'गरेको',
              checked: swotAnalysis?.isWasteMaterialReused,
            },
            {
              label: 'नगरेको',
              checked: !swotAnalysis?.isWasteMaterialReused,
            },
          ],
        },

        {
          label:
            'अआ:) परियोजनामा संलग्न वा पहुँच पुग्ने वर्ग तथा समुदायको विवरण',
          value: swotAnalysis?.involvedCommunityDetails,
        },
      ],
    },
  ]

  const swotAnalysisHtml = getSectionHtml({
    data: swotAnalysisData,
  })

  // ------- FINANCIAL ANALYSIS SECTION ---------
  const financialAnalysisData = [
    {
      title: '',
      sectionData: [
        {
          label: `१. परियोजनाको कुल अनुमानित लागत रु <span class="bold">${financialAnalysis?.totalEstimatedCostOfProject || blankSpace}</span> हालसम्म परियोजनामा  भएको खर्च रु`,
          value: financialAnalysis?.totalCostIncurredInProjectSoFar,
        },

        {
          label: '२. लगानि को स्रोत',
          value: financialAnalysis?.sourceOfInvestment,
        },

        {
          label: '३. सञ्चालन खर्च प्रक्षेपण',
          value: financialAnalysis?.operatingExpenseProjection,
        },

        {
          label: `४. आ.व. <span class="bold">${financialAnalysis?.fiscalYear || blankSpace}</span>को वार्षिक आय तथा नाफा नोक्सानको विवरण`,
          value: financialAnalysis?.annualIncomeAndProfitLossDetails,
        },

        {
          label: '५. उद्यम तथा जनशक्तिको बिमा',
          value: financialAnalysis?.enterpriseAndWorkforceInsurance,
        },

        {
          label: '६. जोखिम न्युनिकरणका उपाय',
          value: financialAnalysis?.riskMitigationMeasures,
        },

        {
          label: '७. नाफाबाट पुन: लगानी गरेको अनुपात',
          value: financialAnalysis?.reinvestmentRatioFromProfit,
        },

        {
          label: '८. कुल ऋण लगानीमा स्वलगानीको अनुपात',
          value: financialAnalysis?.selfInvestmentRatioInTotalLoanInvestment,
        },

        {
          label: '९. ऋण लगानीमा रहेकोमा सावाँ तथा ब्याज भुक्तानी गरेको विवरण',
          value:
            financialAnalysis?.principalAndInterestPaymentDetailsOnLoanInvestment,
        },
      ],
    },
  ]

  const financialAnalysisHtml = getSectionHtml({
    data: financialAnalysisData,
  })

  // ------- WORK PLAN SECTION ---------
  const workPlanList = workPlan
    .map((work: any, index: number) => {
      return `
        <tr>
          <td>${convertText(index + 1, 'ne')}</td>
          <td>${work?.activity}</td>
          <td>${work?.time}</td>
          <td>${work?.budget}</td>
          <td>${work?.expectedOutcome}</td>
          <td>${work?.risk}</td>
          <td>${work?.remarks}</td>
        </tr>
        `
    })
    .join('')

  // ------ DOCUMENT SECTION ---------

  const documentSetup = await db.documentSetup.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      visibilityOrder: 'asc',
    },
  })

  const documentListData = documentSetup?.map((doc, index) => {
    return {
      label: `${convertText(index + 1, 'ne')}. ${doc.nameNp}`,
      radioOptions: [
        {
          label: '',
          checked: application.media.some((m) => m.mediaType === doc.mediaType),
        },
      ],
    }
  })

  const documentListHtml = getSectionHtml({
    data: [
      {
        title: '',
        sectionData: documentListData,
      },
    ],
  })

  // ------- PROPOSER SECTION ---------
  const proposerName = proposer?.name || ''
  const proposedDate = proposer?.proposedDate || ''
  const phoneNumber = proposer?.phone || ''
  const email = proposer?.email || ''

  const signatureUrl =
    proposer?.media.find((m) => m.mediaType === 'SIGNATURE')?.url || ''
  const signatureBase64 = await getBase64Image(signatureUrl)
  const proposerSignatureHtml = signatureBase64
    ? `<img src='${signatureBase64}' style="object-fit: contain; width: 100%; height: 100%;"/>`
    : ''

  const projectStampUrl =
    proposer?.media.find((m) => m.mediaType === 'PROJECT_STAMP')?.url || ''

  const projectStampBase64 = await getBase64Image(projectStampUrl)
  const projectStampHtml = projectStampBase64
    ? `<img src='${projectStampBase64}' style="object-fit: contain; width: 100%; height: 100%;"/>`
    : ''

  const submittedDocumentCount =
    convertText(application?.media?.length, 'ne') || '०'

  // -------- GENERATE PDF FROM TEMPLATE ---------
  const filePath = path.join(getTemplateFolderPath(), 'applicationForm.html')
  const template = await readTemplate(filePath)

  // Replace placeholders with actual data
  const filledTemplate = template
    .replace('{{applicationRegistrationNumber}}', applicationRegistrationNumber)
    .replace('{{applicationRegistrationDate}}', applicationRegistrationDate)

    .replace('{{companyProfileHtml}}', companyProfileHtml)
    .replace('{{entrepreneurList}}', entrepreneurList)
    .replace('{{productAndUsageHtml}}', productAndUsageHtml)
    .replace('{{projectIntroductionHtml}}', projectIntroductionHtml)
    .replace('{{projectAnalysisHtml}}', projectAnalysisHtml)
    .replace('{{riskImpactAnalysisHtml}}', riskImpactAnalysisHtml)
    .replace('{{swotAnalysisHtml}}', swotAnalysisHtml)
    .replace('{{financialAnalysisHtml}}', financialAnalysisHtml)
    .replace('{{workPlanList}}', workPlanList)
    .replace('{{documentListHtml}}', documentListHtml)
    //
    .replace('{{proposerName}}', proposerName)
    .replace('{{proposedDate}}', proposedDate)
    .replace('{{phoneNumber}}', phoneNumber)
    .replace('{{email}}', email)
    .replace('{{proposerSignatureHtml}}', proposerSignatureHtml)
    .replace('{{projectStampHtml}}', projectStampHtml)
    .replace('{{submittedDocumentCount}}', submittedDocumentCount)

  const applicationPdfName = `${application.applicationCode}-${new Date().getTime()}`

  if (enablePuppeteerCluster) {
    const cluster = await initPuppeteerCluster() // Get the shared cluster
    const pdfBuffer = await cluster.execute(async ({ page }: any) => {
      await page.setContent(filledTemplate, { waitUntil: 'networkidle0' })

      return await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: 50, bottom: 50, left: 50, right: 50 },
        timeout: 60000,
      })
    })

    // Send PDF as response
    return {
      pdf: Buffer.from(pdfBuffer),
      fileName: applicationPdfName,
      applicationCode: application.applicationCode || '',
    }
  }

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(filledTemplate, { waitUntil: 'domcontentloaded' })

  // Generate PDF

  const pdf = await page.pdf({
    format: 'A4',
    displayHeaderFooter: false,
    margin: {
      top: 50,
      left: 50,
      right: 50,
      bottom: 50,
    },
    // These two lines are the crucial ones since v20
    timeout: 60000,
  })

  // Close browser
  await browser.close()

  return {
    // pdf: Buffer.from(pdf),
    pdf: Buffer.from(pdf),
    fileName: applicationPdfName,
    applicationCode: application.applicationCode || '',
  }
}

export const convertImageToPdfPuppeteer = async (imageList: any[]) => {
  if (!imageList || imageList.length === 0) {
    return null
  }

  // Read template file
  const filePath = path.join(getTemplateFolderPath(), 'document.html')
  const template = await readTemplate(filePath)

  // change INDUSTRY_REGISTRATION_CERTIFICATE to Industry Registration Certificate
  const getMediaTypeName = (mediaType: string) => {
    if (!mediaType) {
      return ''
    }
    return mediaType
      .toLowerCase()
      .split('_')
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
  }

  const imageListHtml = imageList
    .map((media) => {
      return `
        <div >
          <img src='${media.url}' alt="image" class="a4-size-div"/>
          <p class="text-center">${getMediaTypeName(media.mediaType)}</p>
        </div>
        `
    })
    .join('')

  // Replace placeholders with actual data
  const filledTemplate = template.replaceAll('{{imageList}}', imageListHtml)

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(filledTemplate, { waitUntil: 'domcontentloaded' })

  // Wait for all images to load before generating the PDF
  await page.evaluate(async () => {
    const images = Array.from(document.images)
    await Promise.all(
      images.map((img) => {
        if (!img.complete) {
          return new Promise((resolve) => (img.onload = img.onerror = resolve))
        }
      })
    )
  })

  // Generate PDF
  const pdf = await page.pdf({
    format: 'A4',
    displayHeaderFooter: false,
    margin: {
      top: 50,
      left: 50,
      right: 50,
      bottom: 50,
    },
  })

  // Close browser
  await browser.close()

  // Send PDF as response
  return Buffer.from(pdf)
}

const getSectionHtml = ({ data }: { data: any }) => {
  if (!data || data.length === 0) return ''

  const finalHtmlArray: string[] = []

  for (const item of data) {
    const {
      title,
      sectionData,
      isBulletPoint,
      isNpNumbering,
      isNpAlphaNumbering,
      isIndent,
    } = item

    let html = ''
    sectionData?.forEach((item: any, index: number) => {
      const { label, group, radioOptions, value, lineBreak, isIndent } = item

      const prefix = /* html */ `
            <span>
      					${
                  isNpAlphaNumbering
                    ? `(${getNepaliAlphabet(index)}) `
                    : isNpNumbering
                      ? `${convertText(index + 1, 'ne')}. `
                      : isBulletPoint
                        ? bulletMark
                        : ''
                }
                </span>
            ${label ? label + ':' : ''}
            ${lineBreak ? '<br />' : ''}
      `

      const singleDataHtml = getSingleDataHtml({
        label,
        value,
        radioOptions,
        group,
        prefix,
      })

      html += /* html */ `
        <div class="${isIndent ? 'tab' : ''}">
          ${singleDataHtml}
        </div>
      `
    })

    finalHtmlArray.push(/* html */ `
    <div>${title}</div>
    <div class="${title || isIndent ? 'tab' : ''}">${html}</div>
  `)
  }

  return finalHtmlArray.join('')
}

const getSingleDataHtml = ({
  value,
  radioOptions,
  group,
  prefix,
}: {
  label: string
  value: any
  radioOptions?: any[]
  group?: any[]
  lineBreak?: boolean
  prefix?: string
}) => {
  const html = /* html */ `
        <div>
					${
            radioOptions && radioOptions?.length > 0
              ? /* html */ `
              ${prefix}
							<div class="select">
								${radioOptions
                  ?.map(
                    (o: any /*html*/) =>
                      `${o.label} ${
                        o.text
                          ? o.text
                          : /*html*/ `<div class="check-mark"> ${o.checked ? tickMark : emptyBox}</div>`
                      }`
                  )
                  .join('')}
							</div>
							`
              : group && group?.length > 0
                ? /* html */ `
                <div class="group-div">
                ${prefix}
                  ${group
                    ?.map((gItem: any) => {
                      return /* html */ `
                      <span>
                        ${gItem.label ? gItem.label + ':' : ''}
                        <span class="bold" style="margin-right: 1rem">${gItem.value || blankSpace}</span>
                      </span>
                    `
                    })
                    .join('')}
              </div>
            `
                : /*html*/ ` <div>
                ${prefix}
                <span class="bold">${value || blankSpace}</span>
                </div> 
                `
          }
        </div>
      `

  return html
}

export const convertImageToPdf = async (
  imageList: any[]
): Promise<Uint8Array | null> => {
  if (!imageList || imageList.length === 0) {
    return null
  }

  const pdfDoc = await PDFDocument.create()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (const media of imageList) {
    if (!media?.url || !media.mimeType?.includes('image')) continue

    const mediaFilePath = getMediaAbsolutePath(media.url)
    if (!fs.existsSync(mediaFilePath)) continue

    const imageBuffer = fs.readFileSync(mediaFilePath)
    let image
    if (media.mimeType.includes('jpeg') || media.mimeType.includes('jpg')) {
      image = await pdfDoc.embedJpg(imageBuffer)
    } else if (media.mimeType.includes('png')) {
      image = await pdfDoc.embedPng(imageBuffer)
    } else {
      // Skip unsupported formats or add more (e.g., GIF via conversion)
      continue
    }

    const page = pdfDoc.addPage([595, 842]) // A4 size in points (72 dpi)
    const { width, height } = image.scale(1.0) // Get original dimensions

    // Scale to fit page with margins (e.g., 50pt margins)
    const maxWidth = 595 - 100
    const maxHeight = 842 - 150 // Extra space for caption
    const scale = Math.min(maxWidth / width, maxHeight / height)
    const drawWidth = width * scale
    const drawHeight = height * scale

    page.drawImage(image, {
      x: (595 - drawWidth) / 2, // Center horizontally
      y: (842 - drawHeight) / 2, // Center vertically, offset for caption
      width: drawWidth,
      height: drawHeight,
    })

    // Add caption
    const caption = getMediaTypeName(media.mediaType) // Your existing function
    page.drawText(caption, {
      x: (595 - helveticaFont.widthOfTextAtSize(caption, 12)) / 2, // Center
      y: 50, // Bottom margin
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
  }

  const pdf = await pdfDoc.save()
  return Buffer.from(pdf)
}

const getMediaTypeName = (mediaType: string) => {
  if (!mediaType) {
    return ''
  }
  return mediaType
    .toLowerCase()
    .split('_')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
