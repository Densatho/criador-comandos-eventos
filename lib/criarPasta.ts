import * as fs from "fs";

export default async function criarPasta(path: string) {
  if (!fs.existsSync(`${path}`)) {
    await fs.mkdirSync(`${path}`);
  }
}
