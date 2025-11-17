import { redirect } from "next/navigation";

import { getUser } from "@/app/actions/auth";
import { GlowyOrb } from "@/components/glowy-orb";

export default async function AppPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Extract first name from user metadata
  // Google OAuth typically provides full_name, we'll split it to get first name
  let firstName = "there"; // Default fallback

  if (user.user_metadata?.full_name) {
    firstName = user.user_metadata.full_name.split(" ")[0];
  } else if (user.user_metadata?.name) {
    firstName = user.user_metadata.name.split(" ")[0];
  } else if (user.email) {
    // Fallback to email username
    firstName = user.email.split("@")[0];
  }

  return <GlowyOrb firstName={firstName} />;
}
