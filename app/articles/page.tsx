import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Filter, ChevronLeft, ChevronRight, FileText } from "lucide-react"

export default function ArticlesPage() {
  // مقالات ویژه
  const featuredArticles = [
    {
      id: 1,
      title: "اهمیت حجاب در اسلام",
      description: "بررسی اهمیت و فلسفه حجاب در دین اسلام و تأثیر آن بر جامعه",
      image: "/placeholder-jcllv.png",
      date: "۱۴۰۴/۰۲/۲۵",
      readTime: "۱۰",
      author: "دکتر محمدی",
      badge: "ویژه",
    },
    {
      id: 2,
      title: "فضیلت‌های ماه رمضان",
      description: "بررسی فضیلت‌ها و برکات ماه مبارک رمضان و اعمال مستحب در این ماه",
      image: "/placeholder-nwrtj.png",
      date: "۱۴۰۴/۰۲/۲۰",
      readTime: "۸",
      author: "استاد رضایی",
      badge: "پربازدید",
    },
    {
      id: 3,
      title: "آداب دعا کردن",
      description: "آموزش آداب و شرایط استجابت دعا در اسلام و بررسی انواع دعاها",
      image: "/placeholder-b1dvs.png",
      date: "۱۴۰۴/۰۲/۱۸",
      readTime: "۷",
      author: "حجت‌الاسلام احمدی",
      badge: "جدید",
    },
  ]

  // همه مقالات
  const allArticles = [
    {
      id: 1,
      title: "اهمیت حجاب در اسلام",
      description: "بررسی اهمیت و فلسفه حجاب در دین اسلام و تأثیر آن بر جامعه",
      image: "/placeholder-jcllv.png",
      date: "۱۴۰۴/۰۲/۲۵",
      readTime: "۱۰",
      author: "دکتر محمدی",
      category: "احکام شرعی",
    },
    {
      id: 2,
      title: "فضیلت‌های ماه رمضان",
      description: "بررسی فضیلت‌ها و برکات ماه مبارک رمضان و اعمال مستحب در این ماه",
      image: "/placeholder-nwrtj.png",
      date: "۱۴۰۴/۰۲/۲۰",
      readTime: "۸",
      author: "استاد رضایی",
      category: "مناسبت‌های مذهبی",
    },
    {
      id: 3,
      title: "آداب دعا کردن",
      description: "آموزش آداب و شرایط استجابت دعا در اسلام و بررسی انواع دعاها",
      image: "/placeholder-b1dvs.png",
      date: "۱۴۰۴/۰۲/۱۸",
      readTime: "۷",
      author: "حجت‌الاسلام احمدی",
      category: "آموزش‌های دینی",
    },
    {
      id: 4,
      title: "حکم شرعی معاملات آنلاین",
      description: "بررسی احکام شرعی مربوط به معاملات آنلاین و تجارت الکترونیک",
      image: "/placeholder-qys8x.png",
      date: "۱۴۰۴/۰۲/۱۵",
      readTime: "۹",
      author: "دکتر حسینی",
      category: "احکام شرعی",
    },
    {
      id: 5,
      title: "تربیت فرزند از دیدگاه اسلام",
      description: "اصول و روش‌های تربیت فرزند از دیدگاه اسلام و سیره اهل بیت (ع)",
      image: "/placeholder-myltz.png",
      date: "۱۴۰۴/۰۲/۱۰",
      readTime: "۱۲",
      author: "دکتر علوی",
      category: "خانواده",
    },
    {
      id: 6,
      title: "اخلاق در فضای مجازی",
      description: "بررسی اصول اخلاقی استفاده از فضای مجازی از دیدگاه اسلام",
      image: "/placeholder.svg?height=400&width=600&query=islamic%20article%20about%20ethics%20in%20social%20media",
      date: "۱۴۰۴/۰۲/۰۵",
      readTime: "۸",
      author: "استاد کریمی",
      category: "اخلاق اسلامی",
    },
    {
      id: 7,
      title: "فلسفه نماز جماعت",
      description: "بررسی فلسفه و آثار اجتماعی و معنوی نماز جماعت در اسلام",
      image: "/placeholder.svg?height=400&width=600&query=islamic%20article%20about%20congregational%20prayer",
      date: "۱۴۰۴/۰۱/۲۰",
      readTime: "۶",
      author: "حجت‌الاسلام محمدی",
      category: "عبادات",
    },
    {
      id: 8,
      title: "آثار صله رحم در زندگی",
      description: "بررسی آثار دنیوی و اخروی صله رحم و ارتباط با خویشاوندان",
      image: "/placeholder.svg?height=400&width=600&query=islamic%20article%20about%20family%20ties",
      date: "۱۴۰۴/۰۱/۱۵",
      readTime: "۷",
      author: "دکتر رضایی",
      category: "اخلاق اسلامی",
    },
    {
      id: 9,
      title: "اهمیت علم‌آموزی در اسلام",
      description: "بررسی جایگاه علم و دانش در اسلام و توصیه‌های دینی برای کسب علم",
      image: "/placeholder.svg?height=400&width=600&query=islamic%20article%20about%20knowledge",
      date: "۱۴۰۴/۰۱/۱۰",
      readTime: "۹",
      author: "استاد حسینی",
      category: "آموزش‌های دینی",
    },
  ]

  // دسته‌بندی‌ها
  const categories = [
    { id: "all", name: "همه" },
    { id: "ahkam", name: "احکام شرعی" },
    { id: "family", name: "خانواده" },
    { id: "ethics", name: "اخلاق اسلامی" },
    { id: "education", name: "آموزش‌های دینی" },
    { id: "events", name: "مناسبت‌های مذهبی" },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">مقالات</h1>
      <p className="text-muted-foreground mb-8">مجموعه مقالات آموزشی و تحلیلی رسانه الهادی در موضوعات مختلف اسلامی</p>

      {/* جستجو و فیلتر */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Input type="search" placeholder="جستجو در مقالات..." className="pr-10" />
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10">
            <Filter className="h-4 w-4" />
            <span className="sr-only">فیلتر</span>
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((category) => (
            <Button key={category.id} variant="outline" size="sm">
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* مقالات ویژه */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">مقالات ویژه</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <FileText className="h-6 w-6" />
                      <span className="sr-only">مطالعه</span>
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-secondary text-white text-xs px-2 py-1 rounded-md">
                    {article.badge}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime} دقیقه مطالعه</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="text-sm text-muted-foreground">نویسنده: {article.author}</div>
                <Button asChild>
                  <Link href={`/articles/${article.id}`}>مطالعه مقاله</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* همه مقالات */}
      <section>
        <h2 className="text-2xl font-bold mb-6">همه مقالات</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <FileText className="h-6 w-6" />
                      <span className="sr-only">مطالعه</span>
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                    {article.category}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-1">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2">{article.description}</CardDescription>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime} دقیقه مطالعه</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between border-t">
                <div className="text-sm text-muted-foreground">نویسنده: {article.author}</div>
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <Link href={`/articles/${article.id}`}>مطالعه</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* پاگینیشن */}
        <div className="flex justify-center mt-12">
          <nav className="flex items-center gap-1">
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">صفحه قبل</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              ۱
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              ۲
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              ۳
            </Button>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">صفحه بعد</span>
            </Button>
          </nav>
        </div>
      </section>
    </div>
  )
}
