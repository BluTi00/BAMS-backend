import DotenvConfig from '../config/env.config'
import { BadRequestError } from '../errors'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { getUploadFolderPath } from './path.utils'
import path from 'path'
import fs from 'fs'
import axios from 'axios'

const isValidPDF = (buffer: any) => {
  if (!buffer || buffer.length < 5) return false
  const str = buffer.toString('utf8', 0, 1024) // read first 1KB
  return str.includes('%PDF')
}

export const mergePdf = async (
  pdfList: any[],
  options: { applicationNo?: string; showPageNumber?: boolean } = {}
): Promise<Uint8Array> => {
  const { applicationNo, showPageNumber } = options

  if (!pdfList?.length) throw new BadRequestError('No pdf to merge')

  const mergedPdf = await PDFDocument.create()
  let font = null
  let pageCount = 1
  let totalPageCount = 0

  if (showPageNumber || applicationNo) {
    const pageCounts = await Promise.all(
      pdfList.map(async (pdf) => {
        try {
          const doc = await PDFDocument.load(pdf)
          return doc.getPageCount()
        } catch (error) {
          return 0
        }
      })
    )

    totalPageCount = pageCounts.reduce((a, b) => a + b, 0)
    font = await mergedPdf.embedFont(StandardFonts.Helvetica)
  }

  for (const pdf of pdfList) {
    // check if pdf is valid
    if (!isValidPDF(pdf)) continue

    const pdfDoc = await PDFDocument.load(pdf)
    const copiedPages = await mergedPdf.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    )

    for (const page of copiedPages) {
      const { height } = page.getSize()

      if (applicationNo && font && pageCount !== 1) {
        page.drawText(`Application No. ${applicationNo}`, {
          x: 50,
          y: height - 25,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        })
      }

      if (showPageNumber && font) {
        page.drawText(`Page ${pageCount}/${totalPageCount}`, {
          x: 50,
          y: 25,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        })
      }

      mergedPdf.addPage(page)
      pageCount++
    }
  }

  return mergedPdf.save()
}

export const getMediaAbsolutePath = (url: string) => {
  if (!url) return ''
  // http://localhost:5002/raw_material_purchase_bill/46fa3ff3-d44e-4486-91d6-c4e59c744ff2/1729502719287-624942338.pdf

  // https://sams.iedi.gov.np/media/audit_report/4933ff69-4cce-404c-a9f0-85100f666502/1764065560415-609313278.pdf

  // extract only --> raw_material_purchase_bill/46fa3ff3-d44e-4486-91d6-c4e59c744ff2/1729502719287-624942338.pdf

  // const urlParts = url.split('/')
  // if (urlParts.length < 3) return ''
  // const relativePath = urlParts.slice(3).join('/')
  // return path.join(getUploadFolderPath(), relativePath)

  const baseUrl = process.env.BASE_URL?.replace(/\/+$/, '') // remove trailing slash
  if (!baseUrl) return ''

  // 1. Remove BASE_URL from the URL
  let cleaned = url.replace(baseUrl, '')

  // 2. Remove leading slashes
  cleaned = cleaned.replace(/^\/+/, '')

  // 3. If cleaned starts with "media/", remove that prefix
  // Only applies in production because BASE_URL for production is sams.iedi.gov.np
  if (process.env.NODE_ENV === 'PRODUCTION' && cleaned.startsWith('media/')) {
    cleaned = cleaned.replace(/^media\//, '')
  }

  // 4. Final absolute path
  return path.join(getUploadFolderPath(), cleaned)
}

export const getBase64Image = async (url: string) => {
  if (!url) {
    return ''
  }

  try {
    // if it's an internal domain, convert to local file path
    if (url.startsWith(DotenvConfig.BASE_URL)) {
      let relativePath = url.replace(DotenvConfig.BASE_URL, '') // e.g. /media/uploads/signature.png
      // remove /media only if it starts with it
      if (relativePath.startsWith('/media')) {
        relativePath = relativePath.replace('/media', '')
      }

      const localPath = path.join(getUploadFolderPath(), relativePath)

      if (fs.existsSync(localPath)) {
        return `data:image/png;base64,${fs.readFileSync(localPath).toString('base64')}`
      }
    }

    // if it's a generic http(s) external URL → fetch
    if (url.startsWith('http')) {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      return `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`
    }

    // if it's a direct local path
    if (fs.existsSync(url)) {
      return `data:image/png;base64,${fs.readFileSync(url).toString('base64')}`
    }

    return ''
  } catch (err) {
    console.error(`Failed to load image: ${url}`, err)
    return ''
  }
}

export const sortMediaFiles = async (mediaFiles: any[]) => {
  const sortingOrder = [
    'CITIZENSHIP_FRONT',
    'CITIZENSHIP_BACK',
    'DALIT_CERTIFICATE',
    'TRAINING_CERTIFICATE',
    'EDUCATIONAL_CERTIFICATE',
    'RECOMMENDATION_LETTER',
  ]

  return mediaFiles.sort((a, b) => {
    return sortingOrder.indexOf(a.mediaType) - sortingOrder.indexOf(b.mediaType)
  })
}
