"use client"

import { useEffect, useState } from "react"

export default function NewsTicker() {
  const [position, setPosition] = useState(0)

  // احکام آیت الله سیستانی
  const ahkamItems = [
    "احکام آیت الله سیستانی: نماز و روزه در سفر",
    "احکام آیت الله سیستانی: خمس و زکات",
    "احکام آیت الله سیستانی: معاملات و تجارت",
    "احکام آیت الله سیستانی: طهارت و نجاست",
    "احکام آیت الله سیستانی: حج و زیارت",
    "احکام آیت الله سیستانی: ازدواج و طلاق",
    "احکام آیت الله سیستانی: ارث و وصیت",
    "احکام آیت الله سیستانی: امر به معروف و نهی از منکر",
  ]

  const combinedAhkam = ahkamItems.join(" • ")

  useEffect(() => {
    // شروع از خارج از صفحه در سمت چپ
    setPosition(-window.innerWidth)

    const tickerWidth = combinedAhkam.length * 12 // تنظیم عرض تقریبی بر اساس طول متن

    const animate = () => {
      setPosition((prevPosition) => {
        // حرکت از چپ به راست
        if (prevPosition >= tickerWidth) {
          return -window.innerWidth // شروع مجدد از خارج صفحه سمت چپ
        }
        return prevPosition + 1 // افزایش به جای کاهش برای حرکت از چپ به راست
      })
    }

    const interval = setInterval(animate, 30)

    return () => clearInterval(interval)
  }, [combinedAhkam.length])

  return (
    <div className="bg-primary/10 border-y border-primary/30 py-3 overflow-hidden text-foreground">
      <div className="container relative">
        <div className="flex items-center">
          <div className="font-bold ml-4 bg-secondary text-white px-3 py-1 rounded whitespace-nowrap">
            احکام آیت الله سیستانی
          </div>
          <div className="overflow-hidden flex-1 relative">
            <div
              className="inline-block whitespace-nowrap text-right font-medium text-lg"
              style={{ transform: `translateX(${position}px)` }}
            >
              {combinedAhkam}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
