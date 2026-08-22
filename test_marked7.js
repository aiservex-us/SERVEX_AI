const { marked } = require('marked');

marked.use({
  renderer: {
    paragraph(token) {
      const text = this.parser.parseInline(token.tokens);
      return `<p class="leading-relaxed mb-4 text-gray-700">${text}</p>`;
    },
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      const level = token.depth;
      return `<h${level} class="heading">${text}</h${level}>`;
    },
    blockquote(token) {
      const body = this.parser.parse(token.tokens);
      return `<blockquote class="bq">${body}</blockquote>`;
    },
    list(token) {
      const body = this.parser.parse(token.items);
      const tag = token.ordered ? 'ol' : 'ul';
      return `<${tag} class="list">${body}</${tag}>`;
    },
    list_item(token) {
      const text = this.parser.parse(token.tokens);
      return `<li>${text}</li>`;
    },
    code(token) {
      return `<pre><code>${token.text}</code></pre>`;
    },
    codespan(token) {
      return `<code>${token.text}</code>`;
    },
    table(token) {
      let header = '';
      for (let j = 0; j < token.header.length; j++) {
        header += this.tablecell(token.header[j]);
      }
      
      let body = '';
      for (let j = 0; j < token.rows.length; j++) {
        let row = '';
        for (let k = 0; k < token.rows[j].length; k++) {
          row += this.tablecell(token.rows[j][k]);
        }
        body += this.tablerow({ type: 'table_row', text: row });
      }
      return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
    },
    table_row(token) {
      return `<tr>${token.text}</tr>`;
    },
    tablecell(token) {
      const content = this.parser.parseInline(token.tokens);
      const type = token.header ? 'th' : 'td';
      return `<${type}>${content}</${type}>`;
    }
  }
});

const md = `
# Heading
Paragraph with \`code\` and **bold**
> blockquote
- list item 1
- list item 2

| a | b |
|---|---|
| 1 | 2 |

\`\`\`js
code block
\`\`\`
`;
console.log(marked.parse(md));
