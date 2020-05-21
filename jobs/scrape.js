const { get } = require('axios').default;
const cheerio = require('cheerio');

const { ExternalVehicle } = require('../models');

const websiteBaseUrl = 'https://www.malkey.lk/rates/self-drive-rates.html';

const scrapeContentFromWebsite = async () => {
  try {
    console.log('[INITIAL]: Retrieving vehicle data from external site...');
    const { data } = await get(websiteBaseUrl);
    const $ = cheerio.load(data);

    const vehicleList = [];

    $('.table > tbody:nth-child(2) > tr').each((index, element) => {
      const children = $(element).find('td');
      if (children.length != 4) {
        return;
      }
      const name = $($(children[0])).text();
      const ratePerMonth = parseFloat($($(children[1])).text().replace(',', ''));
      const ratePerWeek = parseFloat($($(children[2])).text().replace(',', ''));
      const over80Km = parseFloat($($(children[3])).text().replace(',', ''));

      vehicleList.push({ name, ratePerMonth, ratePerWeek, over80Km });
    });

    if (vehicleList.length != 0) {
      await ExternalVehicle.destroy({ truncate: true });
      await ExternalVehicle.bulkCreate(vehicleList);
      console.log('[SUCCESS]: Retrieval of vehicle data from external site complete.');
    }
  } catch (err) {
    console.log('[ERROR]: ' + err);
  }
};

module.exports = {
  scrapeContentFromWebsite,
};
