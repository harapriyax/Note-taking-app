export default function BrandLogo({ light = false }) {
  return (
    <a href="#top" className={`inline-flex items-center gap-2.5 font-extrabold tracking-[-0.04em] ${light ? 'text-white' : 'text-[#1E1938]'}`}>
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-tr from-[#6946EC] to-[#997BFF] text-[15px] font-black text-white shadow-sm shadow-[#7C5CFC]/35">
        N
      </span>
      <span className="text-[19px] tracking-tight">NoteFlow</span>
    </a>
  )
}
