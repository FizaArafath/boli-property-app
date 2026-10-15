import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard"); // dashboard bounces to /login if not authenticated
}
