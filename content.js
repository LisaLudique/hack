function getPrice() {
  // Returns negative number if not a transaction page. Otherwise gets price.
  var elts = document.getElementsByClassName("grand-total-price");
  if (elts.length) {
    var total = elts[0].innerHTML;
    total = Number(total.replace(/[^0-9\.-]+/g,""));
    return parseFloat(total);
  }
  return -1;
};

function getRoundUp(total) {
  return parseFloat((Math.ceil(total) - total).toFixed(2));
};

var price = getPrice();
if (price > 0) {
  var roundUp = getRoundUp(price);
  if (confirm("You can round up and donate " + roundUp.toString() + ". Press OK to add to your donation wallet, or cancel to exit.")) {
    // User pressed "OK" and decided to pay.
    // TODO: Update wallet in database.
  }
}
