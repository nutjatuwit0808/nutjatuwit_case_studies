import { readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import matter from "gray-matter";

export type ParsedNote = {
  path: string;
  title: string;
  content: string;
  headings: string[];
  tags: string[];
};

/**
 * อ่านไฟล์ใน Obsidian vault (โฟลเดอร์บนดิสก์) ตาม glob แล้วแปลงเป็นข้อมูลที่พร้อม ingest
 * @param globPattern ค่าเริ่มต้นเฉพาะนามสกุล md — ตั้งผ่าน env `VAULT_GLOB` ใน backend ได้
 */
export async function loadVaultNotes(
  vaultPath: string,
  globPattern: string = "**/*.md",
): Promise<ParsedNote[]> {
  const filePaths = await glob(globPattern, {
    cwd: vaultPath,
    absolute: true,
  });

  const notes: ParsedNote[] = [];
  for (const absolutePath of filePaths) {
    const raw = await readFile(absolutePath, "utf8");
    const parsed = matter(raw);
    const content = parsed.content.trim();
    const baseName = path.basename(absolutePath, path.extname(absolutePath));
    const noteTitle = String(parsed.data.title ?? baseName);
    const relativePath = path.relative(vaultPath, absolutePath);

    notes.push({
      path: relativePath,
      title: noteTitle,
      content,
      headings: extractHeadings(content),
      tags: extractTags(content),
    });
  }

  return notes;
}

// ฟังก์ชันนี้ดึงหัวข้อ markdown (#, ##, ###) เพื่อช่วยทำ retrieval ให้แม่นขึ้น
function extractHeadings(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("#"))
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean);
}

// ฟังก์ชันนี้ดึงแท็กจากรูปแบบ #tag ที่อยู่ในโน้ต
function extractTags(content: string): string[] {
  const matches = content.match(/(^|\s)#([a-zA-Z0-9/_-]+)/g) ?? [];
  return matches.map((tag) => tag.trim().replace(/^#/, ""));
}
