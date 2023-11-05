const date1 = new Date(0);
date1.setUTCHours(10);

const date2 = new Date(0);
date2.setUTCHours(1, 30);

const date3 = new Date();

const startTime = date1.toLocaleTimeString();
const endTime = date2.toLocaleTimeString();
const currentTime = date3.toLocaleTimeString();

console.log(startTime <= currentTime && currentTime <= endTime);
