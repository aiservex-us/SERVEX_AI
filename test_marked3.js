const { marked } = require('marked');
const renderer = new marked.Renderer();

renderer.paragraph = function(token) {
  // Try to parse inline tokens
  let text = '';
  if (token.tokens) {
    text = this.parser.parseInline(token.tokens);
  } else {
    text = token.text;
  }
  return `<p class="test">${text}</p>`;
};

marked.use({ renderer });
console.log(marked.parse('hello **bold** world'));
