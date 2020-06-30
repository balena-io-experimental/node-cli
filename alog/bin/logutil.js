module.exports = {
  dispatch: function(line, serviceIds) {
    // For now, just print it out
    lineId = line.serviceId.toString();
    console.log("Oh look, a message from", serviceIds[lineId], ":", line.message);
    // this.print(line);
  },
  print: function(line) {
    console.log(line);
  }
};
