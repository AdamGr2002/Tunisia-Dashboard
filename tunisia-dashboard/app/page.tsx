/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'

const DynamicChart = dynamic(() => import('./components/Chart'), { ssr: false })
const ExportButtons = dynamic(() => import('./components/ExportButtons'), { ssr: false })

const API_BASE_URL = 'https://api.worldbank.org/v2/country/TUN/indicator/'

const indicators = {
  gdp: 'NY.GDP.MKTP.CD',
  gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
  inflation: 'FP.CPI.TOTL.ZG',
  unemployment: 'SL.UEM.TOTL.ZS',
  fdi: 'BX.KLT.DINV.WD.GD.ZS',
  population: 'SP.POP.TOTL',
} as const

const indicatorNames: Record<keyof typeof indicators, string> = {
  gdp: 'GDP (Current US$)',
  gdpGrowth: 'GDP Growth (annual %)',
  inflation: 'Inflation (annual %)',
  unemployment: 'Unemployment (% of total labor force)',
  fdi: 'Foreign Direct Investment (% of GDP)',
  population: 'Population',
}

const tooltipDescriptions: Record<keyof typeof indicators, string> = {
  gdp: "Gross Domestic Product (GDP) is the total monetary value of all goods and services produced within a country's borders in a specific time period. It serves as a comprehensive scorecard of a country's economic health.",
  gdpGrowth: "GDP Growth rate represents the percentage change in a country's GDP from one year to the next. It's a key indicator of economic expansion or contraction.",
  inflation: "Inflation measures the rate at which the general level of prices for goods and services is rising, consequently eroding purchasing power. It's typically expressed as an annual percentage change.",
  unemployment: "The unemployment rate represents the percentage of the labor force that is without work but available for and seeking employment. It's a crucial indicator of the economy's performance.",
  fdi: "Foreign Direct Investment (FDI) represents the net inflows of investment to acquire a lasting management interest in an enterprise operating in an economy other than that of the investor. It's expressed as a percentage of GDP.",
  population: "Total population counts all residents regardless of legal status or citizenship. The values shown are midyear estimates. Population growth can impact various economic factors.",
}

interface DataPoint {
  year: string;
  value: number;
}

async function fetchWorldBankData(indicator: string, startYear: number, endYear: number): Promise<DataPoint[]> {
  const response = await fetch(`${API_BASE_URL}${indicator}?format=json&date=${startYear}:${endYear}&per_page=100`, { next: { revalidate: 86400 } })
  const data: [any, any[]] = await response.json()
  return data[1].map((item: { date: string; value: number | null }) => ({
    year: item.date,
    value: item.value ?? 0
  })).reverse()
}

export default async function TunisiaDashboard() {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 10 // Default to 10 years

  const dataPromises = Object.entries(indicators).map(async ([key, indicator]) => {
    const data = await fetchWorldBankData(indicator, startYear, currentYear)
    return [key, data] as const
  })

  const dataEntries = await Promise.all(dataPromises)
  const data: Record<keyof typeof indicators, DataPoint[]> = Object.fromEntries(dataEntries) as Record<keyof typeof indicators, DataPoint[]>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-6">Tunisia Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.entries(data) as [keyof typeof indicators, DataPoint[]][]).map(([key, indicatorData]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{indicatorNames[key]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <Suspense fallback={<div>Loading chart...</div>}>
                    <DynamicChart 
                      data={indicatorData} 
                      dataKey="value" 
                      name={indicatorNames[key]} 
                      color="#8884d8" 
                      description={tooltipDescriptions[key]} 
                    />
                  </Suspense>
                </TabsContent>
                <TabsContent value="table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {indicatorData.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell>{row.year}</TableCell>
                          <TableCell>{row.value.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
              <Suspense fallback={<div>Loading export buttons...</div>}>
                <ExportButtons indicatorKey={key} indicatorName={indicatorNames[key]} data={indicatorData} />
              </Suspense>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}