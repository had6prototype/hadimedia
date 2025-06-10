"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Volume2, VolumeX, Maximize, Pause, Loader2 } from "lucide-react"

export default function LiveBanner() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

    // Cleanup function
    return () => {
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
    if (hlsRef.current) {
      hlsRef.current.destroy()

      const setupHls = async () => {
        try {
          const Hls = (await import("hls.js")).default

          if (Hls.isSupported()) {
            hlsRef.current = new Hls()
            hlsRef.current.loadSource("https://g.decdn.net/haditv.co.uk/haditv6.m3u8")
            hlsRef.current.attachMedia(videoRef.current!)
          }
        } catch (err) {
          console.error("Error reloading HLS.js:", err)
          setError("خطا در بارگذاری مجدد پخش زنده.")
        }
      }

      setupHls()
    }
  }

  return (
    <section className="bg-gradient-to-r from-primary/90 to-primary/70 text-white">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-right">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-medium">پخش زنده</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">رسانه الهادی</h1>
            <p className="max-w-md">
              هم‌اکنون برنامه رسانه الهادی در حال پخش زنده است. برای مشاهده روی دکمه پخش کلیک کنید.
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2"
                onClick={togglePlay}
                disabled={isLoading || !!error}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    در حال بارگذاری...
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    توقف پخش زنده
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    مشاهده پخش زنده
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="relative w-full md:w-auto aspect-video md:h-64 rounded-lg overflow-hidden border-4 border-white/20 bg-black">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center">
                <p className="mb-4">{error}</p>
                <Button variant="secondary" size="sm" onClick={retryStream}>
                  تلاش مجدد
                </Button>
              </div>
            ) : null}

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/logo-menu.png"
              playsInline
              muted={isMuted}
            />

            {!isPlaying && !isLoading && !error && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button size="icon" variant="secondary" className="rounded-full h-16 w-16" onClick={togglePlay}>
                  <Play className="h-8 w-8" />
                  <span className="sr-only">پخش</span>
                </Button>
              </div>
            )}

            {isLoading && !error && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
                  <p className="text-white">در حال بارگذاری پخش زنده...</p>
                </div>
              </div>
            )}

            {isPlaying && !isLoading && !error && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" className="text-white h-8 w-8" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white h-8 w-8" onClick={enterFullscreen}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
