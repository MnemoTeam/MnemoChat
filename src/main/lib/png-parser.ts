/**
 * Node.js PNG parser for character card extraction.
 * Accepts Buffer instead of File (mirrors renderer's png-metadata.ts).
 */

interface CharaCardData {
  name: string;
  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  alternate_greetings?: string[];
  system_prompt?: string;
  post_history_instructions?: string;
  creator_notes?: string;
  tags?: string[];
  creator?: string;
  character_version?: string;
}

export interface ParsedCharacterCard {
  name: string;
  description: string | null;
  personality: string | null;
  scenario: string | null;
  firstMessage: string | null;
  alternateGreetings: string[];
  systemPrompt: string | null;
  postHistoryInstructions: string | null;
  exampleDialogues: string[];
  creatorNotes: string | null;
  tags: string[];
  creatorName: string | null;
  characterVersion: string | null;
  specVersion: string;
}

export function extractCharacterFromBuffer(buffer: Buffer): ParsedCharacterCard | null {
  // Verify PNG signature
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return null;
  }

  let pos = 8;
  while (pos < buffer.length) {
    const length = buffer.readUInt32BE(pos);
    const chunkType = buffer.toString("latin1", pos + 4, pos + 8);

    if (chunkType === "tEXt") {
      const chunkData = buffer.subarray(pos + 8, pos + 8 + length);

      const nullIdx = chunkData.indexOf(0);
      if (nullIdx !== -1) {
        const keyword = chunkData.toString("latin1", 0, nullIdx);

        if (keyword === "chara") {
          const b64Str = chunkData.toString("latin1", nullIdx + 1);
          try {
            const jsonStr = Buffer.from(b64Str, "base64").toString("utf-8");
            const json = JSON.parse(jsonStr);
            return parseCharacterJson(json);
          } catch (e) {
            console.error("Failed to decode chara tEXt chunk:", e);
            return null;
          }
        }
      }
    }

    if (chunkType === "IEND") break;
    pos += 12 + length;
  }

  return null;
}

export function parseCharacterJson(json: unknown): ParsedCharacterCard {
  const obj = json as Record<string, unknown>;
  const data = (obj.data as CharaCardData) || (obj as unknown as CharaCardData);
  const spec = (obj.spec as string) || "";
  const specVersion = spec.includes("v3") ? "v2" : spec.includes("v2") ? "v2" : "v1";

  const exampleDialogues: string[] = [];
  if (data.mes_example) {
    const parts = data.mes_example
      .split(/<START>/gi)
      .map((s) => s.trim())
      .filter(Boolean);
    exampleDialogues.push(...parts);
  }

  return {
    name: data.name || "Unknown",
    description: data.description || null,
    personality: data.personality || null,
    scenario: data.scenario || null,
    firstMessage: data.first_mes || null,
    alternateGreetings: data.alternate_greetings || [],
    systemPrompt: data.system_prompt || null,
    postHistoryInstructions: data.post_history_instructions || null,
    exampleDialogues,
    creatorNotes: data.creator_notes || null,
    tags: data.tags || [],
    creatorName: data.creator || null,
    characterVersion: data.character_version || null,
    specVersion,
  };
}
