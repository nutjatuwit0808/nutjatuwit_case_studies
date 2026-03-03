import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!filename.endsWith(".pmtiles")) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const filePath = path.join(DATA_DIR, filename);

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fileSize = stat.size;
    const rangeHeader = request.headers.get("range");

    const headers: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    };

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
        const actualEnd = Math.min(end, fileSize - 1);
        const chunkLength = actualEnd - start + 1;

        const buffer = Buffer.alloc(chunkLength);
        const fd = await fs.open(filePath, "r");
        await fd.read(buffer, 0, chunkLength, start);
        await fd.close();

        headers["Content-Range"] = `bytes ${start}-${actualEnd}/${fileSize}`;
        headers["Content-Length"] = String(chunkLength);

        return new NextResponse(buffer, {
          status: 206,
          headers,
        });
      }
    }

    const fileBuffer = await fs.readFile(filePath);
    headers["Content-Length"] = String(fileSize);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
