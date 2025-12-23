import { db } from '../db/db.server'
import { BadRequestError } from '../errors'
import path from 'path'
import { getTempFolderPath } from '../utils/path.utils'
import * as XLSX from 'xlsx'
import fs from 'fs'
import { BULK_OPERATION_TYPE } from '../generated/client/client'
import { withSkipAudit } from '../middleware/context'
import { TokenData } from '../server'
import { convertText } from '../utils/digitConverter'

class ApplicationBulkOpService {
  async bulkUpload(data: any, user: TokenData): Promise<string> {
    const { applicationCycleId, media } = data
    const excelData = await this.validate(media)

    await withSkipAudit(async () => {
      const startTime = Date.now()

      const newBulkOperationLog = await db.bulkOperationLog.create({
        data: {
          operationType: BULK_OPERATION_TYPE.APPLICATION_UPLOAD,
        },
      })

      for (const singleRow of excelData) {
        // DATA VALIDATION LOGIC CAN BE ADDED HERE

        // Check Duplicate Application Code
        const isApplicationExist = await db.application.findFirst({
          where: {
            applicationCode: singleRow.applicationCode,
            applicationCycleId: applicationCycleId,
          },
        })

        if (isApplicationExist) {
          await db.bulkOperationRowError.create({
            data: {
              bulkOperationId: newBulkOperationLog.id,
              rowNumber: singleRow.__rowNumber,
              uniqueIdentifier: singleRow.applicationCode,
              errorMessage: `Duplicate application code: ${singleRow.applicationCode}`,
              rawRowData: singleRow,
            },
          })
          continue
        }

        try {
          await db.application.create({
            data: {
              applicationCycle: {
                connect: { id: applicationCycleId },
              },
              applicationCode: singleRow.applicationCode,
              firmCompanyIndustryName: singleRow.projectName,
              firmCompanyIndustryNameNp: singleRow.projectName,
              representativeName: singleRow.representativeName,
              representativeMobile: singleRow.representativeMobile,
              //
              officeAddress: {
                create: {
                  provinceId: singleRow?.provinceId,
                  districtId: singleRow?.districtId,
                },
              },
              projectIntroduction: {
                create: {
                  startupSectorId: singleRow.startupSectorId,
                  startupSubSectorId: singleRow.startupSubSectorId,
                },
              },
              bulkOperationLog: {
                connect: {
                  id: newBulkOperationLog.id,
                },
              },
            },
          })
        } catch (error) {
          // console.log('Error creating application:', error)
          await db.bulkOperationRowError.create({
            data: {
              bulkOperationId: newBulkOperationLog.id,
              rowNumber: singleRow.__rowNumber,
              uniqueIdentifier: singleRow.applicationCode,
              errorMessage: `Failed to create application for code: ${singleRow.applicationCode}. Unknown Error`,
              rawRowData: singleRow,
            },
          })
          continue
        }
      }

      // Update the BulkOperationLog
      const endTime = Date.now()
      await db.bulkOperationLog.update({
        where: { id: newBulkOperationLog.id },
        data: {
          totalCount: excelData.length,
          duration: endTime - startTime,
          triggeredById: user.userId,
        },
      })
    })
    return 'Application Bulk upload completed.'
  }

  async validate(media: any): Promise<any> {
    if (!media || media.length === 0) {
      throw new BadRequestError('Please provide the valid excel file.')
    }

    const fileName = media[0].name
    const filePath = path.resolve(getTempFolderPath(), fileName)

    try {
      // =========== CONVERTING EXCEL FILE TO JSON =========
      const workbook = XLSX.readFile(filePath)
      // list all the worksheets in the workbook
      const sheetNames = workbook.SheetNames

      if (!sheetNames.includes('Applications')) {
        throw new BadRequestError('Sheet name "Application" not found')
      }

      const singleSheet = workbook.Sheets['Applications']

      const excelDataJSON = XLSX.utils.sheet_to_json(singleSheet, {
        raw: false,
      }) as any

      // ------- CHECK FOR EMPTY EXCEL FILE -----
      if (excelDataJSON.length === 0) {
        throw new BadRequestError('The provided excel file is empty.')
      }

      // ------- VALIDATE EXCEL HEADERS -----
      const mandatoryColumns = ['दर्ता नं']
      const fileHeaders = Object.keys(excelDataJSON[0])
      const missingHeaders = mandatoryColumns.filter(
        (column) => !fileHeaders.includes(column)
      )

      if (missingHeaders.length > 0) {
        throw new BadRequestError(
          `The following required headers are missing in the Excel file: ${missingHeaders.join(
            ', '
          )}`
        )
      }

      // ===========================================
      // DATA NORMALIZATION & MAPPING LOGIC
      // ===========================================

      // ----- FETCH REFERENCE DATA -----
      // Startup Sector List
      const startupSubSectorList = await db.startupSubSector.findMany({
        select: { id: true, name: true, nameNp: true, startupSectorId: true },
      })

      const subSectorNameCorrections = [
        {
          wrong: 'क. कृषि, सिँचाइ तथा पशुपन्छीमा आधारित उद्यम;',
          correct: 'कृषि, सिँचाइ तथा पशुपन्छीमा आधारित उद्यम',
        },
        {
          wrong: 'ख. उत्पादनमूलक उद्यम;',
          correct: 'उत्पादनमूलक उद्यम',
        },
        {
          wrong: 'ग. वन (जडीबुटी, वन पैदावार) मा आधारित उद्यम;',
          correct: 'वन (जडीबुटी, वन पैदावार)मा आधारित उद्यम',
        },
        {
          wrong: 'घ. खानी तथा खनिजको अनुसन्धान तथा विकास;',
          correct: 'खानी तथा खनिज अनुसन्धान तथा विकास',
        },
        {
          wrong: 'ङ. खाद्य प्रविधि तथा पोषण',
          correct: 'खाद्य प्रविधि तथा पोषण',
        },
        {
          wrong: 'च. विज्ञान, प्रविधि, सञ्‍चार तथा सूचना प्रविधि',
          correct: 'विज्ञान, प्रविधि, सञ्‍चार तथा सूचना प्रविधि',
        },
        {
          wrong: 'छ. घरायसी वा दैनिक जीवन सरलीकरण प्रविधि',
          correct:
            'घरायसी वा दैनिक जीवनयापनलाई सरल, सहज, सुरक्षित बनाउन सहयोग पुग्‍ने प्रकृतिका कार्यसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ज. फोहोरमैला व्यवस्थापनसँग सम्बन्धित उद्यम',
          correct: 'फोहोरमैला व्यवस्थापनसँग सम्बन्धित उद्यम',
        },
        {
          wrong:
            'झ. सार्वजनिक सेवा प्रवाह, उत्पादन तथा सेवा प्रक्रियामा सुधारसँग सम्बन्धित उद्यम',
          correct:
            'सार्वजानिक सेवा प्रवाह, उत्पादन तथा सेवा प्रक्रियामा सुधारसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ञ. सहज र सुरक्षित परिवहन तथा लजिष्टिक',
          correct: 'सहज र सुरक्षित यातायत तथा पारवहन सेवासँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ट. पूर्वाधार निर्माण कार्य',
          correct: 'पूर्वाधार निर्माण कार्यसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ठ. विद्युतीय सवारी साधन तथा अटोमोबाइल',
          correct: 'विद्य्तीय सवारी साद्यन तथा अटोमोबाइलसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ड. वस्तु वा सेवाको वितरण प्रणालीसँग सम्बन्धित उद्यम',
          correct: 'वस्तु वा सेवाको वितरण प्रणालीसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ढ. शिक्षा तथा शिक्षण सिकाइसँग सम्बन्धित उद्यम',
          correct: 'शिक्षा तथा शिक्षण सिकाइसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ण. मानव स्वास्थ्य सेवासँग सम्बन्धित उद्यम',
          correct: 'मानव स्वास्थ्य सेवासँग सम्बन्धित उद्यम',
        },
        {
          wrong:
            'त. पर्यटन प्रवर्धन तथा मनोरञ्‍जन र अतिथि सत्कारसँग सम्बन्धित उद्यम',
          correct:
            'पर्यटन प्रवर्धन तथा मनोरञ्‍जन र अतिथि सत्कारसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'थ. परम्परागत तथा ग्रामीण प्रविधिसँग सम्बन्धित उद्यम',
          correct: 'परम्परागत तथा ग्रामीण प्रविधिसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'द. परम्परागत पेसा तथा उद्यमको पुनर्जागरणसँग सम्बन्धित उद्यम',
          correct: 'परम्परागत पेसा तथा उद्यमको पुनर्जागरणसँग सम्बन्धित उद्यम',
        },
        {
          wrong: 'ध. स्थानीय स्रोत तथा साधनमा आधारित उद्यम',
          correct: 'स्थानिय स्रोत तथा साधनमा आधारित उद्यम',
        },
      ]

      const provinceList = await db.province.findMany({
        select: { id: true, provinceTitleNepali: true },
      })

      const districtList = await db.district.findMany({
        select: { id: true, districtTitleNepali: true },
      })

      // ----- ROW DATA MAPPING LOGIC -----
      const rowData = []
      let rowIndex = 1
      for (const singleDataJson of excelDataJSON) {
        const applicationCode = convertText(singleDataJson['दर्ता नं'], 'en')

        if (!applicationCode) {
          continue
        }

        const correctedSubSectorName = subSectorNameCorrections.find(
          (correction) => correction.wrong === singleDataJson['क्षेत्र']?.trim()
        )?.correct

        const startupSubSectorId = startupSubSectorList.find(
          (subSector) => subSector.nameNp === correctedSubSectorName
        )

        const provinceId = provinceList.find(
          (prov) =>
            prov.provinceTitleNepali === singleDataJson['प्रदेश']?.trim()
        )?.id

        const districtId = districtList.find(
          (dist) =>
            dist.districtTitleNepali === singleDataJson['जिल्ला']?.trim()
        )?.id

        const singleRowData = {
          __rowNumber: rowIndex++,
          applicationCode,
          projectName: singleDataJson['परियोजनाको नाम'],
          projectAddress: singleDataJson['परियोजनाको ठेगाना'],
          representativeName: singleDataJson['मुख्य प्रस्तावकको नाम'],
          representativeMobile: singleDataJson['सम्पर्क'],
          provinceId: provinceId ? provinceId : null,
          districtId: districtId ? districtId : null,
          panNumber: singleDataJson['पान नं'],
          startupSubSectorId: startupSubSectorId ? startupSubSectorId.id : null,
          startupSectorId: startupSubSectorId
            ? startupSubSectorId.startupSectorId
            : null,
        }
        rowData.push(singleRowData)
      }

      if (rowData.length === 0) {
        throw new BadRequestError('The provided excel file has no data rows.')
      }

      return rowData
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {}) // async + non-blocking
      }
    }
  }
}

export default ApplicationBulkOpService
