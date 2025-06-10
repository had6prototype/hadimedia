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
  Minimize,
  Pause,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function LivePage() {
  // Updated stream URLs with the new primary URL
  const streamUrls = [
    "https://672a3a5c8e335.streamlock.net:443/alhadi/smil:alhadimedia.smil/playlist.m3u8",
    "https://g.decdn.net/haditv.co.uk/haditv6.m3u8", // Fallback
  ]

  const [currentStreamIndex, setCurrentStreamIndex] = useState(0)
  const [streamStatus, setStreamStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewers, setViewers] = useState(1250)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate loading progress for better UX
  const startLoadingProgress = () => {
    setLoadingProgress(0)
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev // Stop at 90% until actual loading completes
        return prev + Math.random() * 15
      })
    }, 500)
  }

  const stopLoadingProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setLoadingProgress(100)
    setTimeout(() => setLoadingProgress(0), 1000)
  }

  // Initialize HLS.js when component mounts
  useEffect(() => {
    const setupHls = async () => {
      if (videoRef.current) {
        setIsLoading(true)
        setStreamStatus("checking")
        startLoadingProgress()

        try {
          const streamUrl = streamUrls[currentStreamIndex]
          console.log(`Loading stream: ${streamUrl}`)

          // Dynamically import hls.js
          const Hls = (await import("hls.js")).default

          if (Hls.isSupported()) {
            hlsRef.current = new Hls({
              maxBufferLength: 60, // Increased buffer for slower loading streams
              maxMaxBufferLength: 120,
              startLevel: 1, // Start with lower quality for faster initial load
              capLevelToPlayerSize: true,
              debug: false,
              enableWorker: false,
              lowLatencyMode: false,
              backBufferLength: 90,
              // Increased timeouts for slower streams
              manifestLoadingTimeOut: 30000, // 30 seconds
              manifestLoadingMaxRetry: 3,
              levelLoadingTimeOut: 30000,
              levelLoadingMaxRetry: 2,
              fragLoadingTimeOut: 30000,
              fragLoadingMaxRetry: 3,
            })

            hlsRef.current.loadSource(streamUrl)
            hlsRef.current.attachMedia(videoRef.current)

            // Set a longer timeout for this stream since it takes time to load
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current)
            }

            loadingTimeoutRef.current = setTimeout(() => {
              if (streamStatus === "checking") {
                console.log("Stream loading timeout, trying next URL...")
                if (currentStreamIndex < streamUrls.length - 1) {
                  setCurrentStreamIndex((prev) => prev + 1)
                } else {
                  setError("پخش زنده در حال حاضر در دسترس نیست")
                  setStreamStatus("unavailable")
                  setIsLoading(false)
                  stopLoadingProgress()
                }
              }
            }, 45000) // 45 second timeout for slower streams

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed")
              setStreamStatus("available")
              setError(null)
              setIsLoading(false)
              stopLoadingProgress()
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
              }
            })

            hlsRef.current.on(Hls.Events.LEVEL_LOADED, () => {
              setLoadingProgress(75)
            })

            hlsRef.current.on(Hls.Events.FRAG_LOADED, () => {
              setLoadingProgress(85)
            })

            hlsRef.current.on(Hls.Events.ERROR, (event: any, data: any) => {
              console.error("HLS Error:", data)
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error", data)
                    setStreamStatus("unavailable")
                    // Retry with the next stream URL or show an error after all attempts
                    if (currentStreamIndex < streamUrls.length - 1) {
                      console.log(`Trying next stream URL (${currentStreamIndex + 1})`)
                      setCurrentStreamIndex(currentStreamIndex + 1)
                    } else {
                      setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
                      stopLoadingProgress()
                    }
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error", data)
                    setStreamStatus("unavailable")
                    hlsRef.current.recoverMediaError()
                    break
                  default:
                    console.error("Unrecoverable error", data)
                    setStreamStatus("unavailable")
                    setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
                    stopLoadingProgress()
                    break
                }
              }
            })
          } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            // For Safari which has native HLS support
            videoRef.current.src = streamUrl
            videoRef.current.addEventListener("loadedmetadata", () => {
              setStreamStatus("available")
              setError(null)
              setIsLoading(false)
              stopLoadingProgress()
            })
            videoRef.current.addEventListener("error", () => {
              if (currentStreamIndex < streamUrls.length - 1) {
                setCurrentStreamIndex((prev) => prev + 1)
              } else {
                setError("پخش زنده در حال حاضر در دسترس نیست")
                setStreamStatus("unavailable")
                setIsLoading(false)
                stopLoadingProgress()
              }
            })
          } else {
            setError("مرورگر شما از پخش زنده پشتیبانی نمی‌کند.")
            setStreamStatus("unavailable")
            setIsLoading(false)
            stopLoadingProgress()
          }
        } catch (err) {
          console.error("Error loading HLS.js:", err)
          setError("خطا در بارگذاری پخش زنده.")
          setStreamStatus("unavailable")
          setIsLoading(false)
          stopLoadingProgress()
        }
      }
    }

    setupHls()

    // Add fullscreen event listeners
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      // Remove fullscreen event listeners
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [currentStreamIndex])

  const togglePlay = () => {
    if (videoRef.current && streamStatus === "available") {
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

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        // Enter fullscreen
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        } else if ((videoRef.current as any).webkitRequestFullscreen) {
          ;(videoRef.current as any).webkitRequestFullscreen()
        } else if ((videoRef.current as any).mozRequestFullScreen) {
          ;(videoRef.current as any).mozRequestFullScreen()
        } else if ((videoRef.current as any).msRequestFullscreen) {
          ;(videoRef.current as any).msRequestFullscreen()
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          ;(document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          ;(document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          ;(document as any).msExitFullscreen()
        }
      }
    }
  }

  const retryStream = () => {
    setError(null)
    setCurrentStreamIndex(0)
    setStreamStatus("checking")
    setIsLoading(true)

    if (hlsRef.current) {
      hlsRef.current.destroy()
    }

    // Trigger re-initialization
    setTimeout(() => {
      window.location.reload()
    }, 100)
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
                {streamStatus === "available" ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="font-medium text-white text-sm">پخش زنده</span>
                  </>
                ) : streamStatus === "unavailable" ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium text-white text-sm">غیرفعال</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="font-medium text-white text-sm">در حال بارگذاری...</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <Users className="h-4 w-4" />
                <span>{viewers} بیننده</span>
              </div>
            </div>

            {/* Loading Progress Bar */}
            {streamStatus === "checking" && loadingProgress > 0 && (
              <div className="absolute top-16 left-3 right-3 z-10">
                <div className="bg-black/50 rounded p-2">
                  <div className="flex justify-between text-white text-xs mb-1">
                    <span>بارگذاری پخش زنده</span>
                    <span>{Math.round(loadingProgress)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1">
                    <div
                      className="bg-white h-1 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {error && streamStatus === "unavailable" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center z-20">
                <AlertCircle className="h-12 w-12 mb-4 text-yellow-400" />
                <p className="mb-4">{error}</p>
                <Button variant="secondary" size="sm" onClick={retryStream}>
                  تلاش مجدد
                </Button>
              </div>
            )}

            {streamStatus === "checking" && !error && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-white" />
                  <p className="text-white">در حال بارگذاری پخش زنده...</p>
                  <p className="text-white/70 text-sm mt-1">لطفاً صبر کنید، این ممکن است چند لحظه طول بکشد</p>
                  {loadingProgress > 0 && <p className="text-white/70 text-sm mt-1">{Math.round(loadingProgress)}%</p>}
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/logo.png"
              playsInline
              muted={isMuted}
            />

            {!isPlaying && !isLoading && !error && streamStatus === "available" && (
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

            {isLoading && !error && streamStatus === "available" && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-white" />
                  <p className="text-white">در حال آماده‌سازی پخش...</p>
                </div>
              </div>
            )}

            {isPlaying && !isLoading && !error && streamStatus === "available" && (
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
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
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
