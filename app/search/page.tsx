import fs from "node:fs"
import path from "node:path"
import { SearchPage } from "@/components/search-page"
import type { SearchEntry } from "@/lib/search"

export const metadata = {
  title: "Search — OpenBox Docs",
  description: "Search all OpenBox documentation.",
}

export default function SearchRoute() {
  const indexPath = path.join(process.cwd(), "public", "docs-index.json")
  const entries: SearchEntry[] = JSON.parse(fs.readFileSync(indexPath, "utf8"))
  return <SearchPage entries={entries} />
}
