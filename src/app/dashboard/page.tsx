import { verifySession } from "@/lib/dal";
import AdminDashboard from "./admin/page";
import UserDashboard from "./user/page";

export default async function DashboardPage() {
  const session = await verifySession();
  if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  } 
}
