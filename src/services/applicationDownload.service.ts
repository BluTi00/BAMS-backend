import { db } from '../db/db.server'
import { BadRequestError } from '../errors'
import fs from 'fs'
import {
  generateApplicationPdf,
  convertImageToPdf,
  convertImageToPdfPuppeteer,
} from '../utils/applicationPdfFn'
import {
  getMediaAbsolutePath,
  mergePdf,
  sortMediaFiles,
} from '../utils/pdf.utils'

class ApplicationDownloadService {
  async getPdfById({
    id,
    includeAttachment,
    enablePuppeteerCluster,
  }: {
    id: string
    includeAttachment?: boolean
    enablePuppeteerCluster?: boolean
  }): Promise<any> {
    if (!id) {
      throw new BadRequestError('Application ID is required.')
    }

    // --- GENERATE APPLICATION PDF ---
    const {
      pdf: applicationPdf,
      fileName,
      applicationCode,
    } = await generateApplicationPdf(id, enablePuppeteerCluster)

    // fs.writeFileSync('./applicationPdf.pdf', applicationPdf || '')

    if (!includeAttachment) {
      return {
        fileName,
        pdf: applicationPdf,
      }
    }

    // ==================
    // INCLUDE ATTACHMENTS
    // ==================

    // ----- PROCESS MEDIA FILES -----
    const media = await db.media.findMany({
      where: {
        applicationId: id,
      },
    })

    const sortedMediaFiles = await sortMediaFiles(media)

    // ---- DOCUMENT TO PDF ----
    const pdfCollection: any = [applicationPdf]

    const imageMediaList = sortedMediaFiles.filter(
      (media) => media?.mimeType && media.mimeType.includes('image')
    )

    let imageMediaPdf
    try {
      imageMediaPdf = await convertImageToPdf(imageMediaList)
    } catch (error) {
      console.error('Error converting images to PDF:', error)
      // Fallback to Puppeteer method if the first method fails
      imageMediaPdf = await convertImageToPdfPuppeteer(imageMediaList)
    }

    // save image pdfs for testing
    // fs.writeFileSync('./imageMediaPdf.pdf', imageMediaPdf || '')

    if (imageMediaPdf) {
      pdfCollection.push(imageMediaPdf)
    }

    // ---- PDF DOCUMENT TO PDF ----
    const pdfMediaList = sortedMediaFiles.filter((media) => {
      return media?.mimeType && media.mimeType.includes('pdf')
    })

    const pdfMediaListBuffer = await Promise.all(
      pdfMediaList.map(async (media) => {
        if (!media?.url) return
        const mediaFilePath = getMediaAbsolutePath(media?.url)
        // check if the file exists
        if (!fs.existsSync(mediaFilePath)) {
          return
        }
        return fs.readFileSync(mediaFilePath)
      })
    )
    if (pdfMediaListBuffer && pdfMediaListBuffer.length > 0) {
      pdfCollection.push(...pdfMediaListBuffer)
    }

    // ---- MERGE ALL PDFS ----
    const mergedPdf = await mergePdf(pdfCollection, {
      applicationNo: applicationCode as string,
      showPageNumber: true,
    })

    const mergedPdfBuffer = Buffer.from(mergedPdf) // ✅ convert properly

    return {
      fileName,
      pdf: mergedPdfBuffer,
    }
  }
}

export default ApplicationDownloadService
