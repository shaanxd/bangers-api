const moment = require('moment');

exports.calculateTotalPrice = (startDate, endDate, vehiclePrice) => {
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);

  const difference = this.getDifferenceInHours(startDate, endDate);

  const days = Math.floor(difference / 24);

  const hoursLeft = difference % 24;

  let totalPrice = days * vehiclePrice;

  if (hoursLeft > 5) {
    totalPrice += vehiclePrice;
  } else if (hoursLeft > 1) {
    totalPrice += vehiclePrice / 2;
  }

  return totalPrice;
};

exports.getDifferenceInHours = (startDate, endDate) => {
  return moment.duration(moment(endDate).diff(moment(startDate))).asHours();
};

exports.getDifferenceInWeeks = (startDate, endDate) => {
  return moment.duration(moment(endDate).diff(moment(startDate))).asWeeks();
};

exports.getDifferenceInMonths = (date) => {
  return moment.duration(moment().diff(moment(date))).asMonths();
};
