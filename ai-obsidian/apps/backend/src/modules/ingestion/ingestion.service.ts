import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import path from "node:path";
import { loadVaultNotes } from "@ai-obsidian/obsidian-adapter";
import type { NoteChunk } from "@ai-obsidian/shared";
import { WORKSHOP_SAMPLE_VAULT_RELATIVE_PATH } from "@ai-obsidian/shared";
import type { AppEnv } from "../../config/env.validation";
import { makeChunkId, splitNoteIntoChunkTexts } from "./chunk-note";
import { VectorStoreService } from "../retrieval/vector-store.service";

@Injectable()
export class IngestionService {
  constructor(
    @Inject(VectorStoreService) private readonly vectorStore: VectorStoreService,
    @Inject(ConfigService) private readonly config: ConfigService<AppEnv, true>,
  ) {}

  /** อ่าน vault แล้วแบ่งเป็น chunk เก็บใน vector store (in-memory) */
  async ingestVault(vaultPath: string): Promise<{ noteCount: number; chunkCount: number }> {
    const vaultGlob = this.config.get("VAULT_GLOB", { infer: true });
    const notes = await loadVaultNotes(vaultPath, vaultGlob);
    const chunks: NoteChunk[] = notes.flatMap((note) =>
      splitNoteIntoChunkTexts(note.path, note.title, note.content).map((content, index) => ({
        notePath: note.path,
        title: note.title,
        content,
        chunkId: makeChunkId(note.path, index + 1),
      })),
    );

    this.vectorStore.replaceAll(chunks);
    return { noteCount: notes.length, chunkCount: chunks.length };
  }

  /** path ตัวอย่าง vault ใน repo (รัน seed หรือ dev จาก apps/backend) */
  resolveDefaultVaultPath() {
    return path.resolve(process.cwd(), WORKSHOP_SAMPLE_VAULT_RELATIVE_PATH);
  }
}
