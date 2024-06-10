import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import { toast } from "sonner";

export default function Home() {
  toast("Event has been created.");
  return <></>;
}
