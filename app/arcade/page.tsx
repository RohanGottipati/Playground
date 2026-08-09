import { permanentRedirect } from "next/navigation";

export default function ArcadeRedirect() {
  permanentRedirect("/playground");
}
