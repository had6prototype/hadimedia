"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, Save, Eye, ArrowLeft, ImageIcon, Video, Tag, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProgram } from "../actions"
import { uploadFile, deleteFile } from "../upload-actions"
import { useToast } from "@/components/use-toast"

export default function NewProgramPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoPath: "", // Store the file path for deletion if needed
    thumbnailUrl: "",
    thumbnailPath: "", // Store the file path for deletion if needed
    duration: "",
    order: 1,
    status: "draft",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // تگ‌های پیشنهادی
  const suggestedTags = [
    "احکام شرعی",
    "فقه",
    "عزاداری",
    "اهل بیت",
    "حقوق خانواده",
    "زن و مرد",
    "آزادی",
    "فلسفه",
    "اجتماعی",
    "تاریخ اسلام",
    "روانشناسی اسلامی",
    "اخلاق",
    "عبادات",
    "نماز",
    "روزه",
    "حج",
    "زکات",
    "خمس",
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress (since we can't get real progress from server action)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Upload the file
      const result = await uploadFile(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Update form data with the video URL
      handleInputChange("videoUrl", result.url)
      handleInputChange("videoPath", result.filePath)

      // Get video duration
      const video = document.createElement("video")
      video.src = result.url
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration)
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`
        handleInputChange("duration", formattedDuration)
      }

      toast({
        title: "آپلود موفق",
        description: "ویدیو با موفقیت آپلود شد",
      })
    } catch (error) {
      console.error("خطا در آپلود ویدیو:", error)
      toast({
        title: "خطا",
        description: "خطا در آپلود ویدیو",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    setIsUploading(true)
    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const result = await uploadFile(formData)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Update form data with the thumbnail URL
      handleInputChange("thumbnailUrl", result.url)
      handleInputChange("thumbnailPath", result.filePath)

      toast({
        title: "آپلود موفق",
        description: "تصویر با موفقیت آپلود شد",
      })
    } catch (error) {
      console.error("خطا در آپلود تصویر:", error)
      toast({
        title: "خطا",
        description: "خطا در آپلود تصویر",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveVideo = async () => {
    if (formData.videoPath) {
      try {
        await deleteFile(formData.videoPath)
      } catch (error) {
        console.error("Error deleting video:", error)
      }
    }

    handleInputChange("videoUrl", "")
    handleInputChange("videoPath", "")
    handleInputChange("duration", "")
  }

  const handleRemoveThumbnail = async () => {
    if (formData.thumbnailPath) {
      try {
        await deleteFile(formData.thumbnailPath)
      } catch (error) {
        console.error("Error deleting thumbnail:", error)
      }
    }

    handleInputChange("thumbnailUrl", "")
    handleInputChange("thumbnailPath", "")
  }

  const handleSubmit = async (status: string) => {
    if (!formData.title) {
      toast({
        title: "خطا",
        description: "لطفاً عنوان برنامه را وارد کنید",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const programData = {
        title: formData.title,
        description: formData.description,
        video_url: formData.videoUrl,
        thumbnail_url: formData.thumbnailUrl,
        duration: formData.duration,
        order: formData.order,
        status: status as "published" | "draft" | "archived",
        tags: formData.tags,
      }

      const result = await createProgram(programData)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: status === "published" ? "برنامه با موفقیت منتشر شد!" : "برنامه به عنوان پیش‌نویس ذخیره شد!",
        })

        // بازگشت به صفحه لیست برنامه‌ها
        router.push("/admin/programs")
      }
    } catch (error) {
      console.error("خطا در ذخیره برنامه:", error)
      toast({
        title: "خطا",
        description: "خطا در ذخیره برنامه",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">افزودن برنامه جدید</h1>
            <p className="text-muted-foreground">ایجاد برنامه ویدیویی جدید</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isSubmitting}>
            {isSubmitting && formData.status === "draft" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                ذخیره پیش‌نویس
              </>
            )}
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={isSubmitting}>
            {isSubmitting && formData.status === "published" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                در حال انتشار...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                انتشار
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* فرم اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* اطلاعات اصلی */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات اصلی</CardTitle>
              <CardDescription>عنوان و توضیحات برنامه را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان برنامه</Label>
                <Input
                  id="title"
                  placeholder="عنوان برنامه را وارد کنید"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  placeholder="توضیحات برنامه را وارد کنید"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* آپلود ویدیو */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                آپلود ویدیو
              </CardTitle>
              <CardDescription>فایل ویدیوی برنامه را آپلود کنید</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.videoUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video src={formData.videoUrl} controls className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">مدت زمان: {formData.duration}</span>
                    <Button variant="outline" size="sm" onClick={handleRemoveVideo}>
                      <X className="h-4 w-4 mr-2" />
                      حذف ویدیو
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">آپلود فایل ویدیو</p>
                    <p className="text-sm text-muted-foreground">فایل‌های MP4, MOV, AVI پشتیبانی می‌شوند</p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleVideoUpload(file)
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button asChild disabled={isUploading}>
                      <label htmlFor="video-upload" className="cursor-pointer">
                        {isUploading ? "در حال آپلود..." : "انتخاب فایل"}
                      </label>
                    </Button>
                  </div>

                  {/* Progress bar */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm mt-1">{uploadProgress}% آپلود شده</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* تگ‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                تگ‌ها
              </CardTitle>
              <CardDescription>تگ‌های مرتبط با برنامه را اضافه کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* تگ‌های انتخاب شده */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>تگ‌های انتخاب شده:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* افزودن تگ جدید */}
              <div className="space-y-2">
                <Label>افزودن تگ جدید:</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="نام تگ را وارد کنید"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag(newTag)
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => addTag(newTag)} disabled={!newTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* تگ‌های پیشنهادی */}
              <div className="space-y-2">
                <Label>تگ‌های پیشنهادی:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !formData.tags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          {/* تصویر شاخص */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                تصویر شاخص
              </CardTitle>
              <CardDescription>تصویر نمایشی برنامه</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.thumbnailUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={formData.thumbnailUrl || "/placeholder.svg"}
                      alt="تصویر شاخص"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRemoveThumbnail} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    حذف تصویر
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">تصویر شاخص برنامه</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleThumbnailUpload(file)
                    }}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <Button asChild variant="outline" size="sm" disabled={isUploading}>
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {isUploading ? "در حال آپلود..." : "انتخاب تصویر"}
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* تنظیمات */}
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات</CardTitle>
              <CardDescription>تنظیمات انتشار و ترتیب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order">ترتیب نمایش</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange("order", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">وضعیت</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="published">منتشر شده</SelectItem>
                    <SelectItem value="archived">آرشیو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.duration && (
                <div className="space-y-2">
                  <Label>مدت زمان</Label>
                  <div className="text-sm font-medium">{formData.duration}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
