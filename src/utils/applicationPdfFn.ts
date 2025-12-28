import { includeAddress, includeMedia } from '../constants/constant'
import { BadRequestError } from '../errors'
import { convertText, getNepaliAlphabet } from './digitConverter'
import { ADToBS } from './dateFunction'
import { readTemplate } from './helper'
import { db } from '../db/db.server'
import path from 'path'
import { getTemplateFolderPath } from './path.utils'
import puppeteer from 'puppeteer'
import { getMediaAbsolutePath } from './pdf.utils'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import { initPuppeteerCluster } from './puppeteerCluster'
import { MediaType } from '../constants/enum'
import { PROGRAM_TYPE } from '../generated/client/enums'

// Constants
const blankSpace = '____________'
const tickMark = '&#x2611;' // symbol -> ☑
const emptyBox = '&#9744;' // symbol -> ☐
// const crossMark = '&#x2612;' // symbol -> ☒
const bulletMark = '•'

export const generateApplicationPdf = async (
  applicationId: string,
  enablePuppeteerCluster: boolean = false
) => {
  const application = await db.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      address: includeAddress,
      applicationCycle: true,
      media: includeMedia,
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

  // --------- PREPARE DATA FOR TEMPLATE ---------

  const applicationRegistrationNumber = application.applicationCode || ''

  const applicationRegistrationDate =
    convertText(ADToBS(application.createdAt), 'ne') || ''

  // ------ COMPANY PROFILE SECTION -------
  const address = application.address as any

  const province = address?.province
    ? address.province?.provinceTitleNepali || ''
    : ''
  const district = address?.district
    ? address.district.districtTitleNepali || ''
    : ''

  const municipality = address?.municipality
    ? address.municipality.municipalityTitleNepali || ''
    : ''

  const officeWard = address?.ward ? address.ward.wardNumberNepali || '' : ''
  const officeLocality = address?.locality || ''

  const applicationFormData: any[] = [
    {
      title: '(क) आवेदकको विवरण:',
      isBulletPoint: true,
      sectionData: [
        {
          label: 'आवेदकको नाम',
          value: application?.applicantNameNp,
        },
        {
          label: '',
          group: [
            {
              label: 'ठेगाना: प्रदेश',
              value: province,
            },

            {
              label: 'जिल्ला',
              value: district,
            },
          ],
        },
        {
          label: '',
          group: [
            {
              label: ' गा.पा./न.पा./उ.म.न.पा./म.न.पा.',
              value: municipality,
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
              value: application?.telephone,
            },

            {
              label: 'इमेल',
              value: application?.email,
            },
          ],
        },
        {
          label: '',
          group: [
            {
              label: 'जन्म मिति',
              value: application?.dateOfBirth,
            },

            {
              label: 'शैक्षिक योग्यता',
              value: application?.educationQualification,
            },
          ],
        },

        {
          label: 'पेशा',
          value: application?.profession,
        },

        {
          label: 'बाबुको नाम',
          value: application?.fatherName,
        },

        {
          label: 'बाबुको पेशा',
          value: application?.fatherProfession,
        },

        {
          label: 'परम्परागत पेसा निरन्तरताको अवस्था',
          value: ' ',
        },

        {
          label: 'आधुनिक प्रविधिको प्रयोग',
          radioOptions: [
            {
              label: 'भएको',
              checked: application?.useOfModernTechnology,
            },
            {
              label: 'नभएको',
              checked: !application?.useOfModernTechnology,
            },
          ],
        },

        {
          label: 'उत्पादित वस्तु बिक्रीको सम्भावना',
          radioOptions: [
            {
              label: 'भएको',
              checked: application?.possibilityOfSellingProducedGoods,
            },
            {
              label: 'नभएको',
              checked: !application?.possibilityOfSellingProducedGoods,
            },
          ],
        },

        {
          label: 'कुनै संस्थाबाट पेसागत स्तरोन्नतिका लागि सहयोग',
          radioOptions: [
            {
              label: 'लिएको',
              checked: application?.institutionalUpgradeSupport,
            },
            {
              label: 'नलिएको',
              checked: !application?.institutionalUpgradeSupport,
            },
          ],
        },
      ],
    },
  ]

  // entrepreneurship development program content
  if (application.programType === PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT) {
    const entrepreneurshipActivities =
      await db.entrepreneurshipActivity.findMany({
        where: {
          application: {
            some: {
              id: application.id,
            },
          },
        },
      })

    applicationFormData.push({
      title: '(ख) विगतमा उद्यमशीलता सम्बन्धी तालिम / कार्यक्रममा समावेश भएको:',
      sectionData: [
        {
          label: '',
          value: application?.entrepreneurshipRelatedTraining
            ?.map((item: any, index) => {
              if (!item?.trainingName) return
              return /*html*/ `
           <p style="margin-left: 1rem">(${convertText(index + 1, 'ne')}) ${item?.trainingName}, ${item?.day} दिन </p>
          `
            })
            .join(''),
        },
        {
          label: 'कार्यक्रम',
          value: entrepreneurshipActivities
            ?.map(
              (item, index) => /*html*/ `
              <p style="margin-left: 1rem">(${getNepaliAlphabet(index)}) ${item?.nameNp} </p>
          `
            )
            .join(''),
        },
      ],
    })
  }

  // technology upgradation program content
  if (application.programType === PROGRAM_TYPE.TECHNOLOGY_UPGRADATION) {
    applicationFormData.push({
      title: '(ख) परम्परागत पेसा स्तरोन्नतिको लागि:',
      sectionData: [
        {
          label: '१. विद्यमान सञ्‍चालनमा रहेको पेसा',
          value: application?.existingOperatingProfession,
        },
        {
          label: '२. स्तरोन्नति गर्न चाहेको',
          value: application?.professionToBeUpgraded
            ?.map(
              (item: any, index) => /*html*/ `
           <p style="margin-left: 1rem">${convertText(index + 1, 'ne')}. ${item}</p>
          `
            )
            .join(''),
        },
        {
          label: '३. अनुमानित लागत रु.',
          value: application?.estimatedCost,
        },
      ],
    })
  }

  const applicationHtml = getSectionHtml({
    data: applicationFormData,
  })

  // ------ DOCUMENT SECTION ---------
  const documentList = application.media.map((media) => media.mediaType)

  const documentListHtml = getSectionHtml({
    data: [
      {
        title: '(ग) आवेदनको साथमा संलग्न गर्नुपर्ने कागजात:',
        isNpNumbering: true,
        sectionData: [
          {
            label: 'आवेदकको नेपाली नागरिकताको प्रमाणपत्रको प्रतिलिपि (अगाडि)',
            radioOptions: [
              {
                label: '',
                checked: documentList.includes(MediaType.CITIZENSHIP_FRONT),
              },
            ],
          },
          {
            label: 'आवेदकको नेपाली नागरिकताको प्रमाणपत्रको प्रतिलिपि (पछाडि)',
            radioOptions: [
              {
                label: '',
                checked: documentList.includes(MediaType.CITIZENSHIP_BACK),
              },
            ],
          },

          {
            label:
              'राष्ट्रिय दलित आयोग वा सम्बन्धित जिल्ला प्रशासन कार्यालयबाट दलित प्रमाणित कागजातको प्रतिलिपि (यदि थर/जात नखुलेमा)',
            radioOptions: [
              {
                label: '',
                checked: documentList.includes(MediaType.DALIT_CERTIFICATE),
              },
            ],
          },

          ...(application.programType === PROGRAM_TYPE.TECHNOLOGY_UPGRADATION
            ? [
                {
                  label:
                    'उद्यमशीलता विकास वा सीपमुलक तालिमको प्रमाणपत्रको प्रतिलिपि (यदि भएमा)',
                  radioOptions: [
                    {
                      label: '',
                      checked: documentList.includes(
                        MediaType.TRAINING_CERTIFICATE
                      ),
                    },
                  ],
                },
              ]
            : []),

          {
            label: 'शैक्षिक योग्यताको प्रमाण-पत्रको प्रतिलिपि (यदि भएमा)',
            radioOptions: [
              {
                label: '',
                checked: documentList.includes(
                  MediaType.EDUCATIONAL_CERTIFICATE
                ),
              },
            ],
          },
          {
            label:
              'परम्परागत पेसामा आबद्ध रहेको व्यहोरा खुल्ने सम्बन्धित वडा कार्यालयको सिफारिस पत्र',
            radioOptions: [
              {
                label: '',
                checked: documentList.includes(MediaType.RECOMMENDATION_LETTER),
              },
            ],
          },
        ],
      },
    ],
  })

  // -------- GENERATE PDF FROM TEMPLATE ---------
  const filePath = path.join(getTemplateFolderPath(), 'applicationForm.html')
  const template = await readTemplate(filePath)

  const scheduleNum =
    application.programType === PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT
      ? '१'
      : '३'

  const formTitle =
    application.programType === PROGRAM_TYPE.ENTREPRENEURSHIP_DEVELOPMENT
      ? 'उद्यमशीलता सम्बन्धी तालिमका लागि आवेदन फारम'
      : 'प्रविधि स्तरोन्नतिका लागि आवेदन फारम'

  // Replace placeholders with actual data
  const filledTemplate = template
    .replace('{{scheduleNum}}', scheduleNum)
    .replace('{{formTitle}}', formTitle)
    .replace('{{applicationRegistrationNumber}}', applicationRegistrationNumber)
    .replace('{{applicationRegistrationDate}}', applicationRegistrationDate)
    .replace('{{applicationHtml}}', applicationHtml)
    .replace('{{documentListHtml}}', documentListHtml)

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
    <div class="bold">${title}</div>
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
