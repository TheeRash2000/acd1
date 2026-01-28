import XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SPREADSHEET_PATH = path.join(__dirname, '..', 'Copy of Goldenium All-In-One V2.6.0.xlsx')

// Read the workbook
const workbook = XLSX.readFile(SPREADSHEET_PATH)

// List all sheet names
console.log('=== SHEET NAMES ===')
console.log(workbook.SheetNames.join('\n'))
console.log('')

// Look for refining-related sheets
const refiningSheets = workbook.SheetNames.filter(name =>
  name.toLowerCase().includes('refin')
)

console.log('=== REFINING SHEETS ===')
console.log(refiningSheets.join('\n'))
console.log('')

// Extract data from each refining sheet
for (const sheetName of refiningSheets) {
  console.log(`\n=== ${sheetName} ===`)
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  // Print first 30 rows to understand structure
  data.slice(0, 30).forEach((row: any, index: number) => {
    if (row && row.length > 0) {
      console.log(`Row ${index}: ${JSON.stringify(row)}`)
    }
  })
}

// Also check Backend Refining sheet for formulas/data
const backendSheet = workbook.SheetNames.find(name =>
  name.toLowerCase().includes('backend') && name.toLowerCase().includes('refin')
)

if (backendSheet) {
  console.log(`\n=== ${backendSheet} (Full Data) ===`)
  const sheet = workbook.Sheets[backendSheet]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  // Print more rows for backend
  data.slice(0, 50).forEach((row: any, index: number) => {
    if (row && row.length > 0) {
      console.log(`Row ${index}: ${JSON.stringify(row)}`)
    }
  })
}
