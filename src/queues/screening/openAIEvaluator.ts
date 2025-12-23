import OpenAI from 'openai'
import { db } from '../../db/db.server'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function evaluateAppByOpenAI(applicationId: string) {
  // return transformToAIScoreSheet(dummyResult) // --- IGNORE ---
  return generateRandomAIScoreSheet() // --- IGNORE ---

  const applicationForm = await db.application.findFirst({
    where: { id: applicationId },
    select: {
      applicationCode: true,
      firmCompanyIndustryName: true,
      firmCompanyIndustryNameNp: true,
      entrepreneurProfile: {
        select: {
          name: true,
          gender: true,
          isMainEntrepreneur: true,
          educationalQualification: true,
          training: true,
          experience: true,
        },
      },
      productUsage: {
        select: {
          productOrServiceName: true,
          productOrServiceNature: true,
          targetCustomerAndMarket: true,
          mainFeaturesOfProductOrService: true,
          specialUtilityOfProductOrService: true,
          sourceOfRawMaterials: true,
        },
      },
      projectIntroduction: {
        select: {
          projectIntroduction: true,
          projectObjective: true,
          startupSector: {
            select: {
              name: true,
              nameNp: true,
            },
          },
          startupSubSector: {
            select: {
              name: true,
              nameNp: true,
            },
          },
        },
      },
      projectAnalysis: {
        select: {
          requestedLoanAmount: true,
          innovativeWork: true,
          innovativeWorkDescription: true,
          nextYearEstimatedJobCreation: true,
          productMarket: true,
          rawMaterialSource: true,
          entrepreneurialExperience: true,
        },
      },
      riskImpactAnalysis: {
        select: {
          riskFactor: true,
          riskMitigationPlan: true,
        },
      },
      swotAnalysis: {
        select: {
          strength: true,
          weakness: true,
          opportunity: true,
          threat: true,
        },
      },
      financialAnalysis: {
        select: {
          enterpriseAndWorkforceInsurance: true,
        },
      },
      workPlan: {
        select: {
          activity: true,
          time: true,
          budget: true,
          expectedOutcome: true,
          risk: true,
          remarks: true,
        },
      },
    },
  })

  const systemPrompt = `
You are an expert evaluator for startup loan applications in Nepal. Your job is to analyze the given application form and produce a structured JSON response with scores, comments, and a final recommendation.

Follow all instructions **strictly and literally**.

======================================================================
SCORING RULES
======================================================================

You must score the application according to the following criteria:

1. projectClarityScore (0–10):
   - Evaluate clarity of project introduction, objectives, product/service description, and operational approach.
   - Higher score = clearer, more complete, and more coherent description.
   - Write a 1–2 sentence comment.

2. entrepreneurCapabilityScore (0–10):
   - Based on education, training, past experience, and role of the main entrepreneur.
   - Higher score = stronger capability.
   - Write a 1–2 sentence comment.

3. sectorAlignmentScore (0–5):
   - How well the project aligns with the provided startup sector and sub-sector.
   - Write a 1 sentence comment.

4. swotQualityScore (0–10):
   - Evaluate relevance, balance, and completeness of SWOT analysis.
   - Write a 1–2 sentence comment.

5. riskManagementScore (0–10):
   - Evaluate whether risks are realistic and whether mitigation plan is practical.
   - Write a 1–2 sentence comment.

6. innovationScore (0–5):
   - Based on whether the project uses innovative, modern or improved approaches.
   - Write a 1 sentence comment.

7. workPlanScore (0–10):
   - Evaluate clarity of activities, timeline, budget, and expected outcomes.
   - Write a 1–2 sentence comment.

8. marketFeasibilityScore (0–10):
   - Based on target market, demand, raw material source, and domestic market strength.
   - Write a 1–2 sentence comment.

9. loanJustificationScore (0–10):
   - Whether requested loan amount is reasonable for the scale and plan.
   - Write a 1–2 sentence comment.

======================================================================
FINAL OUTPUT REQUIREMENTS
======================================================================

After evaluating all criteria:

- summaryEnglish:  
  Write a concise 3–4 sentence overview of the project’s strengths and weaknesses in English.

- summaryNepali:  
  Write the same summary translated into Nepali (use formal Nepali).

- finalRecommendation:  
  Choose exactly one of the following:
    - "Forward to Expert Evaluation"
    - "Needs Clarification"
    - "Not Recommended"

- totalScore:
  Sum of all numerical scores.  
  Formula:
  projectClarityScore  
  + entrepreneurCapabilityScore  
  + sectorAlignmentScore  
  + swotQualityScore  
  + riskManagementScore  
  + innovationScore  
  + workPlanScore  
  + marketFeasibilityScore  
  + loanJustificationScore  

======================================================================
OUTPUT FORMAT (MANDATORY)
======================================================================

Return ONLY the following JSON structure and NOTHING ELSE:

{
  "projectClarityScore": 0,
  "projectClarityComment": "",

  "entrepreneurCapabilityScore": 0,
  "entrepreneurCapabilityComment": "",

  "sectorAlignmentScore": 0,
  "sectorAlignmentComment": "",

  "swotQualityScore": 0,
  "swotQualityComment": "",

  "riskManagementScore": 0,
  "riskManagementComment": "",

  "innovationScore": 0,
  "innovationComment": "",

  "workPlanScore": 0,
  "workPlanComment": "",

  "marketFeasibilityScore": 0,
  "marketFeasibilityComment": "",

  "loanJustificationScore": 0,
  "loanJustificationComment": "",

  "summaryEnglish": "",
  "summaryNepali": "",

  "finalRecommendation": "",
  "totalScore": 0
}

======================================================================

Be objective, consistent, and fair. Do not add extra fields. Do not explain your reasoning outside the JSON.
  `

  const userPrompt = `
Here is the application form JSON:
${JSON.stringify(applicationForm, null, 2)}

Evaluate it now.
  `

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini', // or "gpt-4.1-mini" if you want cheaper
    temperature: 0, // deterministic output
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  // console.log(response, '--- AI Response ---')

  // AI returns JSON as string — parse it safely
  const aiText = response.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(aiText)
    // console.log(parsed, '--- Parsed AI Result ---')
    return transformToAIScoreSheet(parsed)
  } catch (err) {
    console.error('JSON parse error:', err)
    // console.log('AI Returned:', aiText)
    throw new Error('AI returned invalid JSON')
  }
}

// dummy AI Result
const dummyResult = {
  projectClarityScore: 9,
  projectClarityComment:
    'The project introduction and objectives are detailed, coherent, and clearly describe operations and goals. The narrative demonstrates strong understanding of modern livestock farming practices.',

  entrepreneurCapabilityScore: 3,
  entrepreneurCapabilityComment:
    'The form lists no education, training, or experience for the main entrepreneur despite the project claiming experienced manpower. This significantly limits the capability assessment.',

  sectorAlignmentScore: 5,
  sectorAlignmentComment:
    'The project aligns fully with the agriculture and livestock-based startup subsector.',

  swotQualityScore: 9,
  swotQualityComment:
    'SWOT analysis is well-structured, balanced, and relevant, addressing strengths, weaknesses, market opportunities, and external threats clearly.',

  riskManagementScore: 9,
  riskManagementComment:
    'Risks are realistic and the mitigation plan is practical, covering veterinary care, supply management, insurance, and financial safeguards.',

  innovationScore: 4,
  innovationComment:
    'The use of modern livestock technologies and digital record management shows a notable level of innovation.',

  workPlanScore: 3,
  workPlanComment:
    'The work plan is minimal, covering only advertisement with limited detail on full operational activities, timelines, and broader budgeting.',

  marketFeasibilityScore: 8,
  marketFeasibilityComment:
    'Target market, domestic demand, and raw material sourcing are well identified, indicating strong market feasibility.',

  loanJustificationScore: 7,
  loanJustificationComment:
    'The requested amount seems reasonable for a livestock expansion project but the limited work plan details reduce clarity on full financial justification.',

  summaryEnglish:
    'The project demonstrates strong clarity, market relevance, and a comprehensive SWOT and risk management framework. Its alignment with the agriculture and livestock sector is excellent, and it incorporates modern technology. However, the entrepreneur’s capability details are missing, and the work plan lacks completeness. Overall, the project shows promise but requires some clarifications in planning and capacity demonstration.',
  summaryNepali:
    'यस परियोजनामा स्पष्ट विवरण, बजारको मागसँग राम्रो मेल र सन्तुलित SWOT तथा जोखिम व्यवस्थापन योजना देखिन्छ। कृषि तथा पशुपालन क्षेत्रसँग यसको उच्च सम्बन्ध देखिन्छ र आधुनिक प्रविधिको प्रयोग यसको मजबुत पक्ष हो। यद्यपि उद्यमीको क्षमता सम्बन्धी विवरण अनुपस्थित छन् र कार्ययोजना अपूर्ण छ। समग्रमा परियोजना आशाजनक देखिन्छ तर केही पक्षमा थप स्पष्टता आवश्यक छ।',

  finalRecommendation: 'Needs Clarification',
  totalScore: 57,
}

// create score sheet for ai based screening
const transformToAIScoreSheet = (aiResult: any) => {
  return {
    scoreSheet: [
      {
        id: 'ai-1.1',
        obtainedMarks: aiResult?.projectClarityScore,
        comments: aiResult?.projectClarityComment,
      },
      {
        id: 'ai-1.2',
        obtainedMarks: aiResult?.entrepreneurCapabilityScore,
        comments: aiResult?.entrepreneurCapabilityComment,
      },
      {
        id: 'ai-1.3',
        obtainedMarks: aiResult?.sectorAlignmentScore,
        comments: aiResult?.sectorAlignmentComment,
      },
      {
        id: 'ai-1.4',
        obtainedMarks: aiResult?.swotQualityScore,
        comments: aiResult?.swotQualityComment,
      },
      {
        id: 'ai-1.5',
        obtainedMarks: aiResult?.riskManagementScore,
        comments: aiResult?.riskManagementComment,
      },
      {
        id: 'ai-1.6',
        obtainedMarks: aiResult?.innovationScore,
        comments: aiResult?.innovationComment,
      },
      {
        id: 'ai-1.7',
        obtainedMarks: aiResult?.workPlanScore,
        comments: aiResult?.workPlanComment,
      },
      {
        id: 'ai-1.8',
        obtainedMarks: aiResult?.marketFeasibilityScore,
        comments: aiResult?.marketFeasibilityComment,
      },
      {
        id: 'ai-1.9',
        obtainedMarks: aiResult?.loanJustificationScore,
        comments: aiResult?.loanJustificationComment,
      },
      {
        id: 'ai-2.1',
        obtainedMarks: null,
        comments: aiResult?.summaryEnglish,
      },
      {
        id: 'ai-2.2',
        obtainedMarks: null,
        comments: aiResult?.summaryNepali,
      },
      {
        id: 'ai-2.3',
        obtainedMarks: null,
        comments: aiResult?.finalRecommendation,
      },
    ],
    score: aiResult?.totalScore || 0,
  }
}

// create a random score and score sheet for testing
const generateRandomAIScoreSheet = () => {
  const getRandomScore = (max: number) => Math.floor(Math.random() * max)

  const scoreSheet = [
    {
      id: 'ai-1.1',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.2',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.3',
      obtainedMarks: getRandomScore(5),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.4',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.5',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.6',
      obtainedMarks: getRandomScore(5),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.7',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.8',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-1.9',
      obtainedMarks: getRandomScore(10),
      comments: 'Auto-generated comment.',
    },
    {
      id: 'ai-2.1',
      obtainedMarks: null,
      comments: 'Auto-generated summary in English.',
    },
    {
      id: 'ai-2.2',
      obtainedMarks: null,
      comments: 'Auto-generated summary in Nepali.',
    },
    {
      id: 'ai-2.3',
      obtainedMarks: null,
      comments: 'Forward to Expert Evaluation',
    },
  ]

  return {
    scoreSheet,
    score: scoreSheet.reduce((acc, item) => acc + (item.obtainedMarks || 0), 0),
  }
}
