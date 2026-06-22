export function TableContainer({
  children,
  minWidth = "640px",
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}
