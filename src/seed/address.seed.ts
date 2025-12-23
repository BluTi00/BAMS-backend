import chalk from 'chalk'
import fs from 'fs'
import readline from 'readline-sync'
import Print from '../utils/print'
import path from 'path'
import { db } from '../db/db.server'
import { BadRequestError } from '../errors'

const args = process.argv.slice(2)

let field: string
if (args[0] === '-province') {
  field = 'province'
} else if (args[0] === '-district') {
  field = 'district'
} else if (args[0] === '-municipality') {
  field = 'municipality'
} else if (args[0] === '-ward') {
  field = 'ward'
} else {
  Print.error('Please enter a valid field')
  process.exit()
}

// Define a map of table names to their corresponding Prisma model properties
const tableModelMap = {
  province: db.province,
  district: db.district,
  municipality: db.municipality,
  ward: db.ward,
}

async function seedAddress() {
  try {
    const filePath = path.join(__dirname, 'addressDb', `${field}.sql`)
    // Check if data already exists in the table
    console.log(chalk.yellow(`Checking if ${field} table is already seeded...`))
    // const dataExists = await db[field].findMany({})

    // @ts-ignore
    const model = tableModelMap[field]
    if (!model) {
      throw new BadRequestError(`Model for table "${field}" not found`)
    }

    const dataExists = await model.findMany({})

    if (dataExists.length > 0) {
      if (
        !readline.keyInYN(
          chalk.red(
            `${field} already exist in the table. Do you want to replace it?`
          )
        )
      ) {
        console.log(chalk.yellow('Seed operation cancelled...'))
        return
      } else {
        // *Remove all rows from table
        console.log(chalk.yellow(`Deleting existing data in ${field} table...`))
        await db.ward.deleteMany()
        await db.municipality.deleteMany()
        await db.district.deleteMany()
        await db.province.deleteMany()
        // await model.deleteMany()
      }
    }

    const data = fs.readFileSync(filePath, 'utf8')
    console.log(chalk.green(`Seeding ${field} table...`))
    // await db.$executeRaw(data as unknown as Sql)
    await db.$executeRawUnsafe(data)

    console.log(chalk.green(`Seeding ${field} table successful...`))
  } catch (error) {
    console.log(chalk.red(`Error seeding ${field} table...`))
    console.log(chalk.red(error))
  } finally {
    process.exit(0)
  }
}

// Call the seed function
seedAddress()
