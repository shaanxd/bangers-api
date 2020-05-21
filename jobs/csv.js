const axios = require('axios').default;
const { License } = require('../models');

const { CSV_BASE_URL, CSV_USERNAME, CSV_PASSWORD } = process.env;

const readCsvFromServer = async () => {
  try {
    console.log('[INITIAL]: Starting csv authentication from DMV.');
    const response = await axios.post(`${CSV_BASE_URL}/authenticate`, {
      username: CSV_USERNAME,
      password: CSV_PASSWORD,
    });
    console.log('[SUCCESS]: Successfully authenticated from DMV.');

    const {
      data: { token },
    } = response;

    console.log('[INITIAL]: Retrieving missing and stolen licenses from DMV.');
    const file = await axios.post(`${CSV_BASE_URL}/get-file`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('[SUCCESS]: Successfully retrieved missing and stolen licenses from DMV');

    const {
      data: { licenses },
    } = file;

    console.log('[INITIAL]: Saving license information to local database.');
    await License.destroy({ truncate: true });

    await License.bulkCreate(licenses);
    console.log('[SUCCESS]: Successfully saved license information to local database.');
  } catch (err) {
    console.log(
      '[ERROR]: Error occurred while retrieving missing and stolen license information. Please contact DMV for futher information.'
    );
  }
};

module.exports = {
  readCsvFromServer,
};
