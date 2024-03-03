const puppeteer = require("puppeteer");
const fs = require("fs");

const baseUrl = "https://jo.opensooq.com/ar";

const getPageListings = async (pageNumber) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    baseUrl.concat("/سيارات-ومركبات/سيارات-للبيع?search=true&page=", pageNumber)
  );

  const json = await page.evaluate(() => {
    const scriptTag = document.getElementById("__NEXT_DATA__");
    if (scriptTag) {
      const jsonData = JSON.parse(scriptTag.textContent);
      return jsonData;
    } else {
      return null;
    }
  });

  await browser.close();
  return json.props.pageProps.serpApiResponse.listings.items;
};

const getListingsDetails = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(baseUrl.concat(url));

  const json = await page.evaluate(() => {
    const scriptTag = document.getElementById("__NEXT_DATA__");
    if (scriptTag) {
      const jsonData = JSON.parse(scriptTag.textContent);
      return jsonData;
    } else {
      return null;
    }
  });

  const data = fs.readFileSync(`allData.json`);

  const jsonData = JSON.parse(data);
  jsonData.push(json.props.pageProps.postData.listing);
  console.log("jsonData ammount", jsonData.length);
  fs.writeFile(`allData.json`, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) throw err;
  });

  await browser.close();
};
(async function () {
  for (let pagen = 1; pagen < 1817; pagen++) {
    console.log("page number: ", pagen);
    const jsonData = await getPageListings(pagen);

    for (let i = 0; i < jsonData.length; i++) {
      const postPath = jsonData[i].post_url;
      await getListingsDetails(postPath);
    }
  }
})();
