import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SPREADSHEET_PATH = path.join(__dirname, '..', 'Copy of Goldenium All-In-One V2.6.0.xlsx')

const workbook = XLSX.readFile(SPREADSHEET_PATH)

// Check the "Refining Focus - Fees" sheet for focus costs
const focusFeesSheet = workbook.Sheets['Refining Focus - Fees']
if (focusFeesSheet) {
  console.log('=== REFINING FOCUS - FEES SHEET ===')
  const data = XLSX.utils.sheet_to_json(focusFeesSheet, { header: 1 })
  data.slice(0, 60).forEach((row: any, index: number) => {
    if (row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
      console.log(`Row ${index}: ${JSON.stringify(row.filter((c: any) => c !== null && c !== undefined && c !== ''))}`)
    }
  })
}

console.log('\n\n')

// Check Focus & Fee sheet
const focusFeeSheet = workbook.Sheets['Focus & Fee']
if (focusFeeSheet) {
  console.log('=== FOCUS & FEE SHEET ===')
  const data = XLSX.utils.sheet_to_json(focusFeeSheet, { header: 1 })
  data.slice(0, 80).forEach((row: any, index: number) => {
    if (row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
      const filtered = row.filter((c: any) => c !== null && c !== undefined && c !== '')
      if (filtered.length > 0) {
        console.log(`Row ${index}: ${JSON.stringify(filtered)}`)
      }
    }
  })
}

console.log('\n\n')

// Check Backend Refining for detailed formulas
const backendRefiningSheet = workbook.Sheets['Backend Refining']
if (backendRefiningSheet) {
  console.log('=== BACKEND REFINING SHEET (First 80 rows) ===')
  const data = XLSX.utils.sheet_to_json(backendRefiningSheet, { header: 1 })
  data.slice(0, 80).forEach((row: any, index: number) => {
    if (row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
      const filtered = row.filter((c: any) => c !== null && c !== undefined && c !== '')
      if (filtered.length > 0) {
        console.log(`Row ${index}: ${JSON.stringify(filtered)}`)
      }
    }
  })
}

console.log('\n\n')

// Also check Refining Spec sheet for FCE values
const refiningSpecSheet = workbook.Sheets['Refining Spec']
if (refiningSpecSheet) {
  console.log('=== REFINING SPEC SHEET ===')
  const data = XLSX.utils.sheet_to_json(refiningSpecSheet, { header: 1 })
  data.slice(0, 40).forEach((row: any, index: number) => {
    if (row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')) {
      const filtered = row.filter((c: any) => c !== null && c !== undefined && c !== '')
      if (filtered.length > 0) {
        console.log(`Row ${index}: ${JSON.stringify(filtered)}`)
      }
    }
  })
}
