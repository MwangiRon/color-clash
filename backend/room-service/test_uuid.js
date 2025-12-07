const { v4: uuidv4 } = require("uuid");
try {
  const id = uuidv4();
  console.log("Generated UUID:", id);
} catch (e) {
  console.error("Error generating UUID:", e);
}
