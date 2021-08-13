import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
enum Urls {
  Items = 'https://mhrise.kiranico.com/data/items/',
  Decorations = 'https://mhrise.kiranico.com/data/decorations',
}
const getDecorations = async () => {
  const url = Urls.Decorations;
  const html = await fetch(url).then(res => res.text());
  const decorations = [];
  const $ = cheerio.load(html);
  $('table.divide-y > tbody > tr').each((_, rowElement) => {
    const $row = $(rowElement);
    const name = $row.find('td:nth-child(1)').text().trim();
    const description = $row.find('td:nth-child(2) > div:nth-child(1)').text().trim();
    const unlock = [];
    const materials = [];
    $row.find('td:nth-child(3) > div').each((_, ele) => {
      const div = $(ele);
      const text = div.text();
      if(text?.length > 0)
        unlock.push(text);
    })
    $row.find('td:nth-child(4) > div').each((_, ele) => {
      const div = $(ele);
      const text = div.text();
      if(text?.length > 0)
        materials.push(text)
    })
    
    decorations.push({
      name,
      description,
      unlock,
      materials,
    });
  });
  return decorations;
}
const getItems = async () => {
  const url = Urls.Items;
  const html = await fetch(url).then(res => res.text());
  const items = [];
  const $ = cheerio.load(html);
  $('table.divide-y > tbody > tr').each((_, rowElement) => {
    const $row = $(rowElement);
    const iconUrl = $row.find('td > a > img').attr('src');
    const name = $row.find('td:eq(0)').text().trim();
    const description = $row.find('td:eq(1)').text().trim();
    
    items.push({
      name,
      description,
      iconUrl,
    });
  });
  return items;
}
const init = async () => {
  const items = await getItems();
  const decorations = await getDecorations();
    try {
      fs.writeFileSync('dist/items.json', JSON.stringify(items, null, 2));
      fs.writeFileSync('dist/decorations.json', JSON.stringify(decorations, null, 2))
    } catch(e) {
      console.log('error writing to file:',e);
    }
}

init();

