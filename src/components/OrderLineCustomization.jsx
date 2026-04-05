import { formatCustomizationLines } from '../utils/cartCustomization'

/** Μικρή εμφάνιση επιλογών γραμμής παραγγελίας (καλάθι, checkout, admin) */
export default function OrderLineCustomization({ customization, variant = 'customer' }) {
  const lines = formatCustomizationLines(customization)
  if (lines.length === 0) return null

  const labelCls =
    variant === 'admin'
      ? 'text-[10px] font-black uppercase text-slate-500'
      : 'text-[10px] font-bold uppercase text-gray-500'
  const textCls = variant === 'admin' ? 'text-xs text-slate-700' : 'text-xs text-gray-700'
  const boxCls =
    variant === 'admin'
      ? 'mt-1.5 pl-2 border-l-2 border-amber-400 space-y-1'
      : 'mt-1.5 pl-2 border-l-2 border-red-200 space-y-1'

  return (
    <div className={boxCls}>
      {lines.map(({ label, text }) => (
        <p key={label} className={textCls}>
          <span className={labelCls}>{label}: </span>
          {text}
        </p>
      ))}
    </div>
  )
}
