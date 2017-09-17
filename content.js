// Returns negative number if not a transaction page. Otherwise gets price.
function getPrice() {
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

function checkPage() {
  var price = getPrice();
  if (price > 0) {
    found = true;
    var roundUp = getRoundUp(price);
    if (confirm("You can round up and donate " + roundUp.toString() + ". Press OK to add to your donation wallet, or cancel to exit.")) {
      // TODO: Generate ID
      // On auth state changed listener, reacts to changes in the authentication state.
      // firebase.auth(signin)

      var user = firebase.auth().currentUser;
      var ID = user.uid; 

      var cur = firebase.database().ref(ID).child("amount").once("value");
      cur.then(function(snapshot) {
        var snap = snapshot.val();
        if (isNaN(snap)) {
          return 0;
        }
        return snap;
      }).then(function(value) {
        firebase.database().ref(ID).child("amount").set(value + roundUp);
      })
    }
  }
}

var found = false;
checkPage();
document.addEventListener("DOMSubtreeModified", function(event){
  if (!found) {
    checkPage();
  }
});
