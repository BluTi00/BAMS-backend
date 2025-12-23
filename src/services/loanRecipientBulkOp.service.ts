import { db } from '../db/db.server'
import { BadRequestError } from '../errors'
import path from 'path'
import { getTempFolderPath } from '../utils/path.utils'
import * as XLSX from 'xlsx'
import fs from 'fs'
import { BULK_OPERATION_TYPE } from '../generated/client/client'
import { withSkipAudit } from '../middleware/context'
import { TokenData } from '../server'

class LoanRecipientBulkOpService {
  async bulkUpload(data: any, user: TokenData): Promise<string> {
    const { applicationCycleId, media } = data
    const excelData = await this.validate(media)

    await withSkipAudit(async () => {
      const startTime = Date.now()
      const newBulkOperationLog = await db.bulkOperationLog.create({
        data: {
          operationType: BULK_OPERATION_TYPE.LOAN_RECIPIENT_UPLOAD,
        },
      })

      for (const singleRow of excelData) {
        // DATA VALIDATION LOGIC CAN BE ADDED HERE

        // ----- CHECK FOR EXISTING LOAN RECIPIENTS -----
        const existingLoanRecipient = await db.loanRecipient.findFirst({
          where: {
            applicationCode: singleRow.applicationCode,
            applicationCycleId: applicationCycleId,
          },
        })

        if (existingLoanRecipient) {
          await db.bulkOperationRowError.create({
            data: {
              bulkOperationId: newBulkOperationLog.id,
              rowNumber: singleRow.__rowNumber,
              uniqueIdentifier: singleRow.applicationCode,
              errorMessage: `Loan Already Received by Application Code: ${singleRow.applicationCode}`,
              rawRowData: singleRow,
            },
          })
          // Skip or handle duplicates as per business logic
          continue
        }

        // ----- CREATE LOAN RECIPIENT RECORD -----
        try {
          await db.loanRecipient.create({
            data: {
              applicationCode: singleRow.applicationCode,
              projectName: singleRow.projectName,
              projectAddress: singleRow.projectAddress,
              entrepreneurName: singleRow.entrepreneurName,
              loanRecommendedAmount: singleRow.loanRecommendedAmount,
              loanReceivedAmount: singleRow.loanReceivedAmount,
              panNumber: singleRow.panNumber,
              registrationNumber: singleRow.registrationNumber,
              applicationCycleId: applicationCycleId,
              bulkOperationLogId: newBulkOperationLog.id,
            },
          })
        } catch (error) {
          // console.log('Error creating application:', error)
          await db.bulkOperationRowError.create({
            data: {
              bulkOperationId: newBulkOperationLog.id,
              rowNumber: singleRow.__rowNumber,
              uniqueIdentifier: singleRow.applicationCode,
              errorMessage: `Failed to create loan recipient for code: ${singleRow.applicationCode}. Unknown Error`,
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

    return 'Loan Recipient upload completed.'
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

      if (!sheetNames.includes('LoanRecipient')) {
        throw new BadRequestError('Sheet name "LoanRecipient" not found')
      }

      const loanRecipientSheet = workbook.Sheets['LoanRecipient']

      const loanRecipientExcelDataJSON = XLSX.utils.sheet_to_json(
        loanRecipientSheet,
        { raw: false }
      ) as any

      // ------- CHECK FOR EMPTY EXCEL FILE -----
      if (loanRecipientExcelDataJSON.length === 0) {
        throw new BadRequestError('The provided excel file is empty.')
      }

      // ------- VALIDATE EXCEL HEADERS -----
      const expectedHeaders = ['Application Code', 'Project Name']

      const fileHeaders = Object.keys(loanRecipientExcelDataJSON[0])

      const missingHeaders = expectedHeaders.filter(
        (header) => !fileHeaders.includes(header)
      )

      if (missingHeaders.length > 0) {
        throw new BadRequestError(
          `The following required headers are missing in the Excel file: ${missingHeaders.join(
            ', '
          )}`
        )
      }

      // ----- ROW DATA MAPPING LOGIC -----
      const rowData = []
      let rowIndex = 1
      for (const singleDataJson of loanRecipientExcelDataJSON) {
        const singleRowData = {
          __rowNumber: rowIndex++,
          applicationCode: singleDataJson['Application Code'],
          projectName: singleDataJson['Project Name'],
          projectAddress: singleDataJson['Project Address'],
          entrepreneurName: singleDataJson['Entrepreneur Name'],
          loanRecommendedAmount: Number(singleDataJson['Recommended Amount']),
          loanReceivedAmount: Number(singleDataJson['Received Amount']),
          panNumber: singleDataJson['PAN Number'],
          registrationNumber: singleDataJson['Registration Number'],
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

export default LoanRecipientBulkOpService
