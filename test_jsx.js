const fs = require('fs');
const filePath = '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_XML_Seatings/components/comparePDF/aiReporting/compnents/ViewportGraphics.jsx';
const content = fs.readFileSync(filePath, 'utf-8');

try {
  // simple check: count open and close tags for motion.div and CardContainer and div
  console.log("motion.div opens:", (content.match(/<motion\.div/g) || []).length);
  console.log("motion.div closes:", (content.match(/<\/motion\.div>/g) || []).length);
  console.log("CardContainer opens:", (content.match(/<CardContainer/g) || []).length);
  console.log("CardContainer closes:", (content.match(/<\/CardContainer>/g) || []).length);
  
  // Try to use babel to parse the file to ensure validity
} catch (e) {
  console.error("Error", e);
}
