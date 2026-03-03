#!/usr/bin/env node
/**
 * Fix for deprecated @types/mapbox__point-geometry stub package.
 * The package has no index.d.ts, causing TS2688. This script adds a minimal declaration.
 */
const fs = require("fs");
const path = require("path");

const targetDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "@types",
  "mapbox__point-geometry"
);
const targetFile = path.join(targetDir, "index.d.ts");
const content = `declare module "@mapbox/point-geometry" {
  export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
  }
}
`;

if (fs.existsSync(targetDir)) {
  fs.writeFileSync(targetFile, content);
  console.log("Fixed @types/mapbox__point-geometry");
}
