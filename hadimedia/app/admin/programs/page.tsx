"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  ArrowUpDown,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPrograms, deleteProgram, updateProgramOrder } from "./actions"
import { deleteAllPrograms } from "./clear-all-action"
import { useToast } from "@/components/use-toast"

export default function AdminProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true)
      const result = await getPrograms()

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.programs) {
        setPrograms(result.programs)
      }

      setIsLoading(false)
    }

    fetchPrograms()
  }, [toast])

  const handleDeleteProgram = async (id: number) => {
    if (confirm("آیا از حذف این برنامه اطمینان دارید؟")) {
      const result = await deleteProgram(id)

      if (result.error) {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "موفقیت",
          description: "برنامه با موفقیت حذف شد",
        })

        // Update local state
        setPrograms(programs.filter((program) => program.id !== id))
      }
    }
  }

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    const result = await deleteAllPrograms()

    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "موفقیت",
        description: result.message,
      })
      setPrograms([])
    }
    setIsDeleting(false)
  }

  const handleUpdateOrder = async (id: number, direction: "up" | "down") => {
    const programIndex = programs.findIndex((p) => p.id === id)
    if (programIndex === -1) return

    const program = programs[programIndex]
    const newOrder = direction === "up" ? program.order - 1 : program.order + 1

    if (newOrder < 1) return

    const result = await updateProgramOrder(id, newOrder)

    if (result.error) {
      toast({
        title: "خطا",
        description: result.error,
        variant: "destructive",
      })
    } else {
      // Refresh programs
      const refreshResult = await getPrograms()
      if (refreshResult.programs) {
        setPrograms(refreshResult.programs)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">منتشر شده</Badge>
      case "draft":
        return <Badge variant="secondary">پیش‌نویس</Badge>
      case "archived":
        return <Badge variant="outline">آرشیو شده</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || program.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت برنامه‌ها</h1>
          <p className="text-muted-foreground">مدیریت و ویرایش برنامه‌های ویدیویی</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/programs/new" className="gap-2">
              <Plus className="h-4 w-4" />
              افزودن برنامه جدید
            </Link>
          </Button>
          {programs.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  حذف همه
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    حذف تمام برنامه‌ها
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    آیا از حذف تمام برنامه‌ها اطمینان دارید؟ این عمل غیرقابل بازگشت است و تمام برنامه‌ها و اطلاعات مرتبط
                    با آن‌ها حذف خواهد شد.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        در حال حذف...
                      </>
                    ) : (
                      "حذف همه"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در برنامه‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                همه
              </Button>
              <Button
                variant={selectedFilter === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("published")}
              >
                منتشر شده
              </Button>
              <Button
                variant={selectedFilter === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("draft")}
              >
                پیش‌نویس
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>لیست برنامه‌ها ({filteredPrograms.length})</CardTitle>
          <CardDescription>مدیریت و ویرایش برنامه‌های موجود</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2">در حال بارگذاری...</span>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">هیچ برنامه‌ای یافت نشد</p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery("")}>
                  پاک کردن جستجو
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">تصویر</TableHead>
                    <TableHead>عنوان</TableHead>
                    <TableHead>تگ‌ها</TableHead>
                    <TableHead>مدت زمان</TableHead>
                    <TableHead>بازدید</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead className="w-[50px]">ترتیب</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div className="relative w-16 h-12 rounded overflow-hidden">
                          <Image
                            src={program.thumbnailUrl || "/placeholder.svg"}
                            alt={program.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium line-clamp-1">{program.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{program.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(program.createdAt).toLocaleDateString("fa-IR")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {program.tags?.slice(0, 2).map((tag: any) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {program.tags?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{program.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {program.duration || "نامشخص"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3" />
                          {program.views?.toLocaleString() || "0"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(program.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleUpdateOrder(program.id, "up")}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm">{program.order}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/programs/${program.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                مشاهده
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/programs/edit/${program.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                ویرایش
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProgram(program.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
