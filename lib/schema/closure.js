// ClosureInterface builder
// -------
var ClosureInterface = function(closure) {
  this.allStatements = [];
  closure.call(this, this);
};

var CreatingInterface = function() {};