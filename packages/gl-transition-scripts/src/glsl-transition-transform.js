//@flow
import program from "commander";
import fs from "fs";
import path from "path";
import transform from "./transform";

// FIXME later if needed, can do more commands, like per file transforming
program
  .version("0.0.1")
  .option("-d, --glsl-dir <dir>", "a folder containing *.glsl files")
  .option(
    "-o, --json-out <jsonOutputFile>",
    "a JSON file to save with all transitions"
  )
  .parse(process.argv);

const { glslDir, jsonOut } = program;

const ms = (n: number) => (n < 1 ? n.toFixed(2) : Math.round(n)) + "ms";

const files = fs.readdirSync(glslDir).filter(n => n.match(/^.*\.glsl$/));
const transitions = [];
console.log(files.length + " transitions to transform...");
console.log("");
files.forEach(filename => {
  const glsl = fs.readFileSync(path.join(glslDir, filename), "utf-8");
  const result = transform(filename, glsl);
  if (result.errors.length > 0) {
    console.log(` ✕ ${result.data.transition.name}`);
    console.log("");
    result.errors.forEach(e => {
      console.error(`   ${e.message}`);
    });
    console.log("");
  } else {
    console.log(
      ` ✔︎ ${result.data.transition.name} (compile in ${ms(result.data.compilation.compileTime)}, draw in ${ms(result.data.compilation.drawTime)})`
    );
    transitions.push(result.data.transition);
  }
  return result;
});
console.log("");
if (transitions.length === files.length) {
  // all pass!
  fs.writeFileSync(jsonOut, JSON.stringify(transitions));
  console.log(transitions.length + " transitions exported in " + jsonOut);
  process.exit(0);
} else {
  console.error(
    files.length -
      transitions.length +
      " transitions have failed to pass validation."
  );
  process.exit(1);
}
