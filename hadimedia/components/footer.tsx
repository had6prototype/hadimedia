import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/20 py-12 border-t">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="relative h-16 w-48">
            <Image src="/images/logo-menu.png" alt="رسانه الهادی - Al-Hadi Media" fill className="object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">
            ارائه دهنده محتوای اسلامی و آموزشی با هدف ترویج فرهنگ اسلامی و پاسخگویی به سوالات شرعی
          </p>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="outline" size="icon" asChild>
              <Link href="https://www.facebook.com/fd.haditv6/photos_by" target="_blank" aria-label="فیسبوک">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="https://www.instagram.com/fd_haditv6" target="_blank" aria-label="اینستاگرام">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="https://www.alhadi.co.uk" target="_blank" aria-label="وب‌سایت">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" x2="22" y1="12" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">دسترسی سریع</h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="text-sm hover:text-primary">
              خانه
            </Link>
            <Link href="/live" className="text-sm hover:text-primary">
              پخش زنده
            </Link>
            <Link href="/programs" className="text-sm hover:text-primary">
              برنامه‌های جدید
            </Link>
            <Link href="/questions" className="text-sm hover:text-primary">
              سوالات شرعی
            </Link>
            <Link href="/articles" className="text-sm hover:text-primary">
              مقالات
            </Link>
          </nav>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">تماس با ما</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Mail className="h-4 w-4 text-secondary" />
              <span className="text-sm">info@alhadi.co.uk</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Phone className="h-4 w-4 text-secondary" />
              <span className="text-sm">۰۲۱-۱۲۳۴۵۶۷۸</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="text-sm">لندن، انگلستان</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">خبرنامه</h3>
          <p className="text-sm text-muted-foreground">برای دریافت آخرین اخبار و برنامه‌ها در خبرنامه ما عضو شوید</p>
          <div className="flex space-x-2 space-x-reverse">
            <Input type="email" placeholder="ایمیل خود را وارد کنید" />
            <Button type="submit">عضویت</Button>
          </div>
        </div>
      </div>
      <div className="container mt-8 border-t pt-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} رسانه الهادی - Al-Hadi Media. تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  )
}
