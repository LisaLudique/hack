function getPrice() {
  // Returns negative number if not a transaction page. Otherwise gets price.
};

function getRoundUp() {
  // Returns appropriate roundup amount.
}

var price = getPrice();
if (price > 0) {
  var roundUp = getRoundUp(price);
}
if (confirm("You can round up and donate " + roundUp.toString() + ". Press OK to donate, or cancel to exit.")) {
  // User pressed "OK" and decided to pay.
} else {
  // User didn't want to pay.
}
