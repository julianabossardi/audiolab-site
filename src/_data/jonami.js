const fs = require("fs");
const path = require("path");

module.exports = () => {
  const file = path.join(__dirname, "../../content/jonami.json");
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
};
