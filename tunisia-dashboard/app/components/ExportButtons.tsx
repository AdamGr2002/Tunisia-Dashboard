/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { Button } from "@/components/ui/button"
import { Download, Image } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useRef } from 'react'

interface DataPoint {
  year: string;
  value: number;
}

interface ExportButtonsProps {
  indicatorKey: string;
  indicatorName: string;
  data: DataPoint[];
}

export default function ExportButtons({ indicatorKey, indicatorName, data }: ExportButtonsProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Year,Value\n"
      + data.map(row => `${row.year},${row.value}`).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${indicatorName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportChartImage = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current)
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `${indicatorName}.png`
      link.click()
    }
  }

  return (
    <div className="flex justify-end mt-4 space-x-2" ref={chartRef}>
      <Button onClick={exportCSV} size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button onClick={exportChartImage} size="sm">
        <Image className="mr-2 h-4 w-4" />
        Export Chart
      </Button>
    </div>
  )
}