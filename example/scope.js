/**
 * This example is to prove that:
 *   A function created by *overload2* may also be invoked by .apply(), .call(), as normal functions do.
 *   And, it may also be bound to specified scope with .bind().
 *
 * @author youngoat@163.com
 */

const assert = require('assert');
const overload2 = require('overload2');

function Person(name) {
	this.name = name;
}

Person.prototype.getName = overload2()
	.overload(function() { return this.name; })
	.overload(overload2.enum('UPPERCASE', 'U'), function() { return this.name.toUpperCase(); })
	.overload(overload2.enum('lowercase', 'l'), function() { return this.name.toLowerCase(); })
	;

var p = new Person('Jack');

var ret = p.getName();
assert.equal(ret, 'Jack');

var ret = p.getName('U');
assert.equal(ret, 'JACK');

var ret = p.getName.apply({ name: 'Mary' });
assert.equal(ret, 'Mary');

var ret = p.getName.call({ name: 'Mary' }, 'l');
assert.equal(ret, 'mary');

var ret = p.getName.bind(p).apply({ name: 'Mary' });
assert.equal(ret, 'Jack');

console.log('THIS LINE REACHED MEANS EVERYTHING IS OK.');
