/**
 * 函数多态的中量级实现。
 * @author youngoat@163.com
 */

(function(global, undefined) {

	var MODULE_REQUIRE
		/* built-in */
		// NOTHING
		// 考虑到浏览器场景，不依赖 Node.js 内置模块。

		/* NPM */
		// NOTHING.
		// 作为一个接近语言层面的基础模块，不依赖任何第三方模块。

		/* in-package */

		/**
		 * 声明一个自定义异常类。
		 * @param {String} name
		 * @param {ENUM(Error, SyntaxError, ...)}  parent
		 */
		, declareException = function declareException(name, parent, constructorFunction) {
			if (!parent) parent = Error;

			var Ex = function(/*String*/ message) {
				this.name = 'OVERLOAD2.' + name;

				if (constructorFunction) {
					constructorFunction.apply(this, arguments);
				}
				else {
					this.message = message;
				}

				var err = new parent;
				this.stack = [ this.name + ': ' + this.message ].concat( err.stack.split('\n').slice(2) ).join('\n');
			};

			Ex.prototype = Object.create(parent.prototype);
			Ex.prototype.consturctor = Ex;
			Ex.prototype.toString = Ex.prototype.valueOf = function() {
				return '[' + this.name + ': ' + this.message + ']';
			};

			Object.defineProperty(Ex, 'name', { value: name });

			return Ex;
		}

		// 自定义错误。
		// 因为 overload 带有强类型语言特征，故此我们在其使用过程中，对于输入参数采取了尽量严格的标准，在所有不合规或可疑的地方，均会抛出自定义错误，以避免歧义和隐患。
		// 同时，我们在自定义错误的设计上也尽量遵循了准确和具有建设性的原则。
		, ERR = {
			Generic: declareException('Error'),

			Arguments: declareException('ArgumentsError', TypeError, function(/*number*/ expected, /*number*/ actual) {
				this.message = expected + ' argument(s) expected but actual ' + actual;
			}),

			Type: declareException('TypeError', TypeError, function(/*string*/ desc, /*string|Array*/ types, /*string*/ actual) {
			 	this.message = desc + ' must be ' + ( typeof types == 'string' ? types : types.join(' | ') ) + ': ' + actual;
			}),

			Range: declareException('RangeError', RangeError, function(/*string*/ desc, /*string|Array*/ info, /*string*/ actual) {
				if (info instanceof Array) {
					info = info.join(' | ');
				}
				this.message = desc + ' must be ' + info + ': ' + actual;
			}),

			NotImplemented: declareException('EmptyException'),
			Unmatching: declareException('UnmatchingException', TypeError)
		}

		/**
		 * 创建对象生成器。
		 * @param {Function} C 构造函数
		 * @see http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/#1608546
		 */
		, generateCreator = function(C) {
			function F(args) {
				return C.apply(this, args);
			}
			F.prototype = C.prototype;

			return function() {
				return new F(arguments);
			}
		}

		// 数据是否包含指定元素。
		, has = function(arr, item) {
			return arr.indexOf(item) >= 0;
		}
		;

	/**
	 * 自定义数据类型类。
	 * @param {function} matcher
	 * @param {RegExp}   matcher
	 */
	function Type(/* function | RegExp */ matcher) {
		// 参数合法性检查。
		if (arguments.length != 1) {
			throw new ERR.Arguments(1, arguments.length);
		}
		if (!(typeof matcher == 'function' || matcher instanceof RegExp)) {
			throw new ERR.Type('Type matcher', [ 'Function', 'RegExp' ], matcher);
		}

		// Type() 构造函数参数确定，故毋须使用类似 ParamList.parse 这样的构建器。
		if (!(this instanceof Type)) return new Type(matcher);

		if (matcher instanceof RegExp)
			this.match = function(value) { return matcher.test(value); }
		else
			this.match = matcher;
	}

	/**
	 * 参数类。
	 * 构造函数支持重载，可能的参数形式包括：
	 *   "alias ...decorator"
	 *   type, ...decorator
	 *   type, decorators
	 * 其中 type 可以是 Type 对象、普通的构造函数或者类型别名，decorators 则代表由多个修饰符组成的字符串，以空格分隔。
	 */
	function Param() {
		if (arguments.length == 0) {
			throw new ERR.Arguments('1+', 0);
		}

		if (arguments.length == 1 && arguments[0] instanceof Param) {
			return arguments[0];
		}

		var type = arguments[0], decos = [];

		// ---------------------------
		// 处理数据类型。

		if (typeof type == 'string') {
			// 如果首参数是字符串，则它可能包括数据类型别名及修饰符，我们需要首先将其拆分。
			// 拆分后第一个字符串作为数据类型（别名，后面还会继续处理），其余作为修饰符。
			decos = type.trim().split(/\s+/);
			type = decos.shift();

			var formalType = TYPE_ALIAS[type];
			if (!formalType) {
				throw new ERR.Range('type alias', Object.keys(TYPE_ALIAS), type);
			}
			type = formalType;
		}

		else if (type instanceof Type) {
			// DO NOTHING.
		}

		// 如果数据类型是一个普通函数，则将其视为构造函数，并封装为 Type 对象。
		else if (typeof type == 'function') {
			type = (function(type) {
				return new Type(function(value) {
					return value instanceof type;
				})
			})(type);
		}

		// 如不匹配，则抛出异常。
		else {
			throw new ERR.Type('Param type', [ 'overload2.Type', 'string', 'Function' ], type);
		}
		this.type = type;

		// ---------------------------
		// 处理修饰符。

		var DECOS = ['NULL', 'UNDEFINED'];

		for (var i = 1; i < arguments.length; i++) {
			decos = decos.concat(arguments[i].trim().split(/\s+/));
		}
		for (var i = 0; i < decos.length; i++) {
			var rawDeco = decos[i];

			// 修饰符不区分大小写。
			decos[i] = decos[i].toUpperCase();

			// 如果修饰符不合法，须抛出异常。
			if (!has(DECOS, decos[i])) {
				throw new ERR.Range('param decorator', DECOS, rawDeco);
			}
		}

		// 为了避免可能的语法冲突，这些修饰符对应的属性名回避了 JavaScript 保留字。

		// 参数是否可以为 null
		this.nil = has(decos, 'null');

		// 参数是否可以为 undefined
		this.undef = has(decos, 'undefined');
	}

	Param.parse = generateCreator(Param);

	// 判断值是否合乎参数限定。
	Param.prototype.satisfy = function(value) {
		if (value === null && this.nil) return true;
		if (value === undefined && this.undef) return true;
		return this.type.match(value);
	};

	/**
	 * 参数列表类。
	 * 构造函数可以有若干参数，每个参数用于定义一个 Param 对象，它可以是 type（参见 Param 构造函数说明），也可以是符合 Param 构造函数要求的一个参数数组。
	 */
	function ParamList(/* type | Param() arguments , ... */) {
		var params = [];
		for (var i = 0, args; i < arguments.length; i++) {
			args = (arguments[i] instanceof Array) ? arguments[i] : [ arguments[i] ];
			params[i] = Param.parse.apply(null, args);
		}

		this.length = params.length;
		this.item = function(i) {
			return params[i];
		};
	}

	ParamList.parse = generateCreator(ParamList);

	/**
	 * 判断值组是否合乎参数值限定。
	 */
	ParamList.prototype.satisfy = function(args) {
		// 参数表长度检查。
		if (args.length != this.length) {
			return false;
		}

		// 参数类型核对
		var matched = true;
		for (var i = 0; matched && i < this.length; i++) {
			matched = this.item(i).satisfy(args[i]);
		}
		return matched;
	};

	/**
	 * 重载声明及实现类。
	 * 构造函数支持重载，可能的参数形式包括：
	 *   numbder, Function
	 *   ParamList, Function
	 *   ...param, Function
	 */
	function Overload() {
		if (arguments.length == 0) {
			throw new ERR.Arguments('1+', 0);
		}
		var args = Array.from(arguments);

		var method = args.pop();
		if (typeof method == 'function') {
			this.method = method;
		}
		else {
			throw new ERR.Generic('overloading implementation function missed');
		}

		if (typeof args[0] == 'number') {
			if (args.length > 1) {
				throw new ERR.Arguments(2, args.length + 1);
			}
			this.paramCount = args[0];
		}
		else if (args[0] instanceof ParamList) {
			if (args.length > 1) {
				throw new ERR.Arguments(2, args.length + 1);
			}
			this.params = args[0];
		}
		else {
			this.params = ParamList.parse.apply(null, args);
		}
	}

	Overload.parse = generateCreator(Overload);

	/**
	 * @returns {boolean} false 表示执行失败，即该重载实现与实参不匹配。
	 * @returns {Array} 返回数组表示执行成功，即该重载实现与实参匹配。数据作为返回值的容器，有且只有一个元素，该元素即为返回值。
	 */
	Overload.prototype.exec = function(scope, args) {
		// 若指定了形参数量，而实参数量不符，则直接跳过。
		if (typeof this.paramCount == 'number' && (args.length != this.paramCount)) {
			return false;
		}

		if (this.params && !this.params.satisfy(args)) {
			return false;
		}

		return [ this.method.apply(scope, args) ];
	};

	/**
	 * 重载函数类。
	 * 该类的实例并非函数，而是对重载函数的封装。
	 */
	function OverloadedFunction() {
		if (!(this instanceof OverloadedFunction)) return new OverloadedFunction();

		// 缺省实现。
		this._defaultMethod = null;

		// 保存重载声明及其实现的容器。
		this._overloads = [];
	}

	/**
	 * OverloadedFunction 对象并非函数实例，故无法直接调用，需通过成员函数 exec() 来执行。
	 */
	OverloadedFunction.prototype.exec = function(/* arg_0, arg_1, ... */) {
		return this.apply(this, arguments);
	};

	/**
	 * 从多态定义（definitions）中，选取与参数组（args）匹配的函数，并在指定的上下文（scope）中运行。
	 * 相当于普通函数的 .apply() 方法。
	 * @param {object} scope
	 * @param {Arguments} args
	 */
	OverloadedFunction.prototype.apply = function(scope, args) {
		if (this._overloads.length == 0) {
			throw new ERR.NotImplemented;
		}

		for (var i = 0, ret; i < this._overloads.length; i++) {
			ret = this._overloads[i].exec(scope, args);
			if (ret) {
				return ret[0];
			}
		}

		if (this._defaultMethod) {
			return this.defaultMethod.apply(scope, args);
		}

		// 表示没有任何重载形参与实参匹配。
		throw new ERR.Unmatching('Unmatching arguments: ' + args);
	};

	/**
	 * 相当于普通函数的 .call() 方法。
	 * @param {object} scope
	 * @param {*} arg_0,...
	 */
	OverloadedFunction.prototype.call = function(scope /*, arg_0, arg_1, ... */) {
		var args = Array.from(arguments);
		return this.apply(scope, args.slice(1));
	};

	/**
	 * 增加重载实现。
	 * 本函数支持重载，可能的参数形式如下：
	 *   Overload, boolean
	 *   Overload 构造函数所支持的参数表
	 */
	OverloadedFunction.prototype.overload = function() {
		var overloadInstance;
		if (arguments[0] instanceof Overload) {
			overloadInstance = arguments[0];
			if (arguments[1]) {
				this._defaultMethod = overloadInstance.method;
			}
			if (arguments.length > 2) {
				console.warn('redundant arguments found');
			}
		}
		else {
			overloadInstance = Overload.parse.apply(null, arguments);
		}
		this._overloads.push(overloadInstance);
		return this;
	};

	OverloadedFunction.prototype.default = function(method) {
		if (typeof method != 'function') {
			throw new ERR.Generic('invalid default method');
		}
		if (arguments.length > 1) {
			console.warn('redundant arguments found');
		}
		this._defaultMethod = method;
	};

	// ---------------------------
	// 多态函数生成器。

	function Overloader() {

		var overloaded = new OverloadedFunction();
		var append = function(args) {
			overloaded.overload.apply(overloaded, args);
		};

		// 保存多态实现。
		// 注意：如果多态实现不合规，应当在定义时抛出异常，调用时不再进行合规校验。
		var saveDEF = function(args, isDefault) {
			var overloadInstance;
			if (args[0] instanceof Overload) {
				overloadInstance = args[0];
			}
			else {
				overloadInstance = Overload.parse.apply(null, args);
			}
			overloaded.overload(overloadInstance);

			if (isDefault) {
				overloaded.defaultMethod = overloadInstance.method;
			}
		};

		if (arguments.length) {
			// append(arguments);
		}

		var fn = function() {
			return overloaded.apply(this, arguments);
		};

		// 已创建的多态函数，仍可通过 overload() 方法扩展其多态实现。
		fn.overload = function(/* Type, Type, ..., Function */) {
			append(arguments);
			return fn;
		};

		// 扩展多态实现，同时将该实现设定为默认实现。
		fn.default = function(method) {
			overloaded.default(method);
			return fn;
		};

		// 返回一个函数实体。
		return fn;
	};

	// ---------------------------
	// 预定义数据类型。

	Overloader.ANY = new Type(function(value) {
		return true;
	});

	Overloader.BOOLEAN = new Type(function(value) {
		return typeof value == 'boolean';
	});

	Overloader.CHAR = new Type(function(value) {
		return typeof value == 'string' && value.length == 1;
	});

	Overloader.NUMBER = new Type(function(value) {
		return typeof value == 'number';
	});

	Overloader.SCALAR = new Type(function(value) {
		return [ 'boolean', 'number', 'string' ].indexOf(typeof value) >= 0;
	});

	Overloader.STRING = new Type(function(value) {
		return typeof value == 'string';
	});

	// ---------------------------
	// 自定义数据类型生成器。

	/**
	 * 创建枚举类型。
	 */
	Overloader.enum = function() {
		var args = [];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		return new Type(function(value) {
			return args.indexOf(value) >= 0;
		});
	};

	// ---------------------------

	Overloader.Type = Type;
	Overloader.type = Type;
	Overloader.parseType = Type;

	Overloader.Param = Param;
	Overloader.param = Param.parse;
	Overloader.parseParam = Param.parse;

	Overloader.ParamList = ParamList;
	Overloader.paramList = ParamList.parse;
	Overloader.parseParamList = ParamList.parse;

	Overloader.Overload = Overload;
	Overloader.overload = Overload.parse;
	Overloader.parseOverload = Overload.parse;

	Overloader.Function = OverloadedFunction;
	Overloader.createFunction = OverloadedFunction;

	// 输出所有自定义异常。
	for (var name in ERR) {
		if (ERR.hasOwnProperty(name)) {
			var Err = ERR[name];
			// 以异常名作为属性名。
			Overloader[Err.name] = Err;
		}
	}

	var TYPE_ALIAS = {
		  '*'        : Overloader.ANY
		, 'any'      : Overloader.ANY
		, 'boolean'  : Overloader.BOOLEAN
		, 'char'     : Overloader.CHAR
		, 'number'   : Overloader.NUMBER
		, 'scalar'   : Overloader.SCALAR
		, 'string'   : Overloader.STRING
	};


	// ---------------------------
	// 模块输出

	// CommonJS
	if (typeof module == 'object' && typeof module.exports == 'object') {
		module.exports = Overloader;
	}

	// RequireJS
	else if (typeof define == 'function') {
		define(function() {
			return Overloader;
		});
	}

	// Directly exposed to global context (e.g. window)
	else {
		global.overload2 = Overloader;
	}
})(this);
