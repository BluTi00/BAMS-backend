import ExcelJS from 'exceljs'
import path from 'path'
import { getTempFolderPath } from './path.utils'

export const generateExcelFile = async ({
  selectedHeaderKeys,
  headers,
  data,
  fileName = `Exported-Data-${new Date().getTime()}.xlsx`,
  sheetName = 'Sheet1',
}: {
  selectedHeaderKeys: string[]
  headers: any[]
  data: any[]
  fileName?: string
  sheetName?: string
}) => {
  const workbook = new ExcelJS.Workbook()

  // Sort selected headers to match the order headers are defined
  selectedHeaderKeys.sort((a, b) => {
    const indexA = headers.findIndex((header) => header.key === a)
    const indexB = headers.findIndex((header) => header.key === b)
    return indexA - indexB
  })

  const newData = data.map((item: any) => {
    const row: string[] = []
    selectedHeaderKeys.forEach((key: string) => {
      row.push(item[key] || '')
    })
    return row
  })

  const excelSheet = workbook.addWorksheet(sheetName)

  // Generate header row
  const headerLabels = selectedHeaderKeys.map((key) => {
    const header = headers.find((h) => h.key === key)
    return header?.header || key
  })

  excelSheet.addRows([headerLabels, ...newData])

  // Highlight the first row as header
  excelSheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCCCCC' }, // Light gray background
    }
    cell.alignment = { horizontal: 'center' }
  })

  // export the data to a file
  const exportPath = path.join(getTempFolderPath(), fileName)

  // Save
  await workbook.xlsx.writeFile(exportPath)

  return {
    exportPath,
    fileName,
  }
}
