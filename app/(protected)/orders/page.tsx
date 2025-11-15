import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomers } from "@/app/action/customer";
import { getServices } from "@/app/action/service";
import { OrderFormWrapper } from "@/components/order-form-wrapper";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/signin");
  }

  // Fetch customers and services
  const [customers, services] = await Promise.all([
    getCustomers(),
    getServices(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="">
          {/* Order Form */}
          <div>
            <OrderFormWrapper customers={customers} services={services} />
          </div>
        </div>
      </div>
    </div>
  );
}
