interface EmptyStateProps {
  icon?: string; // Font Awesome class e.g. "fas fa-briefcase"
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <i className={`${icon} text-2xl text-gray-400`} />
        </div>
      )}
      <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
