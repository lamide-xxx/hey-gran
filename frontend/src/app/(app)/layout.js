import BottomNav from "../BottomNav";

export default function AppLayout({ children }) {
  return (
    <div className="pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
