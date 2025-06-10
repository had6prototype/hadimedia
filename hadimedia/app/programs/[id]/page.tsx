"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, Eye, ChevronLeft, Edit, Trash2, Loader2 } from "lucide-react"
import { getProgram, incrementProgramViews, deleteProgram } from "@/app/admin/programs/actions"
import { useToast } from "@/components/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProgramPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [program, setProgram] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchProgram = async () => {
      if (!params.id) return

      setIsLoading(true)
      const result = await getProgram(Number(params.id))

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
        router.push("/programs")
      } else if (result.program) {
        setProgram(result.program)
        // Increment view count
        incrementProgramViews(Number(params.id))
      }

      setIsLoading(false)
    }

    fetchProgram()
  }, [params.id, router, toast])

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteProgram(Number(params.id))

    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
      setIsDeleting(false)
    } else {
      toast({
        title: "موفقیت",
        description: "برنامه با موفقیت حذف شد",
      })
      router.push("/programs")
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">برنامه یافت نشد</h1>
          <p className="text-muted-foreground mb-6">متأسفانه برنامه مورد نظر شما یافت نشد.</p>
          <Button asChild>
            <Link href="/programs">بازگشت به لیست برنامه‌ها</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6">
        <Link href="/programs" className="text-muted-foreground hover:text-foreground flex items-center">
          <ChevronLeft className="h-4 w-4 ml-1" />
          بازگشت به لیست برنامه‌ها
        </Link>
      </div>

      {/* Admin Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{program.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/programs/edit/${program.id}`}>
              <Edit className="h-4 w-4 ml-2" />
              ویرایش
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 ml-2" />
            حذف
          </Button>
        </div>
      </div>

      {/* Video */}
      <div className="mb-8">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {program.video_url ? (
            <video
              src={program.video_url}
              controls
              poster={program.thumbnail_url}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={program.thumbnail_url || "/placeholder.svg"}
                alt={program.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white text-lg">ویدیو در دسترس نیست</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Program Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">درباره این برنامه</h2>
              <p className="text-muted-foreground whitespace-pre-line">{program.description}</p>

              {program.tags && program.tags.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">تگ‌ها</h3>
                    <div className="flex flex-wrap gap-2">
                      {program.tags.map((tag: any) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">اطلاعات برنامه</h3>
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 ml-2" />
                  <span>مدت زمان: {program.duration || "نامشخص"}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 ml-2" />
                  <span>تاریخ انتشار: {new Date(program.created_at).toLocaleDateString("fa-IR")}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Eye className="h-4 w-4 ml-2" />
                  <span>تعداد بازدید: {program.views?.toLocaleString() || "0"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این برنامه اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. این برنامه به طور دائمی از سیستم حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  در حال حذف...
                </>
              ) : (
                "حذف برنامه"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
