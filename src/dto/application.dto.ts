import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { AddressDto } from './address.dto'
import { APPLICATION_STATUS } from '../generated/client/client'
import { MediaDto } from './media.dto'

export class ApplicationDto {
  @IsOptional()
  @IsString()
  applicationCode: string

  @IsOptional()
  @IsString()
  createdAt: string

  @IsString()
  @IsNotEmpty()
  firmCompanyIndustryName: string

  @IsString()
  @IsNotEmpty()
  firmCompanyIndustryNameNp: string

  @IsString()
  @IsNotEmpty()
  initialRegistrationOffice: string

  @IsString()
  @IsNotEmpty()
  registrationDate: string

  @IsBoolean()
  @IsOptional()
  isAffiliatedWithEPC: boolean

  @IsString()
  @IsNotEmpty()
  registrationNumber: string

  @IsString()
  @IsNotEmpty()
  panNumber: string

  @IsOptional()
  @IsString()
  licenseProviderOffice: string

  @IsOptional()
  @IsString()
  licenseIssuanceDate: string

  @IsOptional()
  @IsString()
  licenseValidityPeriod: string

  @IsOptional()
  officeAddress: AddressDto

  @IsOptional()
  @IsString()
  officeTelephone: string

  @IsOptional()
  @IsString()
  officeEmail: string

  @IsOptional()
  @IsString()
  officeWebsite: string

  @IsString()
  @IsNotEmpty()
  representativeName: string

  @IsString()
  @IsNotEmpty()
  representativeDesignation: string

  @IsOptional()
  @IsString()
  representativeTelephone: string

  @IsString()
  @IsNotEmpty()
  representativeMobile: string

  @IsOptional()
  @IsString()
  representativeEmail: string
}

export class ProductUsageDto {
  @IsNotEmpty()
  @IsString()
  productOrServiceName: string

  @IsOptional()
  @IsString()
  productOrServiceNature: string

  @IsOptional()
  @IsString()
  targetCustomerAndMarket: string

  @IsOptional()
  @IsBoolean()
  hasTrademarkPatentDesignGeographical: boolean

  @IsOptional()
  @IsString()
  mainFeaturesOfProductOrService: string

  @IsOptional()
  @IsString()
  specialUtilityOfProductOrService: string

  @IsOptional()
  @IsBoolean()
  qualityCertificationOfProductOrService: boolean

  @IsOptional()
  @IsString()
  technologyAdoptedInProduction: string

  @IsOptional()
  @IsBoolean()
  isTechnologySelfProduced: boolean

  @IsOptional()
  @IsString()
  technologyAdoptionPurpose: string

  @IsOptional()
  @IsString()
  sourceOfRawMaterials: string
}

export class ProjectIntroductionDto {
  @IsOptional()
  @IsString()
  projectIntroduction: string

  @IsOptional()
  @IsString()
  projectObjective: string

  @IsOptional()
  @IsBoolean()
  isProjectInPrioritySector: boolean

  @IsOptional()
  @IsString()
  startupSectorId: string

  @IsOptional()
  @IsString()
  startupSubSectorId: string
}

export class ProjectAnalysisDto {
  @IsBoolean()
  isEstablishedMoreThan10Years: boolean

  @IsBoolean()
  isAnnualTurnoverExceeded15Crores: boolean

  @IsBoolean()
  isInnovativeTechnologyUsed: boolean

  @IsNumber()
  selfInvestmentAmount: number

  @IsNumber()
  requestedLoanAmount: number

  @IsNumber()
  lastFiscalYearSalesAmount: number

  @IsBoolean()
  isBlacklistedInCreditBureau: boolean

  @IsBoolean()
  isOtherGovGrantReceived: boolean

  @IsString()
  innovativeWork: string

  @IsString()
  innovativeWorkDescription: string

  @IsNumber()
  nextYearEstimatedJobCreation: number

  @IsString()
  productMarket: string

  @IsString()
  rawMaterialSource: string

  @IsString()
  entrepreneurialExperience: string

  @IsBoolean()
  isRegisteredAsStartup: boolean

  @IsBoolean()
  isTechEnabled: boolean
}

export class RiskImpactAnalysisDto {
  @IsBoolean()
  isRiskAnalysisDone: boolean

  @IsOptional()
  @IsString()
  riskFactor: string

  @IsOptional()
  @IsString()
  riskMitigationPlan: string

  @IsBoolean()
  isQualityImproved: boolean

  @IsBoolean()
  isCostReduced: boolean

  @IsBoolean()
  isTimeReduced: boolean
}

export class SwotAnalysisDto {
  @IsString()
  strength: string

  @IsString()
  weakness: string

  @IsString()
  opportunity: string

  @IsString()
  threat: string

  @IsString()
  productionStartDate: string

  @IsOptional()
  @IsString()
  expectedProductionStartDate: string

  @IsOptional()
  @IsString()
  expectedProfitableFiscalYear: string

  @IsBoolean()
  isElectricityAvailable: boolean

  @IsBoolean()
  isRoadAvailable: boolean

  @IsBoolean()
  isCommunicationAvailable: boolean

  @IsBoolean()
  isDrinkingWaterAvailable: boolean

  @IsBoolean()
  isBuildingAvailable: boolean

  @IsOptional()
  @IsString()
  otherFacilities: string

  @IsOptional()
  @IsString()
  landAvailability: string

  @IsOptional()
  @IsString()
  partnershipDetailsInProject: string

  @IsBoolean()
  isWasteMaterialReused: boolean

  @IsOptional()
  @IsString()
  involvedCommunityDetails: string
}

export class FinancialAnalysisDto {
  @IsOptional()
  @IsNumber()
  totalEstimatedCostOfProject: number

  @IsOptional()
  @IsNumber()
  totalCostIncurredInProjectSoFar: number

  @IsOptional()
  @IsString()
  sourceOfInvestment: string

  @IsOptional()
  @IsNumber()
  operatingExpenseProjection: number

  @IsOptional()
  @IsString()
  fiscalYear: string

  @IsOptional()
  @IsString()
  annualIncomeAndProfitLossDetails: string

  @IsOptional()
  @IsString()
  enterpriseAndWorkforceInsurance: string

  @IsOptional()
  @IsString()
  riskMitigationMeasures: string

  @IsOptional()
  @IsNumber()
  reinvestmentRatioFromProfit: number

  @IsOptional()
  @IsNumber()
  selfInvestmentRatioInTotalLoanInvestment: number

  @IsOptional()
  @IsString()
  principalAndInterestPaymentDetailsOnLoanInvestment: string
}

export class DocumentDto {
  @IsArray()
  @IsOptional()
  media: MediaDto[]

  @IsOptional()
  deletedMedia: string[]

  @IsOptional()
  mediaCaption: any
}

export class ProposerDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  proposedDate: string

  @IsOptional()
  @IsString()
  phone: string

  @IsOptional()
  @IsString()
  email: string

  @IsArray()
  @IsOptional()
  media: MediaDto[]

  @IsOptional()
  deletedMedia: string[]
}

export class UpdateApplicationStatusDto {
  @IsEnum(APPLICATION_STATUS)
  status: APPLICATION_STATUS

  @IsOptional()
  @IsString()
  rejectionReason: string
}
