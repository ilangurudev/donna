import { redirect } from "next/navigation";

import { getUser } from "@/app/actions/auth";
import { GlowyOrb } from "@/components/glowy-orb";

export default async function AppPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <GlowyOrb />;
}
