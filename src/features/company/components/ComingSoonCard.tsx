interface ComingSoonCardProps {
  icon: string;
  title: string;
  description?: string;
}

export default function ComingSoonCard({
  icon,
  title,
  description,
}: ComingSoonCardProps) {
  return (
    <div className="relative bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white pointer-events-none" />
      <div className="relative">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className={`${icon} text-2xl text-gray-400`} />
        </div>
        <span className="inline-block bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          Coming Soon
        </span>
        <h3 className="font-bold text-dark mb-1">{title}</h3>
        {description && (
          <p className="text-gray-400 text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}
