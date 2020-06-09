const fs = require('fs');
const sendgridMail = require('@sendgrid/mail');
const path = require('path');

const to = 'shaahid.xd@gmail.com';
const from = 'no-reply@bangers.com';
const fileContent = fs.readFileSync(path.join(__dirname, '../templates/email-template.html'), { encoding: 'utf-8' });

const sendDmvMail = async (LICENSE_NUMBER, LICENSE_IMAGE) => {
  const html = fileContent.replace(
    /LICENSE_NUMBER|LICENSE_IMAGE/gi,
    (matched) =>
      ({
        LICENSE_NUMBER,
        LICENSE_IMAGE: `http://localhost:8000${LICENSE_IMAGE}`,
      }[matched])
  );

  sendgridMail
    .send({
      to,
      from,
      subject: 'Stolen or Missing License',
      html,
    })
    .then((result) => {
      console.log('[SUCCESS]: Mail sent to DMV successfully!');
    })
    .catch((err) => {
      console.log('[ERROR]: Error occured while sending mail to DMV');
    });
};

module.exports = {
  sendDmvMail,
};
