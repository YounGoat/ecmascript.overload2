/**
 * This example is to show how to define mutable params.
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

var add = overload2()
	.overload('number *', function(numbers) {
		var ret = 0;
		numbers.forEach(function(number) { ret += number; })
		return ret;
	})
	.overload('boolean {2,3}', function(bools) {
		var ret = false;
		for (var i = 0; !ret && i < bools.length; i++) {
			ret = bools[i];
		}
		return ret;
	})
	;

assert.equal(10, add(1,2,3,4));
assert.equal(false, add(false, false));
assert.equal(true, add(false, false, true));
try {
	add(false);
} catch(ex) {
	assert(ex instanceof overload2.UnmatchingException);
}

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
