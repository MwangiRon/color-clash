class GameRenderer {
  static renderCell(cell, index, value, useIcons = true) {
    cell.classList.remove("red-piece", "blue-piece", "occupied");
    cell.innerHTML = "";

    if (value === "red") {
      cell.classList.add("red-piece", "occupied");
      this.addPieceContent(cell, "red", useIcons);
    } else if (value === "blue") {
      cell.classList.add("blue-piece", "occupied");
      this.addPieceContent(cell, "blue", useIcons);
    } else {
      cell.textContent = index;
      cell.classList.add("text-gray-400", "dark:text-gray-600");
    }
  }

  static addPieceContent(cell, color, useIcons) {
    if (useIcons) {
      const icon = document.createElement("span");
      icon.className = "material-icons text-white text-4xl";
      icon.textContent = "circle";
      cell.appendChild(icon);
    } else {
      cell.textContent = "●";
    }
  }
}

// For Node.js environments (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = GameRenderer;
}
