import path from 'path'
import { db } from '../db/db.server'
import { getTempFolderPath } from '../utils/path.utils'
import { BadRequestError } from '../errors'
import { APPLICATION_STATUS, Prisma } from '../generated/client/client'
import { constructExportAddress, getDistrict } from '../utils/helper'
import { includeAddress } from '../constants/constant'
import ExcelJS from 'exceljs'
import { ADToBS } from '../utils/dateFunction'

// Define the header row
const header = [
  {
    text: 'आवेदन दर्ता नम्बर',
    key: 'applicationCode',
  },
  {
    text: 'परियोजनाको नाम',
    key: 'firmCompanyIndustryNameNp',
    width: 40,
  },

  {
    text: 'परियोजनाको ठेगाना',
    key: 'officeAddress',
    width: 50,
  },

  {
    text: 'मुख्य प्रस्तावकको नाम',
    key: 'representativeName',
  },

  {
    text: 'सम्पर्क',
    key: 'representativeMobile',
  },

  {
    text: 'लिङ्ग',
    key: 'gender',
  },

  {
    text: 'प्रदेश',
    key: 'Province',
  },

  {
    text: 'प्रदेश',
    key: 'Province',
  },

  // {
  //   text: 'दर्ता मिति',
  //   key: 'registrationDate',
  // },
  // {
  //   text: 'दर्ता नम्बर',
  //   key: 'registrationNumber',
  // },
  // {
  //   text: 'सुरु दर्ता भएको निकाय',
  //   key: 'initialRegistrationOffice',
  // },

  {
    text: 'कार्यालय जिल्ला',
    key: 'officeDistrict',
  },
  {
    text: 'उद्यमी संख्या',
    key: 'entrepreneurProfileNumber',
  },

  {
    text: 'प्रतिनिधिको पद/दर्जा',
    key: 'representativeDesignation',
  },
  {
    text: 'कुल अनुमानित लागत रु.',
    key: 'totalEstimatedCost',
  },
  {
    text: 'हालसम्म भएको खर्च रु.',
    key: 'expenditureSoFar',
  },
  {
    text: 'कर्जा माग रु.',
    key: 'requestedLoanAmount',
  },
  {
    text: 'आवेदन स्थिति',
    key: 'status',
  },
  {
    text: 'कैफियत',
    key: 'remark',
    width: 50,
  },
  {
    text: 'कागजात',
    key: 'attachment',
    width: 50,
  },
]

const getStatusRowPosition = () => {
  const statusColumn = header.find((item) => item.key === 'status')
  return statusColumn ? header.indexOf(statusColumn) + 1 : 0
}

const getRemark = (status: string) => {
  if (status === APPLICATION_STATUS.INCOMPLETE) {
    return 'अनलाइन फारममा अधुरो देखिएको'
  }
  return ''
}

const getAttachmentRemark = (media: any) => {
  if (!media || media.length === 0) {
    return 'कुनै कागजात फेला परेन'
  }
  return ''
}

class DataOperationService {
  async exportApplication(filters: any) {
    // get all the projects
    const {
      status,
      provinceId,
      districtId,
      municipalityId,
      wardId,
      startupSectorId,
      attachment,
    } = filters

    // console.log(filters, 'filters')
    const whereClause: Prisma.ApplicationWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(provinceId && {
        officeAddress: {
          provinceId: provinceId,
        },
      }),
      ...(districtId && { officeAddress: { districtId } }),
      ...(municipalityId && { officeAddress: { municipalityId } }),
      ...(wardId && { officeAddress: { wardId } }),
      ...(startupSectorId && { projectIntroduction: { startupSectorId } }),
      ...(attachment === 'NO_ATTACHMENT' && {
        media: {
          none: {},
        },
      }),
      ...(attachment === 'WITH_ATTACHMENT' && {
        media: {
          some: {},
        },
      }),
    }

    const applications = await db.application.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            nameNp: true,
          },
        },
        officeAddress: includeAddress,
        entrepreneurProfile: {
          select: {
            id: true,
          },
        },
        projectIntroduction: {
          select: {
            totalEstimatedCost: true,
            expenditureSoFar: true,
          },
        },
        projectAnalysis: {
          select: {
            requestedLoanAmount: true,
          },
        },
        media: true,
      },
    })

    if (applications.length === 0) {
      throw new BadRequestError('Empty Application List')
    }

    // ensure the export directory exists
    const exportFolderPath = getTempFolderPath()
    const fileName = `Applications-${new Date().getTime()}.xlsx`

    // export the data to a file
    const exportPath = path.join(exportFolderPath, fileName)

    // =============== creating the data to be EXPORTED =====================
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Application List')

    worksheet.columns = header.map((item) => {
      // add background color to the header row
      return {
        header: item.text,
        width: item.width || 20,
      }
    })

    // Populate the data rows
    applications.forEach((application) => {
      worksheet.addRow([
        application.applicationCode,
        ADToBS(application.createdAt as unknown as string),
        application.firmCompanyIndustryNameNp ||
          application.firmCompanyIndustryName,
        application?.user?.nameNp || application?.user?.name,
        application.registrationDate,
        application.registrationNumber,
        application.initialRegistrationOffice,
        constructExportAddress(application.officeAddress, 'ne'),
        getDistrict(application.officeAddress, 'ne'),
        application.entrepreneurProfile?.length || 0,
        application?.representativeName,
        application?.representativeMobile,
        application.representativeDesignation,
        application.projectIntroduction
          ? application.projectIntroduction?.totalEstimatedCost
          : 0,
        application.projectIntroduction
          ? application.projectIntroduction?.expenditureSoFar
          : 0,
        application.projectAnalysis
          ? application.projectAnalysis?.requestedLoanAmount
          : 0,
        application.status,
        getRemark(application.status),
        getAttachmentRemark(application.media),
      ])
    })

    // WORKING CODE for Dropdown in Excel
    // Add data validation for the "आवेदन स्थिति" column

    const statusOptions = ['INCOMPLETE', 'REGISTERED', 'APPROVED', 'REJECTED']
    worksheet
      .getColumn(getStatusRowPosition())
      .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber !== 1) {
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${statusOptions.join(',')}"`],
            showErrorMessage: true,
            errorTitle: 'Invalid Selection',
            error: 'Please select a value from the dropdown.',
          }
        }
      })

    await workbook.xlsx.writeFile(exportPath)

    // send to frontend
    return { exportPath, fileName }
  }
}

export default DataOperationService
