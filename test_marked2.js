const { marked } = require('marked');
const renderer = new marked.Renderer();
renderer.paragraph = (...args) => {
  console.log('paragraph args:', JSON.stringify(args, null, 2));
  return 'ok';
};
marked.use({ renderer });
marked.parse('hello world');
