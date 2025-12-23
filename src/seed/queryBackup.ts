/* */
// const transferActivityLogToAuditLog = async () => {
//   console.log(`Transferring activity logs to audit logs... 🌱`)

//   const activityLogs = await db.activityLog.findMany({})

//   for (const log of activityLogs) {
//     try {
//       await db.auditLog.create({
//         data: {
//           model: log.model,
//           recordId: log.modelId,
//           action: log.action,
//           userId: log.userId,
//           changes: undefined,
//           duration: log.duration,
//           createdAt: log.createdAt,
//         },
//       })
//     } catch (error) {
//       console.error(`Failed to transfer activity log ID ${log.id}:`, error)
//     }
//   }
// }

/* */

// const assignApplicationCycleIdToApplication = async () => {
//   console.log(`Assigning application cycle IDs to applications... 🌱`)

//   const newApplicationCycle = await db.applicationCycle.create({
//     data: {
//       name: 'Default Application Cycle',
//       startDate: new Date('2024-08-27'),
//       endDate: new Date('2024-09-17'),
//     },
//   })

//   console.log(
//     `Created new application cycle with ID: ${newApplicationCycle.id}`
//   )

//   await db.application.updateMany({
//     data: {
//       applicationCycleId: newApplicationCycle?.id,
//     },
//   })
// }

/* */
// const changePasswordOfAllUsers = async () => {
//   console.log(`Changing password of all users... 🌱`)
//   const hashedPassword = await hashPassword(
//     process.env.SUPER_USER_PASSWORD || 'admin@123'
//   )

//   await db.user.updateMany({
//     where: { role: { not: ROLE.SUDO_ADMIN } },
//     data: { password: hashedPassword },
//   })
// }

/* */

// const newStartupSectorData = [
//   {
//     name: 'Agriculture, Forestry and Production Sector',
//     nameNp: 'कृषि, वन तथा उत्पादनमूलक क्षेत्र',
//   },
//   {
//     name: 'Information Technology and Digital Sector',
//     nameNp: 'सूचना प्रविधि तथा डिजिटल क्षेत्र',
//   },
//   {
//     name: 'Infrastructure and Transportation Sector',
//     nameNp: 'पूर्वाधार तथा यातायात क्षेत्र',
//   },
//   {
//     name: 'Social Service and Tourism Sector',
//     nameNp: 'सामाजिक सेवा र पर्यटन क्षेत्र',
//   },
//   {
//     name: 'Traditional and Local Resources Sector',
//     nameNp: 'परम्परागत तथा स्थानिरय स्रोत',
//   },
// ]

// const migrateStartupSectorToSubSector = async () => {
//   console.log(`Migrating startup sectors to sub-sectors... 🌱`)

//   const startupSectors = await db.startupSector.findMany()
//   for (const startupSector of startupSectors) {
//     const startupSubSector = await db.startupSubSector.create({
//       data: {
//         name: startupSector.name,
//         nameNp: startupSector.nameNp,
//       },
//     })

//     // update projectIntroduction to link to the new sub-sector
//     await db.projectIntroduction.updateMany({
//       where: {
//         startupSectorId: startupSector.id,
//       },
//       data: {
//         startupSubSectorId: startupSubSector.id,
//       },
//     })
//   }

//   // create new startup sectors
//   await db.startupSector.deleteMany({})

//   for (const sector of newStartupSectorData) {
//     await db.startupSector.create({
//       data: {
//         name: sector.name,
//         nameNp: sector.nameNp,
//       },
//     })
//   }

//   // link to the new sectors
//   const newStartupSectors = await db.startupSector.findMany()
//   const startupSubSectors = await db.startupSubSector.findMany()
//   const parentSectorIndex = [
//     0, 0, 0, 3, 1, 3, 3, 2, 2, 2, 4, 4, 1, 0, 1, 2, 4, 0, 1,
//   ]

//   let index = 0
//   for (const subSector of startupSubSectors) {
//     const newSector = newStartupSectors[parentSectorIndex[index]]

//     await db.startupSubSector.update({
//       where: { id: subSector.id },
//       data: {
//         startupSectorId: newSector.id,
//       },
//     })

//     // update projectIntroduction to link to the new sector
//     await db.projectIntroduction.updateMany({
//       where: {
//         startupSubSectorId: subSector.id,
//       },
//       data: {
//         startupSectorId: newSector.id,
//       },
//     })

//     index++
//   }
// }

/* */

// const updatedSubSectorNames = [
//   {
//     oldName:
//       'Enterprises related to research and development of mines and minerals',
//     name: 'Mining and Mineral Research and Development',
//     nameNp: 'खानी तथा खनिज अनुसन्धान तथा विकास',
//   },
//   {
//     oldName: 'Enterprises related to food technology and nutrition',
//     name: 'Food Technology and Nutrition',
//     nameNp: 'खाद्य प्रविधि तथा पोषण',
//   },
//   {
//     oldName:
//       'Enterprises based on science, technology, communication, and information technology',
//     name: 'Science, Communication and Information Technology',
//     nameNp: 'विज्ञान, प्रविधि, सञ्‍चार तथा सूचना प्रविधि',
//   },
//   {
//     oldName:
//       'Enterprises related to activities that help make household or daily life simpler, easier, and safer',
//     name: 'Home and Daily Life Simplification Technology',
//     nameNp: 'घरायसी वा दैनिक जीवन सरलीकरण प्रविधि',
//   },
//   {
//     oldName:
//       'Enterprises related to convenient and safe transportation and transit services',
//     name: 'Safe and Efficient Transportation and Logistics',
//     nameNp: 'सहज र सुरक्षित परिवाहन तथा लजिष्टिक',
//   },
//   {
//     oldName: 'Enterprises related to infrastructure construction work',
//     name: 'Infrastructure Construction Works',
//     nameNp: 'पूर्वाधार निर्माण कार्य',
//   },
//   {
//     oldName: 'Enterprises related to electric vehicles and automobiles',
//     name: 'Electric Vehicles and Automobiles',
//     nameNp: 'विद्युतीय सवारी साधन तथा अटोमोबाइल',
//   },
//   {
//     oldName: 'Enterprise based on local resources and means',
//     name: 'Local Resource-Based Enterprises',
//     nameNp: 'स्थानीय स्रोत/साधनमा आधारित उद्यम',
//   },
// ]

// const updateSubSectorNames = async () => {
//   console.log(`Updating sub-sector names... 🌱`)

//   for (const item of updatedSubSectorNames) {
//     const subSector = await db.startupSubSector.findFirst({
//       where: { name: item.oldName },
//     })

//     if (!subSector) continue

//     await db.startupSubSector.update({
//       where: { id: subSector?.id },
//       data: {
//         name: item.name,
//         nameNp: item.nameNp,
//       },
//     })
//   }
// }

/* */
// const migrateFinancialData = async () => {
//   console.log(`Migrating financial data... 🌱`)

//   const projectIntroductions = await db.projectIntroduction.findMany()

//   for (const project of projectIntroductions) {
//     const totalEstimatedCost = project.totalEstimatedCost ?? null
//     const expenditureSoFar = project.expenditureSoFar ?? null

//     // check if financial data already exists
//     const financialAnalysis = await db.financialAnalysis.findFirst({
//       where: {
//         applicationId: project.applicationId,
//       },
//     })

//     if (financialAnalysis) continue

//     await db.financialAnalysis.create({
//       data: {
//         applicationId: project.applicationId!,
//         totalEstimatedCostOfProject: totalEstimatedCost,
//         totalCostIncurredInProjectSoFar: expenditureSoFar,
//       },
//     })
//   }
// }

/* */
// const migrateTempProposerToTable = async () => {
//   console.log(`Migrating temp proposer data to proposer table... 🌱`)
//   const applications = await db.application.findMany({
//     include: {
//       media: includeMedia,
//     },
//   })

//   let count = 0
//   let mediaCount = 0
//   for (const application of applications) {
//     //
//     const isProposerExists = await db.proposer.findFirst({
//       where: { applicationId: application.id },
//     })
//     if (isProposerExists) continue

//     const { proposerName, proposedDate, phoneNumber, email } =
//       (application?.tempProposer || {}) as any

//     const newProposer = await db.proposer.create({
//       data: {
//         name: proposerName || '',
//         proposedDate: proposedDate,
//         phone: phoneNumber || '',
//         email: email || '',
//         applicationId: application.id,
//       },
//     })
//     count++

//     // link media to proposer
//     const medias = (application.media || [])?.filter((media) =>
//       ['SIGNATURE', 'PROJECT_STAMP'].includes(media.mediaType as any)
//     )

//     for (const media of medias) {
//       await db.media.update({
//         where: { id: media.id },
//         data: {
//           proposerId: newProposer.id,
//           applicationId: null,
//         },
//       })
//       mediaCount++
//     }
//   }

//   console.log(`Migrated proposer data for ${count} applications.`)
//   console.log(`Re-linked ${mediaCount} media items to proposers.`)
// }

/* */

// const updateMediaUrls = async () => {
//   // --- CHANGE THE MEDIA URL FROM LIVE TO LOCAL HOST ------
//   // https://sams.iedi.gov.np/media/test_result/8bab253d-8aa1-420b-9130-eef4b444d59c/1757061719017-574973195.pdf
//   // http://localhost:5003/resource/a2064bac-c963-4c61-b95b-37a9ee7ecc0e/1755262110732-644171145.xlsx
//   console.log(`Changing media URL to new URL... 🌱`)
//   const oldUrl = 'https://sams.iedi.gov.np/media'
//   const newUrl = 'http://localhost:5003'

//   // Media
//   const medias = await db.media.findMany({
//     where: {
//       url: {
//         contains: oldUrl,
//       },
//     },
//   })

//   for (const media of medias) {
//     const replacedUrl = media?.url?.replace(oldUrl, newUrl)

//     await db.media.update({
//       where: { id: media.id },
//       data: { url: replacedUrl },
//     })
//   }
// }

/* */
// const seedDocumentSetup = async () => {
//   console.log(`Seeding document setup data... 🌱`)

//   await db.documentSetup.deleteMany()

//   for (const document of documentSetupData) {
//     await db.documentSetup.create({
//       data: {
//         name: document.name,
//         nameNp: document.nameNp,
//         mediaType: document.mediaType,
//         acceptedExtensions: document.acceptedExtensions,
//         isRequired: document.isRequired ?? true,
//         isActive: document.isActive ?? true,
//       },
//     })
//   }
// }

/* */
// const seedCodeCounter = async () => {
//   console.log('🌱 Seeding CodeCounter data...')

//   const cycles = await db.applicationCycle.findMany({
//     where: { deletedAt: null },
//     select: { id: true },
//   })

//   for (const cycle of cycles) {
//     // Compute current max value of A-codes for that cycle
//     const latestApp = await db.application.findFirst({
//       where: {
//         applicationCycleId: cycle.id,
//         applicationCode: { startsWith: 'A-' },
//       },
//       orderBy: { createdAt: 'desc' }, // get the latest created application
//       select: { applicationCode: true },
//     })

//     const currentValue =
//       latestApp && latestApp.applicationCode
//         ? parseInt(latestApp.applicationCode.split('-')[1])
//         : 0

//     await db.codeCounter.upsert({
//       where: {
//         prefix_applicationCycleId: {
//           prefix: 'A',
//           applicationCycleId: cycle.id,
//         },
//       },
//       create: {
//         prefix: 'A',
//         applicationCycleId: cycle.id,
//         lastValue: currentValue,
//       },
//       update: {
//         lastValue: currentValue,
//       },
//     })
//   }

//   console.log('✅ CodeCounter seeding complete.')
// }

/* */
// const applicationCycleService = new ApplicationCycleService()
// const fetchRepeatApplicationCode = async () => {
//   const { applicationCycle } = await applicationCycleService.getLatest()

//   // display all applications with application codes that are repeated and count > 2
//   const repeatedApplications = await db.application.groupBy({
//     where: {
//       applicationCycleId: applicationCycle?.id,
//       deletedAt: null,
//     },
//     by: ['applicationCode'],
//     _count: {
//       applicationCode: true,
//     },
//     having: {
//       applicationCode: {
//         not: null,
//       },
//     },
//   })

//   const filteredApplications = repeatedApplications.filter(
//     (app) => app._count.applicationCode > 1
//   )

//   console.log('Repeated Application Codes:')
//   for (const app of filteredApplications) {
//     console.log(
//       `Application Code: ${app.applicationCode}, Count: ${app?._count?.applicationCode}`
//     )
//   }
// }

/* */
// const removeDeletedApplication = async () => {
//   console.log('🌱 Removing deleted applications...')

//   await db.application.deleteMany({
//     where: {
//       deletedAt: { not: null },
//     },
//   })

//   console.log('✅ Deleted applications removed.')
// }

/* */
// const createApplicationJSONData = async () => {
//   const sampleApplicationCodes = [
//     'A-08170',
//     'A-08162',
//     'A-08160',
//     'A-08157',
//     'A-08153',
//   ]

//   console.log('🌱 Creating application JSON data...')

//   for (const code of sampleApplicationCodes) {
//     const application = await db.application.findFirst({
//       where: { applicationCode: code },
//       select: {
//         applicationCode: true,
//         firmCompanyIndustryName: true,
//         firmCompanyIndustryNameNp: true,
//         entrepreneurProfile: {
//           select: {
//             name: true,
//             gender: true,
//             isMainEntrepreneur: true,
//             educationalQualification: true,
//             training: true,
//             experience: true,
//           },
//         },
//         productUsage: {
//           select: {
//             productOrServiceName: true,
//             productOrServiceNature: true,
//             targetCustomerAndMarket: true,
//             mainFeaturesOfProductOrService: true,
//             specialUtilityOfProductOrService: true,
//             sourceOfRawMaterials: true,
//           },
//         },
//         projectIntroduction: {
//           select: {
//             projectIntroduction: true,
//             projectObjective: true,
//             startupSector: {
//               select: {
//                 name: true,
//                 nameNp: true,
//               },
//             },
//             startupSubSector: {
//               select: {
//                 name: true,
//                 nameNp: true,
//               },
//             },
//           },
//         },
//         projectAnalysis: {
//           select: {
//             requestedLoanAmount: true,
//             innovativeWork: true,
//             innovativeWorkDescription: true,
//             nextYearEstimatedJobCreation: true,
//             productMarket: true,
//             rawMaterialSource: true,
//             entrepreneurialExperience: true,
//           },
//         },
//         riskImpactAnalysis: {
//           select: {
//             riskFactor: true,
//             riskMitigationPlan: true,
//           },
//         },
//         swotAnalysis: {
//           select: {
//             strength: true,
//             weakness: true,
//             opportunity: true,
//             threat: true,
//           },
//         },
//         financialAnalysis: {
//           select: {
//             enterpriseAndWorkforceInsurance: true,
//           },
//         },
//         workPlan: {
//           select: {
//             activity: true,
//             time: true,
//             budget: true,
//             expectedOutcome: true,
//             risk: true,
//             remarks: true,
//           },
//         },
//       },
//     })

//     if (!application) {
//       console.log(`Application with code ${code} not found.`)
//       continue
//     }

//     const prompt = generatePrompt(application)

//     fs.writeFileSync(
//       `./extra/chatGptPrompt-${application?.applicationCode}.txt`,
//       prompt
//     )
//   }
// }

/* */
// const addWard = async () => {
//   console.log('🌱 Adding new ward...')

//   await db.ward.create({
//     data: {
//       id: 6731,
//       municipalityId: 177,
//       wardNumber: 5,
//       wardNumberNepali: '५',
//       hlcit_code: null,
//     },
//   })

//   console.log('✅ New ward added.')
// }

/* */
// const evaluateApplication = async () => {
//   const applicationCode = 'A-08170'

//   const application = await db.application.findFirst({
//     where: { applicationCode: applicationCode },
//     select: {
//       applicationCode: true,
//       firmCompanyIndustryName: true,
//       firmCompanyIndustryNameNp: true,
//       entrepreneurProfile: {
//         select: {
//           name: true,
//           gender: true,
//           isMainEntrepreneur: true,
//           educationalQualification: true,
//           training: true,
//           experience: true,
//         },
//       },
//       productUsage: {
//         select: {
//           productOrServiceName: true,
//           productOrServiceNature: true,
//           targetCustomerAndMarket: true,
//           mainFeaturesOfProductOrService: true,
//           specialUtilityOfProductOrService: true,
//           sourceOfRawMaterials: true,
//         },
//       },
//       projectIntroduction: {
//         select: {
//           projectIntroduction: true,
//           projectObjective: true,
//           startupSector: {
//             select: {
//               name: true,
//               nameNp: true,
//             },
//           },
//           startupSubSector: {
//             select: {
//               name: true,
//               nameNp: true,
//             },
//           },
//         },
//       },
//       projectAnalysis: {
//         select: {
//           requestedLoanAmount: true,
//           innovativeWork: true,
//           innovativeWorkDescription: true,
//           nextYearEstimatedJobCreation: true,
//           productMarket: true,
//           rawMaterialSource: true,
//           entrepreneurialExperience: true,
//         },
//       },
//       riskImpactAnalysis: {
//         select: {
//           riskFactor: true,
//           riskMitigationPlan: true,
//         },
//       },
//       swotAnalysis: {
//         select: {
//           strength: true,
//           weakness: true,
//           opportunity: true,
//           threat: true,
//         },
//       },
//       financialAnalysis: {
//         select: {
//           enterpriseAndWorkforceInsurance: true,
//         },
//       },
//       workPlan: {
//         select: {
//           activity: true,
//           time: true,
//           budget: true,
//           expectedOutcome: true,
//           risk: true,
//           remarks: true,
//         },
//       },
//     },
//   })

//   if (!application) {
//     console.log(`Application with code ${applicationCode} not found.`)
//   }

//   const aiText = await evaluateAppByOpenAI(application)
//   console.log(aiText, '--- AI RESULT ---')

//   fs.writeFileSync(
//     `./extra/aiResult-${application?.applicationCode}.json`,
//     aiText
//   )
// }

/* */
// const normalizeApplicationList = async () => {
//   console.log('Normalizing application list... 🌱')

//   // const filePath = './extra/applicationList.xlsx'
//   const filePath = './extra/list3.xlsx'

//   // =========== CONVERTING EXCEL FILE TO JSON =========
//   const workbook = XLSX.readFile(filePath)
//   const applicationListSheet = workbook.Sheets['Application List']

//   const applicationsExcelDataJSON = XLSX.utils.sheet_to_json(
//     applicationListSheet,
//     {
//       raw: true,
//     }
//   ) as any

//   // Fetch address data from the database
//   const provinces = await db.province.findMany()
//   const districts = await db.district.findMany()
//   const municipalities = await db.municipality.findMany()

//   const getProvinceNepaliName = (provinceTitle: string) => {
//     const province = provinces.find((p) => p.provinceTitle === provinceTitle)
//     return province ? province.provinceTitleNepali : ''
//   }

//   const getDistrictNepaliName = (districtTitle: string) => {
//     const district = districts.find((d) => d.districtTitle === districtTitle)
//     return district ? district.districtTitleNepali : ''
//   }

//   const getMunicipality = (municipalityTitle: string) => {
//     const municipality = municipalities.find(
//       (m) => m.municipalityTitle === municipalityTitle
//     )
//     return municipality
//   }

//   const rowData = []

//   for (const singleDataJson of applicationsExcelDataJSON) {
//     const values = Object.values(singleDataJson)

//     const provinceNepaliName = getProvinceNepaliName(values[2] as string)
//     const districtNepaliName = getDistrictNepaliName(values[3] as string)
//     const municipality = getMunicipality(values[4] as string)
//     const municipalityNepaliName = municipality
//       ? municipality?.municipalityTitleNepali
//       : ''

//     const abbreviatedMunicipalityName = municipalityNepaliName
//       .replace('गाउँपालिका', 'गा.पा.')
//       .replace('उपमहानगरपालिका', 'उ.म.न.पा.')
//       .replace('महानगरपालिका', 'म.न.पा.')
//       .replace('नगरपालिका', 'न.पा.')

//     const ward = convertText(values[5] as string, 'ne')

//     const address = `${abbreviatedMunicipalityName} ${ward}, ${districtNepaliName}`

//     const singleRowData = {
//       regNum: values[0],
//       projectName: values[1],
//       projectAddress: address,
//       entrepreneurName: values[6],
//       contact: convertText(values[7] as string, 'ne'),
//       gender: values[8],
//       province: provinceNepaliName,
//       district: districtNepaliName,
//       startupSector: values[9],
//       pan: convertText(values[10] as string, 'ne'),
//     }

//     rowData.push(singleRowData)
//   }

//   // console.log(rowData)

//   // Create excel file from JSON data
//   const workbookOutput = new ExcelJS.Workbook()
//   const excelSheet = workbookOutput.addWorksheet('Sheet1')

//   // header row
//   excelSheet.addRow([
//     'दर्ता नं',
//     'परियोजनाको नाम',
//     'परियोजनाको ठेगाना',
//     'मुख्य प्रस्तावकको नाम',
//     'सम्पर्क',
//     'लिङ्ग',
//     'प्रदेश',
//     'जिल्ला',
//     'क्षेत्र',
//     'पान नं',
//   ])

//   for (const row of rowData) {
//     excelSheet.addRow(Object.values(row))
//   }

//   // Highlight the first row as header
//   excelSheet.getRow(1).eachCell((cell) => {
//     cell.font = { bold: true }
//     cell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFCCCCCC' }, // Light gray background
//     }
//     cell.alignment = { horizontal: 'center' }
//   })

//   // const exportPath = path.join(getTempFolderPath(), fileName)
//   await workbookOutput.xlsx.writeFile('./extra/list-normalized-3.xlsx')

//   return 'Participant data uploaded successfully.'
// }

/* */
// const extractJsonDataFromApplications = async () => {
//   const latestCycle = await db.applicationCycle.findFirst({
//     where: {
//       isDisabled: false,
//     },
//     orderBy: {
//       endDate: 'desc',
//     },
//   })

//   if (!latestCycle) {
//     throw new BadRequestError('No application cycle found')
//   }

//   const applications = await db.application.findMany({
//     where: {
//       applicationCycleId: latestCycle.id,
//     },
//     orderBy: {
//       applicationCode: 'asc',
//     },
//     select: {
//       applicationCode: true,
//       firmCompanyIndustryName: true,
//       firmCompanyIndustryNameNp: true,
//     },
//   })

//   const jsonData = applications.map((app) => ({
//     applicationCode: app.applicationCode,
//     firmCompanyIndustryName: app.firmCompanyIndustryName,
//     firmCompanyIndustryNameNp: app.firmCompanyIndustryNameNp,
//   }))

//   fs.writeFileSync(
//     `./extra/applications-data.json`,
//     JSON.stringify(jsonData, null, 2)
//   )
// }

/* */
// const normalizationEnqueue = async () => {
//   console.log('Enqueuing normalization jobs... 🌱')
//   // just enqueue 5 jobs for testing
//   const totalRecords = applicationRawData.length
//   const perBatch = 40
//   const totalBatches = Math.ceil(totalRecords / perBatch)

//   // first obliterate existing jobs in the queue
//   await normalizationQueue.obliterate({ force: true })

//   // enqueue jobs
//   for (let batchNumber = 0; batchNumber < totalBatches; batchNumber++) {
//     await normalizationQueue.add(
//       'normalizationQueue',
//       { batchNumber },
//       { attempts: 1 } // optional retry
//     )
//     console.log(`Enqueued batch #${batchNumber}`)
//   }

//   console.log(`✨ Enqueued ${totalBatches} batches.`)
//   return
// }

/* */
// const updateCleanedApplicationData = async () => {
//   console.log('Updating cleaned application data... 🌱')

//   const latestCycle = await db.applicationCycle.findFirst({
//     where: {
//       isDisabled: false,
//     },
//     orderBy: {
//       endDate: 'desc',
//     },
//   })

//   if (!latestCycle) {
//     throw new BadRequestError('No application cycle found')
//   }

//   const applications = await db.application.findMany({
//     where: {
//       applicationCycleId: latestCycle.id,
//     },
//     select: {
//       id: true,
//       applicationCode: true,
//     },
//   })

//   for (const seedData of applicationNormalizedData) {
//     const application = applications.find(
//       (app) => app.applicationCode === seedData.applicationCode
//     )

//     if (!application) {
//       console.log(
//         `Application with code ${seedData.applicationCode} not found. Skipping...`
//       )
//       continue
//     }

//     await db.application.update({
//       where: {
//         id: application!.id,
//       },
//       data: {
//         cleanedFirmNepaliName: seedData.translatedFirmName,
//       },
//     })
//   }

//   console.log('✨ Updated cleaned application data.')
// }

/* */
// const seedApplicationForReTranslation = async () => {
//   console.log('Seeding applications for re-translation... 🌱')

//   const latestCycle = await db.applicationCycle.findFirst({
//     where: {
//       isDisabled: false,
//     },
//     orderBy: {
//       endDate: 'desc',
//     },
//   })

//   if (!latestCycle) {
//     throw new BadRequestError('No application cycle found')
//   }

//   for (const data of reTranslationData) {
//     const application = await db.application.findFirst({
//       where: {
//         applicationCode: data.applicationCode,
//         applicationCycleId: latestCycle.id,
//       },
//       select: { id: true },
//     })

//     await db.application.update({
//       where: { id: application!.id },
//       data: {
//         cleanedFirmNepaliName: data.translatedFirmName,
//       },
//     })
//   }
// }

/* */
// const dumpApplicationData = async () => {
//   console.log('Dumping application data... 🌱')

//   const latestCycle = await db.applicationCycle.findFirst({
//     where: {
//       isDisabled: false,
//     },
//     orderBy: {
//       endDate: 'desc',
//     },
//   })

//   if (!latestCycle) {
//     throw new BadRequestError('No application cycle found')
//   }

//   const applications = await db.application.findMany({
//     where: {
//       applicationCycleId: latestCycle.id,
//     },
//     select: {
//       applicationCode: true,
//       firmCompanyIndustryName: true,
//       cleanedFirmNepaliName: true,
//       firmCompanyIndustryNameNp: true,
//     },
//   })

//   const formedData = applications.map((app) => ({
//     applicationCode: app.applicationCode,
//     firmCompanyIndustryName: app.firmCompanyIndustryName,
//     translatedFirmName: app.cleanedFirmNepaliName,
//     firmCompanyIndustryNameNp: app.firmCompanyIndustryNameNp,
//   }))

//   fs.writeFileSync(
//     `./extra/application-dump.json`,
//     JSON.stringify(formedData, null, 2)
//   )
// }

/* */
// const normalizeOfflineApplicationList = async () => {
//   console.log('Normalizing application list... 🌱')

//   // const filePath = './extra/applicationList.xlsx'
//   const filePath = './extra/Offline-Applications.xlsx'

//   // =========== CONVERTING EXCEL FILE TO JSON =========
//   const workbook = XLSX.readFile(filePath)
//   const applicationListSheet = workbook.Sheets['Applications']

//   const applicationsExcelDataJSON = XLSX.utils.sheet_to_json(
//     applicationListSheet,
//     {
//       raw: true,
//     }
//   ) as any

//   // Fetch address data from the database
//   const provinces = await db.province.findMany()
//   const districts = await db.district.findMany()

//   const getProvinceNepaliName = (provinceTitle: string) => {
//     // if province title is in english then convert it in nepali else return as is
//     if (/^[A-Za-z\s]+$/.test(provinceTitle)) {
//       const province = provinces.find((p) => p.provinceTitle === provinceTitle)
//       return province ? province.provinceTitleNepali : ''
//     }

//     return provinceTitle
//   }

//   const getDistrictNepaliName = (districtTitle: string) => {
//     // if district title is in english then convert it in nepali else return as is
//     if (/^[A-Za-z\s]+$/.test(districtTitle)) {
//       const district = districts.find((d) => d.districtTitle === districtTitle)
//       return district ? district.districtTitleNepali : ''
//     }
//     return districtTitle
//   }

//   const rowData = []

//   for (const singleDataJson of applicationsExcelDataJSON) {
//     const values = Object.values(singleDataJson)

//     const singleRowData = {
//       regNum: values[0],
//       projectName: values[1],
//       projectAddress: values[2],
//       entrepreneurName: values[3],
//       contact: values[4],
//       gender: values[5],
//       province: getProvinceNepaliName(values[6] as string),
//       district: getDistrictNepaliName(values[7] as string),
//       startupSector: values[8],
//       pan: values[9],
//     }

//     rowData.push(singleRowData)
//   }

//   // console.log(rowData)

//   // Create excel file from JSON data
//   const workbookOutput = new ExcelJS.Workbook()
//   const excelSheet = workbookOutput.addWorksheet('Sheet1')

//   // header row
//   excelSheet.addRow([
//     'दर्ता नं',
//     'परियोजनाको नाम',
//     'परियोजनाको ठेगाना',
//     'मुख्य प्रस्तावकको नाम',
//     'सम्पर्क',
//     'लिङ्ग',
//     'प्रदेश',
//     'जिल्ला',
//     'क्षेत्र',
//     'पान नं',
//   ])

//   for (const row of rowData) {
//     excelSheet.addRow(Object.values(row))
//   }

//   // Highlight the first row as header
//   excelSheet.getRow(1).eachCell((cell) => {
//     cell.font = { bold: true }
//     cell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFCCCCCC' }, // Light gray background
//     }
//     cell.alignment = { horizontal: 'center' }
//   })

//   // const exportPath = path.join(getTempFolderPath(), fileName)
//   await workbookOutput.xlsx.writeFile('./extra/applications-normalized.xlsx')

//   return 'Participant data uploaded successfully.'
// }
