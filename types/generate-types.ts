import fs from 'fs'
import path from 'path'

// Paths
const schemaPath = path.join(__dirname, '../prisma/schema.prisma')
const outputPath = path.join(__dirname, './prisma-types.ts')

// Read schema.prisma
const schema = fs.readFileSync(schemaPath, 'utf-8')

// 1️⃣ Parse enums
const enumRegex = /enum\s+(\w+)\s+\{([^}]+)\}/g
const enums: string[] = []
const enumNames: string[] = [] // keep names to reference in models

let match
while ((match = enumRegex.exec(schema)) !== null) {
  const enumName = match[1]
  enumNames.push(enumName)
  const values = match[2]
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
  const enumStr = `export enum ${enumName} {\n${values
    .map((v) => `  ${v} = '${v}'`)
    .join(',\n')}\n}`
  enums.push(enumStr)
}

// 2️⃣ Parse models (replace relations with any, but preserve enums)
const modelRegex = /model\s+(\w+)\s+\{([^}]+)\}/g
const models: string[] = []

while ((match = modelRegex.exec(schema)) !== null) {
  const modelName = match[1]
  const body = match[2]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('//')) // skip comments
    .filter((line) => !line.includes('@@map')) // skip model-level attributes
    .filter((line) => !line.includes('@@unique')) // skip unique constraints

  const fields = body.map((line) => {
    const [name, type, ...rest] = line.split(/\s+/)
    if (!name || !type) return ''

    let isOptional = type.endsWith('?') || line.includes('?')
    const isList = type.endsWith('[]') || line.includes('[]')
    let cleanType = type.replace('?', '').replace('[]', '')

    // Determine the TS type
    let tsType: string

    if (enumNames.includes(cleanType)) {
      // Use enum type
      tsType = cleanType
    } else if (
      rest.some((r) => r.includes('@relation')) ||
      (/^[A-Z]/.test(cleanType) &&
        !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json'].includes(
          cleanType
        ))
    ) {
      // relation/object type → any
      tsType = 'any'
      isOptional = true
    } else {
      switch (cleanType) {
        case 'String':
          tsType = 'string'
          break
        case 'Int':
        case 'Float':
          tsType = 'number'
          break
        case 'Boolean':
          tsType = 'boolean'
          isOptional = true
          break
        case 'DateTime':
          tsType = 'Date | string'
          break
        case 'Json':
          tsType = 'any'
          isOptional = true
          break
        default:
          tsType = 'any' // fallback
          isOptional = true
      }
    }

    const optionalFields = ['id', 'createdAt', 'updatedAt', 'deletedAt']

    if (optionalFields.includes(name)) {
      isOptional = true // make 'id' optional for creation
    }

    return `  ${name}${isOptional ? '?' : ''}: ${tsType}${isList ? '[]' : ''}`
  })

  const modelStr = `export interface I${modelName} {\n${fields.join('\n')}\n}`
  models.push(modelStr)
}

// Combine enums + models
const output = [...enums, ...models].join('\n\n')

// Write to frontend
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, output, 'utf-8')
console.log('✅ Frontend types generated at', outputPath)
