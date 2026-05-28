interface StudentInfoSectionProps {
  className_: string;
}

export function StudentInfoSection({ className_ }: StudentInfoSectionProps) {
  return (
    <div className="border-b border-gray-200 px-6 lg:px-10 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>Name:</span>
          <span className="flex-1 border-b border-dashed border-gray-300 min-w-[80px]" />
        </div>
        <div className="flex items-center gap-1">
          <span>Roll No:</span>
          <span className="flex-1 border-b border-dashed border-gray-300 min-w-[60px]" />
        </div>
        <div className="flex items-center gap-1">
          <span>Class: {className_}</span>
          <span className="ml-2">Section:</span>
          <span className="flex-1 border-b border-dashed border-gray-300 min-w-[40px]" />
        </div>
      </div>
    </div>
  );
}
