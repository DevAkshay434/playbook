export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-[20px] animate-pulse">
      <div className="h-[36px] w-[250px] bg-[var(--surface-2)] rounded-[4px]"></div>
      <div className="h-[140px] w-full bg-[var(--surface-2)] rounded-[6px] border border-[var(--line)]"></div>
      
      <div className="flex gap-[15px] mt-[10px]">
        <div className="h-[100px] flex-1 bg-[var(--surface-2)] rounded-[6px] border border-[var(--line)]"></div>
        <div className="h-[100px] flex-1 bg-[var(--surface-2)] rounded-[6px] border border-[var(--line)]"></div>
        <div className="h-[100px] flex-1 bg-[var(--surface-2)] rounded-[6px] border border-[var(--line)] hidden sm:block"></div>
      </div>
      
      <div className="mt-[20px] h-[300px] w-full bg-[var(--surface-2)] rounded-[6px] border border-[var(--line)]"></div>
    </div>
  );
}
