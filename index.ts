import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from "fs";
import getArmors from "./src/getArmorsHandler";
import Item from "./src/types/Item";
import { batchWrite } from "./src/db/writeToDynamoDB";
import config from "./config.json";
import Armor from "./src/types/Armor";
type Decoration = {
  name: string;
  description: string;
  unlock: Array<string>;
  materials: Array<string>;
};

enum Urls {
  Items = "https://mhrise.kiranico.com/data/items/",
  Decorations = "https://mhrise.kiranico.com/data/decorations",
  Armors = "https://mhrise.kiranico.com/data/armors",
}
const getDecorations = async (): Promise<Array<Decoration>> => {
  const url = Urls.Decorations;
  const html = await fetch(url).then((res) => res.text());
  const decorations: Array<Decoration> = [];
  const $ = cheerio.load(html);
  $("table.divide-y > tbody > tr").each((_, rowElement) => {
    const $row = $(rowElement);
    const name = $row.find("td:nth-child(1)").text().trim();
    const description = $row
      .find("td:nth-child(2) > div:nth-child(1)")
      .text()
      .trim();
    const unlock: Array<string> = [];
    const materials: Array<string> = [];
    $row.find("td:nth-child(3) > div").each((_, ele) => {
      const div = $(ele);
      const text = div.text();
      if (text?.length > 0) unlock.push(text);
    });
    $row.find("td:nth-child(4) > div").each((_, ele) => {
      const div = $(ele);
      const text = div.text();
      if (text?.length > 0) materials.push(text);
    });

    decorations.push({
      name,
      description,
      unlock,
      materials,
    });
  });
  return decorations;
};
const getItems = async () => {
  const url = Urls.Items;
  const html = await fetch(url).then((res) => res.text());
  const items: Array<Item> = [];
  const $ = cheerio.load(html);
  $("table.divide-y > tbody > tr").each((_, rowElement) => {
    const $row = $(rowElement);
    const iconUrl = $row.find("td > a > img").attr("src");
    const idMatch = $row.find("td > a").attr('href')?.match(/\d+/);
    const id = idMatch ? idMatch[0] : undefined;
    const name = $row.find("td:eq(0)").text().trim();
    const description = $row.find("td:eq(1)").text().trim();

    items.push({
      id,
      name,
      description,
      iconUrl,
    });
  });
  return items;
};

const init = async () => {
  const items = await getItems();
  const decorations = await getDecorations();
  const armors = await getArmors();

  try {
    await writeItemsToDB(items);
    await writeDecosToDB(decorations);
    await writeArmorsToDB(armors);
  } catch (e) {
    console.log("error persisting to db:", e);
  }
};

init()
  .then((res) => console.log("done!"))
  .catch((e) => console.error("error", e));


  const writeItemsToDB = async (items: Array<Item>) => {
    if(items.length > 0) {
      await batchWrite(items, config.itemsTable)
    } else {
      console.error('Did not get items');
    }
  }
  const writeDecosToDB = async (decos: Array<Decoration>) => {
    if(decos.length > 0) {
      await batchWrite(decos, config.decosTable)
    } else {
      console.error('Did not get decos');
    }
  }
  const writeArmorsToDB = async (armors: Array<Armor>) => {
    if(armors.length > 0) {
      await batchWrite(armors, config.armorsTable)
    } else {
      console.error('Did not get armors');
    }
  }