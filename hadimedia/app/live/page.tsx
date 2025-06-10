"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MessageSquare,
  Share2,
  ThumbsUp,
  Volume2,
  Users,
  VolumeX,
  Maximize,
  Pause,
  Play,
  Loader2,
} from "lucide-react"

export default function LivePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewers, setViewers] = useState(1250)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)

  // Initialize HLS.js when component mounts
  useEffect(() => {
    const setupHls = async () => {
      if (videoRef.current) {
        try {
          // Dynamically import hls.js
          const Hls = (await import("hls.js")).default

          if (Hls.isSupported()) {
            hlsRef.current = new Hls({
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
              startLevel: 2, // Start with a higher quality
              capLevelToPlayerSize: true,
              debug: false,
            })

            hlsRef.current.loadSource("https://g.decdn.net/haditv.co.uk/haditv6.m3u8")
            hlsRef.current.attachMedia(videoRef.current)

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed")
            })

            hlsRef.current.on(Hls.Events.ERROR, (event: any, data: any) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error", data)
                    hlsRef.current.startLoad()
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error", data)
                    hlsRef.current.recoverMediaError()
                    break
                  default:
                    console.error("Unrecoverable error", data)
                    setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
                    break
                }
              }
            })
          } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            // For Safari which has native HLS support
            videoRef.current.src = "https://g.decdn.net/haditv.co.uk/haditv6.m3u8"
          } else {
            setError("مرورگر شما از پخش زنده پشتیبانی نمی‌کند.")
          }
        } catch (err) {
          console.error("Error loading HLS.js:", err)
          setError("خطا در بارگذاری پخش زنده.")
        }
      }
    }

    setupHls()

    // Simulate random viewer count changes
    const interval = setInterval(() => {
      setViewers((prev) => Math.floor(prev + (Math.random() * 10 - 5)))
    }, 5000)

    // Cleanup function
    return () => {
      clearInterval(interval)
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      setIsLoading(true)

      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        setIsLoading(false)
      } else {
        const playPromise = videoRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              setIsLoading(false)
            })
            .catch((error) => {
              console.error("Error playing video:", error)
              setIsPlaying(false)
              setIsLoading(false)
              setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
            })
        }
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const enterFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const retryStream = () => {
    setError(null)
    setIsLoading(true)

    if (hlsRef.current) {
      hlsRef.current.destroy()

      const setupHls = async () => {
        try {
          const Hls = (await import("hls.js")).default

          if (Hls.isSupported()) {
            hlsRef.current = new Hls()
            hlsRef.current.loadSource("https://g.decdn.net/haditv.co.uk/haditv6.m3u8")
            hlsRef.current.attachMedia(videoRef.current!)

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false)
            })

            hlsRef.current.on(Hls.Events.ERROR, (event: any, data: any) => {
              if (data.fatal) {
                setIsLoading(false)
                setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
              }
            })
          }
        } catch (err) {
          console.error("Error reloading HLS.js:", err)
          setIsLoading(false)
          setError("خطا در بارگذاری مجدد پخش زنده.")
        }
      }

      setupHls()
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">پخش زنده</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* ویدیو پخش زنده */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="font-medium text-white text-sm">پخش زنده</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Users className="h-4 w-4" />
                <span>{viewers} بیننده</span>
              </div>
            </div>

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center z-20">
                <p className="mb-4">{error}</p>
                <Button variant="secondary" size="sm" onClick={retryStream}>
                  تلاش مجدد
                </Button>
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/logo.png"
              playsInline
              muted={isMuted}
            />

            {!isPlaying && !isLoading && !error && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-medium">کانال الهادی داری</span>
                  </div>
                  <p className="text-xl font-bold mb-4">پخش زنده برنامه‌های اسلامی</p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="mt-2 gap-2 px-6 py-6 rounded-full hover:scale-105 transition-transform"
                    onClick={togglePlay}
                  >
                    <Play className="h-6 w-6" />
                    شروع پخش زنده
                  </Button>
                </div>
              </div>
            )}

            {isLoading && !error && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-white" />
                  <p className="text-white">در حال بارگذاری پخش زنده...</p>
                </div>
              </div>
            )}

            {isPlaying && !isLoading && !error && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <div className="h-1 bg-white/20 rounded-full w-32 md:w-48 lg:w-64 overflow-hidden">
                      <div className="h-full bg-primary w-3/4 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                      <Pause className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={enterFullscreen}
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* اطلاعات برنامه */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">پخش زنده کانال الهادی داری</CardTitle>
              <CardDescription>پخش زنده برنامه‌های کانال الهادی داری با کیفیت Full HD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString("fa-IR")}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>پخش ۲۴ ساعته</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{viewers} بیننده</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                کانال الهادی داری به صورت ۲۴ ساعته برنامه‌های مذهبی، آموزشی و فرهنگی را پخش می‌کند. شما می‌توانید سوالات
                خود را در بخش گفتگو مطرح کنید.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  پسندیدم
                </Button>
                <Button variant="outline" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  اشتراک‌گذاری
                </Button>
              </div>
              <Button className="gap-1">
                <MessageSquare className="h-4 w-4" />
                ارسال سوال
              </Button>
            </CardFooter>
          </Card>

          {/* تب‌های محتوا */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">درباره کانال</TabsTrigger>
              <TabsTrigger value="schedule">برنامه‌های آینده</TabsTrigger>
              <TabsTrigger value="archive">آرشیو</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="p-4 border rounded-md mt-2">
              <h3 className="font-bold mb-2">درباره کانال الهادی داری</h3>
              <p className="text-muted-foreground mb-4">
                کانال الهادی داری یک شبکه تلویزیونی اسلامی به زبان فارسی است که برنامه‌های مذهبی، آموزشی و فرهنگی را پخش
                می‌کند. این کانال با هدف ترویج فرهنگ اسلامی و پاسخگویی به سوالات شرعی مخاطبان راه‌اندازی شده است.
              </p>
              <h3 className="font-bold mb-2">اهداف کانال</h3>
              <p className="text-muted-foreground">
                ترویج فرهنگ اسلامی، پاسخگویی به سوالات شرعی، آموزش احکام دینی، معرفی سیره اهل بیت (علیهم السلام) و ایجاد
                فضای گفتگو و تبادل نظر میان مخاطبان از اهداف اصلی این کانال است.
              </p>
            </TabsContent>
            <TabsContent value="schedule" className="p-4 border rounded-md mt-2">
              <h3 className="font-bold mb-4">برنامه‌های آینده</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">احکام شرعی - عزاداری اهل بیت</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>۱۴۰۴/۰۳/۰۱</span>
                      <Clock className="h-3 w-3 mr-2" />
                      <span>۱۸:۰۰</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    یادآوری
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">تفاوت‌های حقوقی زن و مرد</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>۱۴۰۴/۰۳/۰۸</span>
                      <Clock className="h-3 w-3 mr-2" />
                      <span>۱۸:۰۰</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    یادآوری
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">هدف از آزادی</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>۱۴۰۴/۰۳/۱۵</span>
                      <Clock className="h-3 w-3 mr-2" />
                      <span>۱۸:۰۰</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    یادآوری
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="archive" className="p-4 border rounded-md mt-2">
              <h3 className="font-bold mb-4">آرشیو برنامه‌های گذشته</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">احکام شرعی - عزاداری اهل بیت</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>۱۴۰۴/۰۲/۱۸</span>
                      <Clock className="h-3 w-3 mr-2" />
                      <span>۵۵:۲۰ دقیقه</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    مشاهده
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">تفاوت‌های حقوقی زن و مرد</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>۱۴۰۴/۰۲/۱۱</span>
                      <Clock className="h-3 w-3 mr-2" />
                      <span>۵۲:۱۵ دقیقه</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    مشاهده
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium">هدف از آزادی</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>۱۴۰۴/۰۲/۰۴</span>
                      <Clock className="h-3 w-3 mr-2" />
                      <span>۵۸:۴۰ دقیقه</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    مشاهده
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          {/* بخش گفتگو */}
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">گفتگوی زنده</CardTitle>
              <CardDescription>سوالات خود را مطرح کنید</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto border-y">
              <div className="space-y-4 py-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {item}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">کاربر {item}</p>
                        <span className="text-xs text-muted-foreground">۱۸:۰{item}</span>
                      </div>
                      <p className="text-sm mt-1">
                        این یک پیام نمونه از کاربر {item} است که در گفتگوی زنده ارسال شده است.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-3">
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 px-3 py-2 rounded-md border text-sm"
                />
                <Button size="sm">ارسال</Button>
              </div>
            </CardFooter>
          </Card>

          {/* برنامه‌های آینده */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">برنامه‌های آینده</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded bg-primary/10 text-primary flex flex-col items-center justify-center text-xs">
                  <span className="font-bold">۰۱</span>
                  <span>خرداد</span>
                </div>
                <div>
                  <p className="font-medium">احکام شرعی - عزاداری اهل بیت</p>
                  <p className="text-xs text-muted-foreground mt-1">سه‌شنبه - ساعت ۱۸:۰۰</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded bg-primary/10 text-primary flex flex-col items-center justify-center text-xs">
                  <span className="font-bold">۰۳</span>
                  <span>خرداد</span>
                </div>
                <div>
                  <p className="font-medium">پاسخ به سوالات شرعی</p>
                  <p className="text-xs text-muted-foreground mt-1">پنج‌شنبه - ساعت ۲۰:۰۰</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded bg-primary/10 text-primary flex flex-col items-center justify-center text-xs">
                  <span className="font-bold">۰۵</span>
                  <span>خرداد</span>
                </div>
                <div>
                  <p className="font-medium">احکام خانواده در اسلام</p>
                  <p className="text-xs text-muted-foreground mt-1">شنبه - ساعت ۱۹:۰۰</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                مشاهده همه برنامه‌ها
              </Button>
            </CardFooter>
          </Card>

          {/* پیشنهادات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">پیشنهاد برای شما</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-16 h-12 bg-muted rounded overflow-hidden relative">
                  <img src="/images/ahkam-sharei.png" alt="احکام شرعی" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">احکام شرعی - عزاداری اهل بیت</p>
                  <p className="text-xs text-muted-foreground mt-1">۴۵:۲۰ دقیقه</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-16 h-12 bg-muted rounded overflow-hidden relative">
                  <img
                    src="/images/tafavot-hoghoghi.png"
                    alt="تفاوت‌های حقوقی زن و مرد"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">تفاوت‌های حقوقی زن و مرد</p>
                  <p className="text-xs text-muted-foreground mt-1">۵۸:۱۵ دقیقه</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-16 h-12 bg-muted rounded overflow-hidden relative">
                  <img src="/images/hadaf-az-azadi.png" alt="هدف از آزادی" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">هدف از آزادی</p>
                  <p className="text-xs text-muted-foreground mt-1">۳۵:۴۰ دقیقه</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
