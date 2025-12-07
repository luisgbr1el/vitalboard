import fs from "fs";
import path from "path";

export function readJson(filePath, fallback = null) {
  const full = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  try {
    if (!fs.existsSync(full)) {
      if (fallback !== null) {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, JSON.stringify(fallback, null, 2));
        return fallback;
      }
      return null;
    }
    const raw = fs.readFileSync(full, "utf-8");
    if (!raw || raw.trim() === "") {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("readJson error:", err);
    return fallback;
  }
}

export function writeJson(filePath, data) {
  const full = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  try {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(full, jsonString, "utf-8");
  } catch (error) {
    throw error;
  }
}