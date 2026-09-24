export default function Button({ children, secondary = false, className = '', ...props }) {
  return <button className={`${secondary ? 'btn-secondary' : 'btn-primary'} ${className}`} {...props}>{children}</button>
}
