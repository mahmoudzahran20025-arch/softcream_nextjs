export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">عن Soft Cream</h3>
            <p className="text-slate-400">
              طاقة نقية، طعم غني، تغذية ذكية. نقدم لك أفضل منتجات السوفت كريم بمكونات طبيعية 100%.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">الروابط</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition">الرئيسية</a></li>
              <li><a href="#" className="hover:text-white transition">المنتجات</a></li>
              <li><a href="#" className="hover:text-white transition">عن الشركة</a></li>
              <li><a href="#" className="hover:text-white transition">التواصل</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">التواصل</h3>
            <p className="text-slate-400 mb-2">البريد الإلكتروني: info@softcream.com</p>
            <p className="text-slate-400">الهاتف: +20 100 000 0000</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400">
            <p>&copy; {currentYear} Soft Cream. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
