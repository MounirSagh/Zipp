// encode.js
function toCode(id) {
  return Buffer.from(id, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Take the restaurantId from the command line
const input = process.argv[2];
if (!input) {
  console.error("❌ Usage: node encode.js <restaurantId>");
  process.exit(1);
}

console.log(toCode(input));