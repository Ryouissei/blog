const { NotionAPI } = require('notion-client');
async function testNotion() {
  const api = new NotionAPI();
  const id = 'ce88676e-36d1-4571-9c59-4641c259b67a';
  try {
    const response = await api.getPage(id);
    const collection = Object.values(response.collection || {})[0];
    console.log("Collection keys:", Object.keys(collection || {}));
    if (collection) console.log("Collection format:", Object.keys(collection.value || {}));
  } catch (err) {
    console.error("Error:", err);
  }
}
testNotion();
