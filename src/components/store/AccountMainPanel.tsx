type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AccountMainPanel({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg min-h-[480px] ${className}`}
    >
      {children}
    </div>
  );
}
