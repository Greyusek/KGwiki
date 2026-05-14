import { redirect } from "next/navigation";

export default function MyPageAlias() {
  redirect("/profile");
}
