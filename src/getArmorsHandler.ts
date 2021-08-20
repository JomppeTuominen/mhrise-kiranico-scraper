import Urls from "./enum/Urls";
import fetch from "node-fetch";
import cheerio from "cheerio";
import Armor, { ResistanceMap } from "./types/Armor";
const getResistanceNameForIndex = (index: number): string => {
  const map: ResistanceMap = {
    0: "fire",
    1: "water",
    2: "ice",
    3: "thunder",
    4: "dragon",
  };
  return map[index];
};
const incrementSlotLevels = (
  slotsMap: { level_1: number; level_2: number; level_3: number },
  src?: string
) => {
  if (!src) return slotsMap;
  if (src.includes("deco1")) {
    slotsMap["level_1"]++;
  } else if (src.includes("deco2")) {
    slotsMap["level_2"]++;
  } else if (src.includes("deco3")) {
    slotsMap["level_3"]++;
  }
};
const getSlots = ($: cheerio.Root, $row: cheerio.Cheerio) => {
  const slotsMap = {
    level_1: 0,
    level_2: 0,
    level_3: 0,
  };
  $row.find("td:nth-child(3) > div:nth-child(2) > img").each((_, ele) => {
    const slot = $(ele);
    const src = slot.attr("src");
    incrementSlotLevels(slotsMap, src);
  });
  return slotsMap;
};
const getDefense = ($row: cheerio.Cheerio) => {
  const match = $row
    .find("td:nth-child(4) > div:nth-child(1)")
    .text()
    .trim()
    .match(/\d+/);
  return match?.length ? parseInt(match[0], 10) : undefined;
};
const getResistances = ($: cheerio.Root, $row: cheerio.Cheerio) => {
  const resistances: { [key: string]: number } = {};
  $row.find("td:nth-child(5) > span").each((index, ele) => {
    const span = $(ele);
    const text = span.text();
    if (text?.length > 0)
      resistances[getResistanceNameForIndex(index)] = parseInt(text, 10);
  });
  return resistances;
};
const getSkills = ($: cheerio.Root, $row: cheerio.Cheerio) => {
  const skills: Array<string> = [];
  $row.find("td:nth-child(6) > div").each((index, ele) => {
    const div = $(ele);
    const text = div.text();
    if (text?.length > 0) skills.push(text);
  });
  return skills;
};
const getArmors = async () => {
  const url = Urls.Armors;
  const html = await fetch(url).then((res) => res.text());
  const armors: Array<Armor> = [];
  const $ = cheerio.load(html);
  $("table.divide-y > tbody > tr").each((_, rowElement) => {
    const $row = $(rowElement);

    const name = $row
      .find("td:nth-child(3) > div:nth-child(1) > a")
      .text()
      .trim();
    const idMatch = $row.find("td:nth-child(3) > a").attr('href')?.match(/\d+/);
    const id = idMatch ? idMatch[0] : undefined;
    const slots = getSlots($, $row);
    const defense = getDefense($row);
    const resistances = getResistances($, $row);
    const skills = getSkills($, $row);
    armors.push({
      id,
      name,
      defense,
      resistances,
      slots,
      skills,
    });
  });
  return armors;
};

export default getArmors;
