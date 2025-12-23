import { evaluationGuidelines, IScoreSheet } from '../seed/evaluationGuidelines'
import { db } from '../db/db.server'
import { includeAddress, includeMedia } from '../constants/constant'

export const populateEvaluationScoreSheet = async (applicationId: string) => {
  // fetch application with necessary relations
  const application = await db.application.findUnique({
    where: {
      id: applicationId,
      deletedAt: null,
    },
    include: {
      officeAddress: includeAddress,
      applicationCycle: true,
      media: includeMedia,
      entrepreneurProfile: true,
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
      assessments: {
        select: {
          assessmentType: true,
          isDraft: true,
        },
      },
    },
  })

  if (!application) {
    return { score: 0, scoreSheet: [] }
  }

  const projectAnalysis = application?.projectAnalysis
  const productUsage = application?.productUsage
  const financialAnalysis = application?.financialAnalysis
  const swotAnalysis = application?.swotAnalysis

  const preEvalScoreSheet: IScoreSheet[] = []

  // ------- GENERAL CRITERIA ---------
  // स्टार्टअपको रुपमा दर्ता भएको
  if (projectAnalysis?.isRegisteredAsStartup) {
    const { obtainedMarks, selectedOptionId } =
      extractMarkFromGuideline('sec-1.1')

    preEvalScoreSheet.push({
      id: 'sec-1.1',
      obtainedMarks,
      selectedOptionId,
    })
  } else {
    preEvalScoreSheet.push({
      id: 'sec-1.1',
      obtainedMarks: 0,
    })
  }

  // उद्यम सम्बर्द्धन केन्द्र (BIC) मा आवद्धता
  if (application?.isAffiliatedWithEPC) {
    const { obtainedMarks, selectedOptionId } =
      extractMarkFromGuideline('sec-1.4')
    preEvalScoreSheet.push({
      id: 'sec-1.4',
      obtainedMarks,
      selectedOptionId,
    })
  } else {
    preEvalScoreSheet.push({
      id: 'sec-1.4',
      obtainedMarks: 0,
    })
  }

  // परियोजनाबाट उत्पादित वस्तुको बिक्रीको बजार)
  const {
    obtainedMarks: productMarketMarks,
    selectedOptionId: productMarketId,
  } = extractMarkFromGuideline('sec-2.3', projectAnalysis?.productMarket)
  preEvalScoreSheet.push({
    id: 'sec-2.3',
    obtainedMarks: productMarketMarks,
    selectedOptionId: productMarketId,
  })

  // प्रविधि उपयोगको अवस्था
  const { obtainedMarks: techUsageMarks, selectedOptionId: techUsageOptionId } =
    extractMarkFromGuideline('sec-3.1', productUsage?.technologyAdoptionPurpose)

  preEvalScoreSheet.push({
    id: 'sec-3.1',
    obtainedMarks: techUsageMarks,
    selectedOptionId: techUsageOptionId,
  })

  // आफैले प्रविधिको विकास गरी प्रविधिको अबलम्बन वा हस्तान्तरण गरेको
  if (productUsage?.isTechnologySelfProduced) {
    // generalScore += getObtainedMark('sec-3.2')
    const { obtainedMarks, selectedOptionId } =
      extractMarkFromGuideline('sec-3.2')
    preEvalScoreSheet.push({
      id: 'sec-3.2',
      obtainedMarks,
      selectedOptionId,
    })
  }

  // परियोजनामा प्रयोग हुने कच्चापदार्थको स्रोत
  const {
    obtainedMarks: rawMaterialMarks,
    selectedOptionId: rawMaterialOptionId,
  } = extractMarkFromGuideline('sec-4.1', projectAnalysis?.rawMaterialSource)
  preEvalScoreSheet.push({
    id: 'sec-4.1',
    obtainedMarks: rawMaterialMarks,
    selectedOptionId: rawMaterialOptionId,
  })

  // वार्षिक नाफाको कम्तिमा १० प्रतिशत पुनः लगानी गरेको वा नयाँको हकमा पुनः लगानी गर्ने प्रतिबद्धता गरेको
  if (
    financialAnalysis?.reinvestmentRatioFromProfit &&
    financialAnalysis?.reinvestmentRatioFromProfit >= 10
  ) {
    const { obtainedMarks, selectedOptionId } =
      extractMarkFromGuideline('sec-6.2')
    preEvalScoreSheet.push({
      id: 'sec-6.2',
      obtainedMarks,
      selectedOptionId,
    })
  }

  // कूल लगानीमा स्वलगानी न्यूनतम ५० प्रतिशत भएको
  if (
    application?.financialAnalysis?.selfInvestmentRatioInTotalLoanInvestment &&
    application?.financialAnalysis?.selfInvestmentRatioInTotalLoanInvestment >=
      50
  ) {
    const { obtainedMarks, selectedOptionId } =
      extractMarkFromGuideline('sec-6.4')
    preEvalScoreSheet.push({
      id: 'sec-6.4',
      obtainedMarks,
      selectedOptionId,
    })
  }

  // ------- SECTOR SPECIFIC CRITERIA ---------
  const startupSectorCode =
    application?.projectIntroduction?.startupSector?.code

  // common for all sectors
  // सम्बन्धित क्षेत्रको कम्तीमा एक वर्षको अनुभव
  const experienceScore =
    projectAnalysis?.entrepreneurialExperience === 'NO_EXPERIENCE' ? 0 : 2

  // ---------- कृषि, वन तथा उत्पादनमूलक क्षेत्र ----------
  if (startupSectorCode === '1') {
    // सम्बन्धित क्षेत्रको कम्तीमा एक वर्षको अनुभव
    preEvalScoreSheet.push({
      id: 'sector-1.2',
      obtainedMarks: experienceScore,
    })

    // जमिन तथा भवनको स्वामित्व
    const { obtainedMarks, selectedOptionId } = extractMarkFromGuideline(
      'sector-1.4',
      swotAnalysis?.landAvailability
    )
    preEvalScoreSheet.push({
      id: 'sector-1.4',
      obtainedMarks,
      selectedOptionId,
    })

    // सडक, विद्युत, खानेपानी, भण्डारण, चिस्यान केन्द्र तथा सञ्चारसँग सम्बन्धित पूर्वाधारको उपलब्धता
    if (
      swotAnalysis?.isElectricityAvailable ||
      swotAnalysis?.isRoadAvailable ||
      swotAnalysis?.isCommunicationAvailable ||
      swotAnalysis?.isDrinkingWaterAvailable ||
      swotAnalysis?.isBuildingAvailable
    ) {
      // sectorScore += getObtainedMark('sector-1.5')
      const { obtainedMarks, selectedOptionId } =
        extractMarkFromGuideline('sector-1.5')
      preEvalScoreSheet.push({
        id: 'sector-1.5',
        obtainedMarks,
        selectedOptionId,
      })
    }
  }

  // --------- सूचना प्रविधि तथा डिजिटल क्षेत्र ---------
  if (startupSectorCode === '2') {
    // सम्बन्धित क्षेत्रको अनुभव
    preEvalScoreSheet.push({
      id: 'sector-2.2',
      obtainedMarks: experienceScore,
    })
  }

  // --------- पूर्वाधार तथा यातायात क्षेत्र ---------
  if (startupSectorCode === '3') {
    // सम्बन्धित क्षेत्रको अनुभव
    preEvalScoreSheet.push({
      id: 'sector-3.2',
      obtainedMarks: experienceScore,
    })

    // खेर जाने कच्चा पदार्थ तथा उप उत्पादनको पुनः प्रयोग तथा व्यवस्थापन गरेको/योजना पेश गरेको
    if (swotAnalysis?.isWasteMaterialReused) {
      const { obtainedMarks, selectedOptionId } =
        extractMarkFromGuideline('sector-3.6')
      preEvalScoreSheet.push({
        id: 'sector-3.6',
        obtainedMarks,
        selectedOptionId,
      })
    }
  }

  // ------------ सामाजिक सेवा र पर्यटन क्षेत्र ------------
  if (startupSectorCode === '4') {
    // सम्बन्धित क्षेत्रको अनुभव
    preEvalScoreSheet.push({
      id: 'sector-4.2',
      obtainedMarks: experienceScore,
    })

    // आधारभूत पूर्वाधारको उपलब्धता भएको
    if (
      swotAnalysis?.isElectricityAvailable ||
      swotAnalysis?.isRoadAvailable ||
      swotAnalysis?.isCommunicationAvailable ||
      swotAnalysis?.isDrinkingWaterAvailable ||
      swotAnalysis?.isBuildingAvailable
    ) {
      const { obtainedMarks, selectedOptionId } =
        extractMarkFromGuideline('sector-4.4')
      preEvalScoreSheet.push({
        id: 'sector-4.4',
        obtainedMarks,
        selectedOptionId,
      })
    }
  }

  // ----------- सामाजिक सेवा र पर्यटन क्षेत्र -----------
  if (startupSectorCode === '5') {
    // सम्बन्धित क्षेत्रको अनुभव
    preEvalScoreSheet.push({
      id: 'sector-5.2',
      obtainedMarks: experienceScore,
    })

    // परम्परागत तथा स्थानीय समुदायमा उपलब्ध कच्चा पदार्थ प्रयोग गरेको
    if (projectAnalysis?.rawMaterialSource === 'TRADITIONAL_LOCAL_MATERIALS') {
      // sectorScore += getObtainedMark('sector-5.4')
      const { obtainedMarks, selectedOptionId } =
        extractMarkFromGuideline('sector-5.4')
      preEvalScoreSheet.push({
        id: 'sector-5.4',
        obtainedMarks,
        selectedOptionId,
      })
    }
  }

  // calculate total score
  const score = preEvalScoreSheet.reduce(
    (acc, curr) => acc + (curr.obtainedMarks || 0),
    0
  )

  // create a final evaluation scoresheet
  const evaluationScoreSheet = evaluationGuidelines
    ?.filter(
      (guideline) => !guideline.code || guideline.code === startupSectorCode
    )
    ?.flatMap((guideline) => guideline.items || [])
    ?.map((criteria) => {
      const preEvalItem = preEvalScoreSheet.find(
        (item) => item.id === criteria.id
      )

      return {
        id: criteria.id,
        obtainedMarks: preEvalItem ? preEvalItem?.obtainedMarks : 0,
        selectedOptionId: preEvalItem
          ? preEvalItem.selectedOptionId
          : undefined,
      }
    })

  return {
    score,
    scoreSheet: evaluationScoreSheet,
  }
}

const extractMarkFromGuideline = (
  guidelineId: string,
  selectedOption?: string | null
) => {
  // filter through general evaluation guideline to find the item
  for (const guideline of evaluationGuidelines) {
    const item = guideline.items?.find((itm) => itm.id === guidelineId)
    if (item) {
      if (item.type === 'choice' && item.options) {
        if (!selectedOption) {
          return {
            obtainedMarks: 0,
          }
        }

        const option = item.options.find((opt) =>
          opt.keys?.includes(selectedOption)
        )
        return {
          selectedOptionId: option ? option.id : undefined,
          obtainedMarks: option ? option.mark : 0,
        }
      } else {
        return {
          obtainedMarks: item.fullMark || 0,
        }
      }
    }
  }

  return {
    obtainedMarks: 0,
  }
}
