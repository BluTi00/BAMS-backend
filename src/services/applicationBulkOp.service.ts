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
              applicantName: singleRow.applicantName,
              //
              address: {
                create: {
                  provinceId: singleRow?.provinceId,
                  districtId: singleRow?.districtId,
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
          applicationName: singleDataJson['आवेदकको नाम']?.trim() || null,
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
