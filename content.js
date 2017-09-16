function getPrice() {
  // Returns negative number if not a transaction page. Otherwise gets price.
};

function getRoundUp() {
  // Re
}

var price = getPrice();
if (price > 0) {
  var roundUp = getRoundUp(price);
}
if (confirm("You can round up and donate " + roundUp.toString())) {
  // User pressed "OK" and decided to pay.
} else {
  // User didn't want to pay.
}
