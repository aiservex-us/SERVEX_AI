const { marked } = require('marked');
console.log(typeof marked.parse('test'));
try {
  const renderer = new marked.Renderer();
  renderer.paragraph = (text) => `<p class="test">${text}</p>`;
  marked.setOptions({ renderer });
  console.log('With setOptions:', marked.parse('test'));
} catch (e) {
  console.log('Error setOptions:', e);
}

try {
  const renderer = new marked.Renderer();
  renderer.paragraph = (text) => `<p class="test">${text}</p>`;
  marked.use({ renderer });
  console.log('With use:', marked.parse('test'));
} catch (e) {
  console.log('Error use:', e);
}
