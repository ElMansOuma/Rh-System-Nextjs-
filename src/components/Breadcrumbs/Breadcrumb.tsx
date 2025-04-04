// components/Breadcrumbs/Breadcrumb.tsx
interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Empty breadcrumb to preserve spacing */}
    </div>
  );
};

export default Breadcrumb;