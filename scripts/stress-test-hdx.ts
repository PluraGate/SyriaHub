/**
 * HDX Stress Test Script
 * 
 * Tests the platform's ability to handle real-world humanitarian data
 * by fetching and processing a large dataset from HDX.
 * 
 * Usage: npx tsx scripts/stress-test-hdx.ts
 */

const HDX_API_BASE = 'https://data.humdata.org/api/3/action'

interface HdxResource {
    id: string
    name: string
    format: string
    url: string
    size?: number
}

interface HdxPackage {
    id: string
    name: string
    title: string
    num_resources: number
    resources: HdxResource[]
}

interface TestResult {
    phase: string
    duration: number
    recordCount?: number
    memoryUsed?: number
}

const results: TestResult[] = []

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
}

async function fetchWithTiming<T>(url: string, phase: string): Promise<{ data: T; duration: number }> {
    const start = performance.now()
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json() as T
    const duration = performance.now() - start
    return { data, duration }
}

async function findAllCsvResources(): Promise<HdxResource[]> {
    console.log('\n📊 Searching for Syria datasets on HDX...')

    const { data, duration } = await fetchWithTiming<{ result: { results: HdxPackage[] } }>(
        `${HDX_API_BASE}/package_search?q=syria+humanitarian&rows=20`,
        'Search HDX'
    )

    results.push({ phase: 'HDX API Search', duration })
    console.log(`   Found ${data.result.results.length} packages (${formatDuration(duration)})`)

    // Collect all CSV resources
    const csvResources: HdxResource[] = []

    for (const pkg of data.result.results) {
        for (const resource of pkg.resources) {
            if (resource.format?.toLowerCase() === 'csv' && resource.url) {
                csvResources.push(resource)
            }
        }
    }

    console.log(`   Collected ${csvResources.length} CSV resources to try`)
    return csvResources
}

async function fetchAndParseCsv(url: string): Promise<string[][]> {
    console.log('\n🔄 Fetching CSV data...')
    const start = performance.now()

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()
    const fetchDuration = performance.now() - start
    results.push({ phase: 'Fetch CSV', duration: fetchDuration })
    console.log(`   Downloaded ${formatBytes(text.length)} (${formatDuration(fetchDuration)})`)

    // Parse CSV
    console.log('\n⚙️ Parsing CSV...')
    const parseStart = performance.now()

    const lines = text.split('\n').filter(line => line.trim())
    const rows = lines.map(line => {
        // Simple CSV parsing (handles quoted fields)
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (const char of line) {
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        result.push(current.trim())
        return result
    })

    const parseDuration = performance.now() - parseStart
    results.push({ phase: 'Parse CSV', duration: parseDuration, recordCount: rows.length - 1 })
    console.log(`   Parsed ${rows.length - 1} records (${formatDuration(parseDuration)})`)

    return rows
}

function processRecords(rows: string[][]): void {
    console.log('\n🧪 Processing records (simulating platform operations)...')
    const start = performance.now()

    const headers = rows[0]
    const records = rows.slice(1)

    // Simulate typical processing operations
    let processed = 0
    const uniqueValues: Map<string, Set<string>> = new Map()

    for (const record of records) {
        // Simulate field validation
        for (let i = 0; i < record.length; i++) {
            const header = headers[i] || `col_${i}`
            if (!uniqueValues.has(header)) {
                uniqueValues.set(header, new Set())
            }
            uniqueValues.get(header)!.add(record[i])
        }
        processed++
    }

    const processDuration = performance.now() - start
    const memUsed = process.memoryUsage().heapUsed

    results.push({
        phase: 'Process Records',
        duration: processDuration,
        recordCount: processed,
        memoryUsed: memUsed
    })

    console.log(`   Processed ${processed} records (${formatDuration(processDuration)})`)
    console.log(`   Found ${uniqueValues.size} unique columns`)
    console.log(`   Memory used: ${formatBytes(memUsed)}`)
}

function printSummary(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📈 STRESS TEST SUMMARY')
    console.log('='.repeat(60))

    let totalDuration = 0
    for (const result of results) {
        totalDuration += result.duration
        console.log(`\n${result.phase}:`)
        console.log(`   Duration: ${formatDuration(result.duration)}`)
        if (result.recordCount !== undefined) {
            console.log(`   Records: ${result.recordCount}`)
        }
        if (result.memoryUsed !== undefined) {
            console.log(`   Memory: ${formatBytes(result.memoryUsed)}`)
        }
    }

    console.log('\n' + '-'.repeat(60))
    console.log(`TOTAL TIME: ${formatDuration(totalDuration)}`)

    // Pass/Fail criteria
    const recordCount = results.find(r => r.phase === 'Parse CSV')?.recordCount || 0
    const passed = totalDuration < 30000 && recordCount > 100

    console.log('\n' + (passed ? '✅ PASS' : '❌ FAIL'))
    console.log(`   Target: <30s for 100+ records`)
    console.log(`   Actual: ${formatDuration(totalDuration)} for ${recordCount} records`)
}

async function main(): Promise<void> {
    console.log('='.repeat(60))
    console.log('🚀 HDX REAL-WORLD DATA STRESS TEST')
    console.log('='.repeat(60))

    try {
        // Step 1: Find all CSV resources
        const csvResources = await findAllCsvResources()

        if (csvResources.length === 0) {
            console.error('❌ No CSV datasets found')
            process.exit(1)
        }

        // Step 2: Try each CSV until we find one with 100+ records
        let rows: string[][] = []
        let successResource: HdxResource | null = null

        for (const resource of csvResources.slice(0, 10)) { // Try up to 10
            console.log(`\n🔍 Trying: ${resource.name}`)
            try {
                const testRows = await fetchAndParseCsv(resource.url)
                if (testRows.length > 100) {
                    rows = testRows
                    successResource = resource
                    console.log(`   ✅ Found dataset with ${testRows.length - 1} records!`)
                    break
                } else {
                    console.log(`   ⏭️ Only ${testRows.length - 1} records, trying next...`)
                    // Clear the results for this attempt
                    results.pop() // Remove parse result
                    results.pop() // Remove fetch result
                }
            } catch (err) {
                console.log(`   ⚠️ Failed to fetch: ${(err as Error).message}`)
            }
        }

        if (!successResource || rows.length < 100) {
            console.error('❌ Could not find a dataset with 100+ records')
            process.exit(1)
        }

        // Step 3: Process records
        processRecords(rows)

        // Step 4: Print summary
        printSummary()

    } catch (error) {
        console.error('\n❌ Error during stress test:', error)
        process.exit(1)
    }
}

main()
