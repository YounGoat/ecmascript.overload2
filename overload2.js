/**
 * 函数多态的中量级实现。
 * @author youngoat@163.com
 *
 * 注释中的术语表：
 * * 参数 = 定义中的形式参数
 * * 值组 = 多态函数调用时的实际参数表
 */

/* eslint-disable no-shadow-restricted-names */
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

				/* eslint-disable new-cap */
				var err = new parent;
				/* eslint-enable new-cap */
				this.stack = [ this.name + ': ' + this.message ].concat(err.stack.split('\n').slice(2)).join('\n');
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
		/* eslint-disable key-spacing, comma-style */
		, ERR = {
			Generic: declareException('Error'),

			Arguments: declareException('ArgumentsError', TypeError, function(/*number*/ expected, /*number*/ actual) {
				this.message = expected + ' argument(s) expected but actual ' + actual;
			}),

			Type: declareException('TypeError', TypeError, function(/*string*/ desc, /*string|Array*/ types, /*string*/ actual) {
				this.message = desc + ' must be ' + (typeof types == 'string' ? types : types.join(' | ')) + ': ' + actual;
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
		/* eslint-enable key-spacing, comma-style */

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

		// 数组是否包含指定元素。
		, has = function(arr, item) {
			return arr.indexOf(item) >= 0;
		}

		// 数组中的每个元素是否均能通过指定函数的测试。
		, eachMatch = function(arr, fn) {
			var matched = true;
			for (var i = 0; matched && i < arr.length; i++) {
				matched = fn(arr[i], i);
			}
			return matched;
		}

		// 数组中任意元素通过指定函数的测试。
		, onceMatch = function(arr, fn) {
			var matched = false;
			for (var i = 0; !matched && i < arr.length; i++) {
				matched = fn(arr[i], i);
			}
			return matched;
		}
		;

	/**
	 * 自定义缺省值类。
	 */
	function Absent(value) {
		this.value = value;
	}

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

		if (matcher instanceof RegExp) {
			this.match = function(value) {
				return matcher.test(value);
			};
		}
		else {
			this.match = matcher;
		}
	}

	// ---------------------------
	// 预定义数据类型。

	Type.ANY = new Type(function() {
		return true;
	});

	Type.BOOLEAN = new Type(function(value) {
		return typeof value === 'boolean';
	});

	Type.CHAR = new Type(function(value) {
		return typeof value === 'string' && value.length == 1;
	});

	Type.NUMBER = new Type(function(value) {
		return typeof value === 'number';
	});

	Type.PLAIN_OBJECT  = new Type(function(value) {
		return typeof value === 'object' && value.constructor === Object;
	});

	Type.SCALAR = new Type(function(value) {
		return [ 'boolean', 'number', 'string' ].indexOf(typeof value) >= 0;
	});

	Type.STRING = new Type(function(value) {
		return typeof value === 'string';
	});

	// ---------------------------
	// 自定义数据类型生成器。

	/**
	 * 创建枚举类型。
	 */
	Type.enum = function() {
		var args = Array.from(arguments);
		return new Type(function(value) {
			return args.indexOf(value) >= 0;
		});
	};

	// ---------------------------
	// 有关类型的逻辑工具。

	// 根据现有类型，创建新的复合类型。
	Type.and = function() {
		var types = Array.from(arguments).map(Type.parse);
		return new Type(function(value) {
			return eachMatch(types, function(type) {
				return type.match(value);
			});
		});
	};

	// 根据现有类型，创建新的复合类型。
	Type.or = function() {
		var types = Array.from(arguments).map(Type.parse);
		return new Type(function(value) {
			return onceMatch(types, function(type) {
				return type.match(value);
			});
		});
	};

	// 取当前类型的补集。
	Type.not = function(type) {
		return new Type(function(value) {
			return !type.match(value);
		});
	};

	Type.parse = function(type) {
		if (typeof type == 'string') {
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

		return type;
	};

	/**
	 * 参数类。
	 * 构造函数支持重载，可能的参数形式包括：
	 *   "<alias> ...<decorator>"
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

		this.type = null;
		this.minSize = 1;
		this.maxSize = 1;
		this.nil = false;
		this.undef = false;
		this.absent = false;
		this.absentValue = undefined;
		this.arrayed = false;

		var setSize = (function(size) {
			if (typeof size == 'string') {
				// 清除所有空白字符。
				size = size.replace(/\s/g, '');
				if (size == '*' || size == '...') {
					this.minSize = 0;
					this.maxSize = Infinity;
					this.arrayed = true;
					return true;
				}
				if (size == '?') {
					this.absent = true;
					return true;
				}
				if (size == '+') {
					this.minSize = 1;
					this.maxSize = Infinity;
					this.arrayed = true;
					return true;
				}

				// 区间形式。
				if (/^\{.+\}$/.test(size)) {
					size = size.slice(1, -1);
				}
				if (/^\d+$/.test(size)) {
					this.minSize = this.maxSize = parseInt(size);
					this.arrayed = true;
					return true;
				}
				if (/^,(\d+)$/.test(size)) {
					this.minSize = 0;
					this.maxSize = parseInt(RegExp.$1);
					this.arrayed = true;
					return true;
				}
				if (/^(\d+),$/.test(size)) {
					this.minSize = parseInt(RegExp.$1);
					this.maxSize = Infinity;
					this.arrayed = true;
					return true;
				}
				if (/^(\d+),(\d+)$/.test(size)) {
					this.minSize = parseInt(RegExp.$1);
					this.maxSize = parseInt(RegExp.$2);
					this.arrayed = true;
					return true;
				}
				return false;
			}

			if (Number.isInteger(size) && size > 0) {
				this.minSize = this.maxSize = size;
				this.arrayed = true;
				return true;
			}

			return false;
		}).bind(this);

		var type = arguments[0], decos = [];

		// ---------------------------
		// 处理特殊的参数占位符。
		if (setSize(type)) {
			this.type = Type.ANY;
			return this;
		}

		// ---------------------------
		// 处理数据类型。

		if (typeof type == 'string') {
			// 如果首参数是字符串，则它可能包括数据类型别名及修饰符，我们需要首先将其拆分。
			// 拆分后第一个字符串作为数据类型（别名，后面还会继续处理），其余作为修饰符。
			decos = type.trim().split(/\s+/);
			type = decos.shift();
		}
		
		this.type = Type.parse(type);

		// ---------------------------
		// 处理修饰符。

		var DECOS = ['NULL', 'UNDEFINED', 'ABSENT'], i;

		for (i = 1; i < arguments.length; i++) {
			if (typeof arguments[i] == 'string') {
				decos = decos.concat(arguments[i].trim().split(/\s+/));
			}
			else if (Number.isInteger(arguments[i])) {
				decos.push(arguments[i]);
			}

			// @tag 20180222
			else if (arguments[i] instanceof Absent) {
				this.absent = true;
				this.absentValue = arguments[i].value;
			}
		}
		
		for (i = 0; i < decos.length; i++) {
			var rawDeco = decos[i];

			// 尝试作为量化修饰符应用。
			if (setSize(rawDeco)) continue;

			// 设置缺省值。
			// 注意：为避免歧义，缺省值字面量中不得出现空格。
			// @tag 20180222
			if (/^=(.+)$/.test(rawDeco)) {
				this.absent = true;
				this.absentValue = eval(RegExp.$1);
				continue;
			}

			// 普通修饰符不区分大小写。
			decos[i] = decos[i].toUpperCase();

			// 如果修饰符不合法，须抛出异常。
			if (!has(DECOS, decos[i])) {
				throw new ERR.Range('param decorator', DECOS, rawDeco);
			}
		}

		// 为了避免可能的语法冲突，这些修饰符对应的属性名回避了 JavaScript 保留字。

		// 参数是否可以为 null
		this.nil = has(decos, 'NULL');

		// 参数是否可以为 undefined
		this.undef = has(decos, 'UNDEFINED');

		// 参数是否可以缺席。
		if (!this.absent) {
			this.absent = has(decos, 'ABSENT');
		}
	}

	Param.parse = generateCreator(Param);

	/**
	 * 判断值是否合乎参数限定。
	 */
	Param.prototype.satisfy = function(value) {
		// if (value === null && this.nil) return true;
		// if (value === undefined && this.undef) return true;
		if (value === null) return this.nil;
		if (value === undefined) return this.undef;

		return this.type.match(value);
	};

	/**
	 * 参数列表类。
	 * 构造函数可以有若干参数，每个参数用于定义一个 Param 对象，它可以是 type（参见 Param 构造函数说明），也可以是符合 Param 构造函数要求的一个参数数组。
	 */
	function ParamList(/* type | Param() arguments , ... */) {
		var params = [];
		var minSize = 0;
		var maxSize = 0;
		var easy = true;
		for (var i = 0, args; i < arguments.length; i++) {
			args = (arguments[i] instanceof Array) ? arguments[i] : [ arguments[i] ];
			params[i] = Param.parse.apply(null, args);
			maxSize += params[i].maxSize;

			// @tag 20180222 
			// 如果参数允许缺省，则在整个实参列表中占据的最小长度为 0。
			minSize += params[i].absent ? 0 : params[i].minSize;

			// 如果形参可缺省，或者为多占位或可变长度，则不适用简易模式。
			easy = easy && !( params[i].absent || params[i].arrayed );
		}

		this.easy = easy;
		this.minSize = minSize;
		this.maxSize = maxSize;

		this.params = params;
	}

	ParamList.parse = generateCreator(ParamList);

	/**
	 * 判断值组是否合乎参数定义。
	 * @deprecated 为了支持可变长度参数，用更复杂的 .parse() 方法取代。
	 */
	ParamList.prototype.satisfy = function(args) {
		// 参数表长度检查。
		if (args.length != this.params.length) {
			return false;
		}

		// 参数类型核对。
		return eachMatch(this.params, function(param, index) {
			return param.satisfy(args[index]);
		});
	}

	/**
	 * 尝试按参数定义解析值组。
	 * @return false 匹配失败
	 * @return Array 匹配成功，返回与定义一一对应的新值组（因为参数可能是可变长度的）
	 */
	ParamList.prototype.parse = function(args) {
		// ---------------------------
		// 检查值组的长度是否在参数列表定义的区间内。
		if (args.length < this.minSize || this.maxSize < args.length) {
			return null;
		}

		// ---------------------------
		// 适用简易匹配逻辑。
		if (this.easy) {
			var matched = eachMatch(this.params, function(param, index) {
				return param.satisfy(args[index]);
			});
			return matched ? args : null;
		}

		// ---------------------------
		// 否则，适用复杂匹配逻辑。

		// 注意：此函数将被递归调用。
		var matching = function(args, params) {
			var newArgs = [];
			var argCursor = 0, paramCursor = 0;
			for (; argCursor < args.length; argCursor++) {

				// 如果所有形式参数匹配成功之后，仍有多余的实参未参加匹配，则认为整个参数表匹配失败。
				if (paramCursor >= params.length) {
					return null;
				}

				// 当前参数。
				var param = params[paramCursor];

				// 当前实参。
				var arg = args[argCursor];

				// ---------------------------
				// 如果形式参数对应单个实参且不可缺省，则按简易逻辑处理。
				if (!param.absent && param.minSize == 1 && param.maxSize == 1) {
					if (!param.satisfy(arg)) {
						// 如果实参与形式参数不匹配，则终止后续匹配，整个参数表匹配失败。
						return null;
					}
					else {
						newArgs.push(arg);
						paramCursor++;
					}
					continue;
				}

				// ---------------------------
				// 否则，适用复杂逻辑。

				// 如果剩余实参数量不足以匹配当前形式参数：
				if (args.length - argCursor < param.minSize) {
					// 若参数可缺省：
					if (param.absent) {
						// 使用缺省值替补。
						newArgs.push(param.absentValue);

						// 不消耗实参。
						argCursor--;

						// 当前形参匹配完毕。
						continue;	
					}
					
					// 否则当前形式参数匹配失败，整个参数表匹配失败。
					return null;
				}

				// 依次储存当前形式参数匹配的实参。
				var paramArgs = [];
				var pushParamArg = function() {
					if (param.arrayed) newArgs.push(paramArgs);

					// 此时，paramArgs.length == 1
					// @tag 20180302b
					else newArgs.push(paramArgs[0]);
				};

				for (; argCursor < args.length && param.satisfy(args[argCursor]); argCursor++) {
					paramArgs.push(args[argCursor]);
				}
				argCursor--;
				paramCursor++;

				// 如当前形式参数匹配实参个数未达到最小值：
				if (paramArgs.length < param.minSize) {
					// 若参数可缺省：
					if (param.absent) {
						// 使用缺省值替补。
						newArgs.push(param.absentValue);

						// 回吐所有已消耗的实参。
						argCursor -= paramArgs.length;
						
						// 当前形参匹配完毕。
						continue;
					}
					
					// 否则当前形式参数匹配失败，整个参数表匹配失败。
					return null;
				}

				// 剩余形参数组，该数组在后续的让贤匹配中是不变的。
				/*const*/ var restParams = params.slice(paramCursor);

				// 抵达匹配边界时，若
				// 仅匹配了最小数量的实参且该参数不可缺省，或者已是最后一个形式参数（既所有形式参数均已匹配），
				// 则直接固定参数值。
				if (!param.absent && paramArgs.length == param.minSize || restParams.length == 0) {
					pushParamArg();
					continue;
				}

				// 否则，须尝试让贤。
				// 让贤的策略是：
				//   将剩余实参与剩余形参匹配（递归调用）。
				//   如匹配不成功，则出让一个当前形参匹配的实参，列为剩余实参之首，再次尝试匹配。
				//   直至，无法出让，或匹配成功。
				// 剩余实参数组，该数组在后续的让贤匹配中是递增的。
				var restArgs = args.slice(argCursor + 1);

				// @tag 20180302a
				// @fixbug
				var lasttime = false;

				// 步步让贤，直到让无可让。
				do {
					var restNewArgs = matching(restArgs, restParams);

					// 剩余参数匹配成功，则拼接匹配结果，整个参数表匹配成功。
					if (restNewArgs != null) {
						pushParamArg();
						newArgs = newArgs.concat(restNewArgs);
						break;
					}

					// 已是最后一次尝试（当前形参已出让所有实参）。
					// @tag 20180302a
					if (lasttime) {
						// 就此罢了（liao）。
						newArgs = null;
						break;
					}
					
					// 如果已让无可让：
					if (paramArgs.length == param.minSize) {
						// 如果参数可以缺省，统统不要了，全给后续形参去。
						if (param.absent) {
							restArgs = paramArgs.concat(restArgs);
							
							// paramArgs = param.absentValue;
							// @tag 20180302b
							paramArgs = param.arrayed ? param.absentValue : [ param.absentValue ];

							// @tag 20180302a
							lasttime = true;
							continue;
						}

						// 否则，就此罢了（liao）。
						newArgs = null;
						break;
					}
					else {
						restArgs.unshift(paramArgs.pop());
					}

				} while (true);

				// 行进至此，不成功，则成仁。
				return newArgs;
			}

			// 此时，所有实参均已消耗完毕。
			for (; newArgs.length < params.length; paramCursor++) {
				if (params[paramCursor].absent) {
					newArgs.push(params[paramCursor].absentValue);
				}
				else if (params[paramCursor].minSize == 0) {
					newArgs.push([]);
				}
				else {
					return null;
				}
			}

			return newArgs;
		};

		return matching(Array.from(args), this.params);
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

		// 支持可变长度参数后，用于代表值组长度的数字，也可以用 Param 实例来表征。
		// 在此我们仍保留 argLength，是出于提高性能的考虑。
		if (typeof args[0] == 'number' && args.length == 1) {
			// if (args.length > 1) {
			// 	throw new ERR.Arguments(2, args.length + 1);
			// }
			this.argLength = args[0];
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
		// 对于每一个重载实现，值组长度和形参表是互斥的。
		// 或者指定值组长度，或者指定形参表，而不是同时指定。

		// 如指定值组长度，则仅判断长度。
		if (typeof this.argLength == 'number') {
			if (args.length != this.argLength) return false;
		}

		// 否则，须尝试匹配值组与参数列表。
		else {
			// 尝试获取按形式参数列表重整后的值组。
			args = this.params.parse(args);
			if (!args) return false;
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
			return this._defaultMethod.apply(scope, args);
		}

		// 表示没有任何重载形参与实参匹配。
		var types = [];
		for (var i = 0, type; i < args.length; i++) {
			type = (args[i] === null) ? 'null' : typeof args[i];
			if (type === 'object') type = args[i].constructor.name;
			types.push(type);
		}
		throw new ERR.Unmatching('Unmatching arguments: ' + types.join(', '));
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
	// 为了向前兼容，保留 0.1.0 版本之前的预定义数据类型，但以后新增类型仅挂靠 Type 函数。

	Overloader.ANY     = Type.ANY;
	Overloader.BOOLEAN = Type.BOOLEAN;
	Overloader.CHAR    = Type.CHAR;
	Overloader.NUMBER  = Type.NUMBER;
	Overloader.SCALAR  = Type.SCALAR;
	Overloader.STRING  = Type.STRING;

	// ---------------------------
	// 自定义数据类型生成器。
	// 为了向前兼容，保留 0.1.0 版本之前的数据类型生成工具，但以后新增工具仅挂靠 Type 函数。

	Overloader.enum    = Type.enum;

	// ---------------------------

	Overloader.Type           = Type;
	Overloader.type           = Type;
	// Overloader.parseType      = Type;

	Overloader.Param          = Param;
	Overloader.param          = Param.parse;
	Overloader.parseParam     = Param.parse;

	Overloader.ParamList      = ParamList;
	Overloader.paramList      = ParamList.parse;
	Overloader.parseParamList = ParamList.parse;

	Overloader.Overload       = Overload;
	Overloader.overload       = Overload.parse;
	Overloader.parseOverload  = Overload.parse;

	Overloader.Function       = OverloadedFunction;
	Overloader.createFunction = OverloadedFunction;

	Overloader.absent         = function(value) { return new Absent(value); };

	// 输出所有自定义异常。
	for (var name in ERR) {
		if (ERR.hasOwnProperty(name)) {
			var Err = ERR[name];
			// 以异常名作为属性名。
			Overloader[Err.name] = Err;
		}
	}

	var TYPE_ALIAS =
		{ '?'        : Type.ANY
		, 'any'      : Type.ANY
		, 'boolean'  : Type.BOOLEAN
		, 'char'     : Type.CHAR
		, 'number'   : Type.NUMBER
		, 'object'   : Type.PLAIN_OBJECT
		, 'scalar'   : Type.SCALAR
		, 'string'   : Type.STRING
		};

	// ---------------------------
	// 模块输出

	// CommonJS
	if (typeof module == 'object' && typeof module.exports == 'object') {
		module.exports = Overloader;
	}

	// RequireJS
	else if (typeof global.define == 'function') {
		global.define(function() {
			return Overloader;
		});
	}

	// Directly exposed to global context (e.g. window)
	else {
		global.overload2 = Overloader;
	}
})(this);