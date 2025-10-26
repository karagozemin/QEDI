import NavbarContent from "../NavbarContent";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <NavbarContent />
      {children}
    </div>
  );
};

export default DashboardLayout;