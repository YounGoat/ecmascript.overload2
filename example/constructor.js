/**
 * This example is to prove that:
 *   Overloaded function created by *overload2* may also be used as class constructor.
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

// Create an overloaded function which may be used as class constructor.
var Day = overload2()
	.overload(
		'number',
		function(n) {
			this.day = n;
		}
	)
	.overload(
		overload2.enum('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
		function(name) {
			this.day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
		}
	)
	;

Day.prototype.getName = function() {
 	return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][this.day];
};

var day = new Day('Sun');
assert(day instanceof Day);
assert.equal(day.day, 0);
assert.equal(day.getName(), 'Sun');

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
