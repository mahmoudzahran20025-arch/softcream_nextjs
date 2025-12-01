import Link from 'next/link'
import { 
  Phone, Mail, MapPin, Clock, Instagram, Facebook, 
  Heart, Sparkles, IceCream, Leaf
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 pt-16 pb-8">
        {/* Top Section - Brand & Newsletter */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <IceCream className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                SOFT CREAM
              </h2>
              <p className="text-slate-400 text-sm">طاقة نقية • طعم غني • تغذية ذكية</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm ml-3">تابعنا:</span>
            <a 
              href="https://instagram.com/softcream" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a 
              href="https://facebook.com/softcream" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

   
     {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              عن Soft Cream
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              نقدم لك أفضل منتجات الآيس كريم الصحي بمكونات طبيعية 100%. 
              سكريات أقل بنسبة 40% مع الحفاظ على الطعم الغني واللذيذ.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Leaf className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">مكونات طبيعية 100%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/#menu" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                  المنيو
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                  عن الشركة
                </Link>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div id="footer-hours">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              ساعات العمل
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between text-slate-400">
                <span>السبت - الخميس</span>
                <span className="text-white font-medium">10 ص - 12 م</span>
              </li>
              <li className="flex justify-between text-slate-400">
                <span>الجمعة</span>
                <span className="text-white font-medium">2 م - 12 م</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                متاح الآن للطلبات
              </p>
            </div>
          </div>

          {/* Contact */}
          <div id="footer-contact">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-400" />
              تواصل معنا
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+201000000000" className="text-slate-400 hover:text-white transition-colors flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-pink-400" />
                  </div>
                  <span dir="ltr">+20 100 000 0000</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@softcream.com" className="text-slate-400 hover:text-white transition-colors flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-pink-400" />
                  </div>
                  info@softcream.com
                </a>
              </li>
              <li>
                <div className="text-slate-400 flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-pink-400" />
                  </div>
                  <span>القاهرة، مصر</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm flex items-center gap-2">
              &copy; {currentYear} Soft Cream. جميع الحقوق محفوظة.
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-slate-500 hover:text-pink-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-slate-500 hover:text-pink-400 transition-colors">
                شروط الاستخدام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
