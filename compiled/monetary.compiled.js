/**
* @license
* Monetary 2.0.0
* The MIT License (MIT)
*
* Copyright (c) 2016 pixeldepth.net - http://support.proboards.com/user/2671
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class monetary
 * @static
 *
 * Main class.
 *
 * Custom element (i.e profile and mini profile):
 *
 * <div class="monetary-user-money">
 *     {CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}
 * </div>
 */

var monetary = function () {
	function monetary() {
		_classCallCheck(this, monetary);
	}

	_createClass(monetary, null, [{
		key: "init",
		value: function init() {
			this.enums = Object.assign(Object.create(null), {

				PLUGIN_ID: "pixeldepth_monetary",
				PLUGIN_KEY: "pixeldepth_money",
				PLUGIN_VERSION: "2.0.0",
				PLUGIN_CALLED: yootil.ts(),

				SYNC_KEY: "monetary",

				YOOTIL_MIN_REQUIRED_VERSION: "2.0.0",

				DATA_KEYS: Object.assign(Object.create(null), {

					MONEY: "m",
					RANK: "rnk",
					NEW_MEMBER_PAID: "nmp",
					BIRTHDAY_PAID: "bd",

					WAGE_POSTS: "wp",
					WAGE_EXPIRY: "we"

				})

			});

			Object.freeze(this.enums);

			if (!this.correct_yootil_version()) {
				return;
			}

			this._KEY_DATA = new Map();

			this.settings.init();
			this.setup_data();

			// Extension pre inits

			yootil.extension.run("monetary").pre_inits();

			// Inits

			this.api.init();

			// Sub modules

			this.initialise_modules();

			// Extension inits

			yootil.extension.run("monetary").inits();

			// Extension post inits

			yootil.extension.run("monetary").post_inits();

			// Ready inits

			$(yootil.extension.run("monetary").ready);

			return this;
		}
	}, {
		key: "initialise_modules",
		value: function initialise_modules() {
			this.profile.init();
			this.mini_profile.init();

			if (yootil.user.logged_in()) {
				this.post.init();
				this.rank_up.init();
				this.wages.init();
				this.new_member.init();
				this.birthday.init();
			}
		}
	}, {
		key: "correct_yootil_version",
		value: function correct_yootil_version() {
			if (typeof yootil == "undefined") {
				console.warn("Yootil is required for the Monetary plugin, but was not found.");

				return false;
			} else if (yootil.compare_version(yootil.version, this.enums.YOOTIL_MIN_REQUIRED_VERSION) == -1) {
				console.warn("Monetary plugin requires a mininum Yootil version of " + this.enums.YOOTIL_MIN_REQUIRED_VERSION + ".");

				return false;
			}

			return true;
		}

		/**
   * Plugin ID.
   * @return {String}
   */

	}, {
		key: "setup_data",
		value: function setup_data() {
			var user_data = proboards.plugin.keys.data[this.enums.PLUGIN_KEY];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Object.entries(user_data)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2);

					var key = _step$value[0];
					var value = _step$value[1];

					var id = parseInt(key, 10) || 0;

					if (id && !this._KEY_DATA.has(id)) {
						this._KEY_DATA.set(id, new monetary.user_data(id, value));
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: "PLUGIN_ID",
		get: function get() {
			return this.enums.PLUGIN_ID;
		}

		/**
   * Gets the plugin key name
   * @return {String}
   */

	}, {
		key: "KEY",
		get: function get() {
			return this.enums.PLUGIN_KEY;
		}

		/**
   * Gets version of this plugin.
   * @return {String}
   */

	}, {
		key: "version",
		get: function get() {
			return this.enums.PLUGIN_VERSION;
		}
	}, {
		key: "CALLED",
		get: function get() {
			return this.enums.PLUGIN_CALLED;
		}
	}, {
		key: "PLUGIN",
		set: function set(plug) {
			this._PLUGIN = plug;
		},
		get: function get() {
			return this._PLUGIN;
		}
	}, {
		key: "SETTINGS",
		set: function set(settings) {
			this._SETTINGS = settings;
		},
		get: function get() {
			return this._SETTINGS;
		}
	}]);

	return monetary;
}();

monetary.user_data = function () {
	function _class() {
		var _Object$assign;

		var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, _class);

		this._id = user_id;
		this._DATA = Object.assign(Object.create(null), (_Object$assign = {}, _defineProperty(_Object$assign, monetary.enums.DATA_KEYS.MONEY, parseFloat(data[monetary.enums.DATA_KEYS.MONEY]) || 0), _defineProperty(_Object$assign, monetary.enums.DATA_KEYS.RANK, parseInt(data[monetary.enums.DATA_KEYS.RANK], 10) || 1), _defineProperty(_Object$assign, monetary.enums.DATA_KEYS.NEW_MEMBER_PAID, parseInt(data[monetary.enums.DATA_KEYS.NEW_MEMBER_PAID], 10) || 0), _defineProperty(_Object$assign, monetary.enums.DATA_KEYS.BIRTHDAY_PAID, parseInt(data[monetary.enums.DATA_KEYS.BIRTHDAY_PAID], 10) || 0), _defineProperty(_Object$assign, monetary.enums.DATA_KEYS.WAGE_POSTS, parseInt(data[monetary.enums.DATA_KEYS.WAGE_POSTS], 10) || 0), _defineProperty(_Object$assign, monetary.enums.DATA_KEYS.WAGE_EXPIRY, parseInt(data[monetary.enums.DATA_KEYS.WAGE_EXPIRY], 10) || 0), _Object$assign));
	}

	_createClass(_class, [{
		key: "save",
		value: function save() {
			$(monetary.api.events).trigger("monetary.user_data.before_key_saved", this._DATA);

			return yootil.key.set(monetary.enums.PLUGIN_KEY, this._DATA, this._id);
		}
	}, {
		key: "get",
		value: function get() {
			var key = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			if (key in this._DATA) {
				return this._DATA[key];
			} else if (key == "data") {
				return this._DATA;
			}

			return null;
		}
	}, {
		key: "set",
		value: function set() {
			var key = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
			var value = arguments[1];

			if (key in this._DATA) {
				this._DATA[key] = value;

				return true;
			} else if (key == "data") {
				this._DATA = value;

				return true;
			}

			return false;
		}
	}, {
		key: "clear",
		value: function clear() {
			var key = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

			if (key in this._DATA) {
				return delete this._DATA[key];
			} else if (key == "data") {
				this._DATA = {};

				return true;
			}

			return false;
		}
	}]);

	return _class;
}();

monetary.utils = function () {
	function _class2() {
		_classCallCheck(this, _class2);
	}

	_createClass(_class2, null, [{
		key: "full_money_str",
		value: function full_money_str() {
			var money = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var tpl = arguments.length <= 1 || arguments[1] === undefined ? "{CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}" : arguments[1];

			var pattern = /(\{CURRENCY_NAME(\.(LOW|HIGH)ER)?\})/g;

			if (tpl.match(pattern)) {
				tpl = tpl.replace(pattern, function () {
					var str = monetary.settings.currency_name;

					if (arguments.length <= 3 ? undefined : arguments[3]) {
						str = str["to" + ((arguments.length <= 3 ? undefined : arguments[3]) == "LOW" ? "Lower" : "Upper") + "Case"]();
					}

					return str;
				});
			}

			tpl = tpl.replace("{CURRENCY_SEPARATOR}", monetary.settings.currency_separator);
			tpl = tpl.replace("{CURRENCY_SEPARATOR_SPACE}", monetary.settings.currency_separator_space ? " " : "");

			var currency_symbol = monetary.settings.currency_symbol_image ? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

			tpl = tpl.replace("{CURRENCY_SYMBOL}", currency_symbol);
			tpl = tpl.replace("{MONEY}", this.money_str(money, true, false));

			return tpl;
		}
	}, {
		key: "money_str",
		value: function money_str() {
			var money = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var format = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
			var include_symbol = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

			var money_amount = this.money_format(money);
			var str = money_amount.toString();

			if (format) {
				str = yootil.number_format(money_amount, monetary.settings.currency_delimiter);
			}

			if (include_symbol) {
				var currency_symbol = monetary.settings.currency_symbol_image ? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

				str = currency_symbol + yootil.html_encode(str);
			}

			return str;
		}
	}, {
		key: "money_format",
		value: function money_format() {
			var money = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var force_decimal = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			var money_num = parseFloat(money).toFixed(2);

			if (monetary.settings.object_currency && !force_decimal) {
				money_num = Math.trunc(money_num);
			}

			return money_num;
		}
	}]);

	return _class2;
}();

monetary.settings = function () {
	function _class3() {
		_classCallCheck(this, _class3);
	}

	_createClass(_class3, null, [{
		key: "init",
		value: function init() {
			this.setup();
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(monetary.enums.PLUGIN_ID);

			if (plugin) {
				monetary.PLUGIN = plugin;

				if (plugin.settings) {
					var settings = plugin.settings;

					monetary.SETTINGS = settings;

					// Currency settings

					this._currency_name = settings.currency_name;
					this._currency_symbol = settings.currency_symbol;
					this._currency_symbol_image = settings.currency_symbol_image;
					this._currency_separator = settings.currency_separator;
					this._object_currency = !! ~ ~settings.object_based_currency;
					this._currency_separator_space = !! ~ ~settings.currency_separator_space;
					this._currency_delimiter = settings.currency_delimiter;

					// Permissions

					this._members_who_can_edit = settings.members_who_can_edit;
					this._categories_can_not_earn = settings.categories_can_not_earn;
					this._boards_can_not_earn = settings.boards_can_not_earn;
				}

				if (plugin.images) {
					this._images = plugin.images;
				}
			}
		}
	}, {
		key: "images",
		get: function get() {
			return this._images;
		}
	}, {
		key: "default_amounts",
		get: function get() {
			return this._amounts;
		}
	}, {
		key: "currency_name",
		get: function get() {
			return this._currency_name;
		}
	}, {
		key: "currency_symbol",
		get: function get() {
			return this._currency_symbol;
		}
	}, {
		key: "currency_separator",
		get: function get() {
			return this._currency_separator;
		}
	}, {
		key: "object_currency",
		get: function get() {
			return this._object_currency;
		}
	}, {
		key: "currency_separator_space",
		get: function get() {
			return this._currency_separator_space;
		}
	}, {
		key: "currency_symbol_image",
		get: function get() {
			return this._currency_symbol_image;
		}
	}, {
		key: "currency_delimiter",
		get: function get() {
			return this._currency_delimiter;
		}
	}, {
		key: "members_who_can_edit",
		get: function get() {
			return this._members_who_can_edit;
		}
	}, {
		key: "categories_can_not_earn",
		get: function get() {
			return this._categories_can_not_earn;
		}
	}, {
		key: "boards_can_not_earn",
		get: function get() {
			return this._boards_can_not_earn;
		}
	}]);

	return _class3;
}();

monetary.permissions = function () {
	function _class4() {
		_classCallCheck(this, _class4);
	}

	_createClass(_class4, null, [{
		key: "can_edit_money",
		value: function can_edit_money() {
			if (!monetary.settings.members_who_can_edit.length) {
				return false;
			}

			var user_id = yootil.user.id();

			// Array.prototype.includes is strict, and ProBoards array elements are strings :(
			// Using .find for the moment until we discuss plugin side of things for v6.

			if (monetary.settings.members_who_can_edit.find(function (id) {
				return parseInt(id, 10) == user_id;
			})) {
				if (monetary.profile.initialised && yootil.page.member.id() == user_id && !yootil.user.staff()) {
					return false;
				}

				return true;
			}

			return false;
		}
	}, {
		key: "can_earn_in_category",
		value: function can_earn_in_category() {
			if (!monetary.settings.categories_can_not_earn.length) {
				return true;
			}

			var category_id = yootil.page.category.id();

			if (monetary.settings.categories_can_not_earn.find(function (id) {
				return parseInt(id, 10) == category_id;
			})) {
				return false;
			}

			return true;
		}
	}, {
		key: "can_earn_in_board",
		value: function can_earn_in_board() {
			if (!monetary.settings.boards_can_not_earn.length) {
				return true;
			}

			var board_id = yootil.page.board.id();

			if (monetary.settings.boards_can_not_earn.find(function (id) {
				return parseInt(id, 10) == board_id;
			})) {
				return false;
			}

			return true;
		}
	}, {
		key: "category_board_enabled",
		value: function category_board_enabled() {
			return this.can_earn_in_category() && this.can_earn_in_board();
		}
	}]);

	return _class4;
}();

monetary.api = function () {
	function _class5() {
		_classCallCheck(this, _class5);
	}

	_createClass(_class5, null, [{
		key: "init",
		value: function init() {
			this._events = Object.create(null);
			this._sync = new yootil.sync(monetary.enums.SYNC_KEY, this.get(yootil.user.id()).data(), monetary.sync_handler);
			this._queue = new yootil.queue(true);
		}
	}, {
		key: "data",
		value: function data() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var id = parseInt(user_id, 10);

			if (id > 0) {
				if (!monetary._KEY_DATA.has(id)) {
					monetary._KEY_DATA.set(id, new monetary.user_data(id));
				}

				return monetary._KEY_DATA.get(id);
			}

			console.warn("Monetary API: User ID not valid");

			return null;
		}
	}, {
		key: "get",
		value: function get() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				money: function money() {
					var format = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
					var include_symbol = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

					var amount = parseFloat(user_data.get(monetary.enums.DATA_KEYS.MONEY));

					if (format) {
						amount = monetary.utils.money_str(amount, true, include_symbol);
					}

					return amount;
				},
				data: function data() {
					return user_data.get("data");
				},
				rank: function rank() {
					return user_data.get(monetary.enums.DATA_KEYS.RANK);
				},
				new_member_paid: function new_member_paid() {
					return !!user_data.get(monetary.enums.DATA_KEYS.NEW_MEMBER_PAID);
				},
				birthday_paid: function birthday_paid() {
					return user_data.get(monetary.enums.DATA_KEYS.BIRTHDAY_PAID);
				},
				wage_posts: function wage_posts() {
					return user_data.get(monetary.enums.DATA_KEYS.WAGE_POSTS);
				},
				wage_expiry: function wage_expiry() {
					return user_data.get(monetary.enums.DATA_KEYS.WAGE_EXPIRY);
				}
			};
		}
	}, {
		key: "set",
		value: function set() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				money: function money() {
					var amount = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

					return user_data.set(monetary.enums.DATA_KEYS.MONEY, parseFloat(amount));
				},
				data: function data() {
					var value = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

					return user_data.set("data", value);
				},
				rank: function rank() {
					var _rank = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

					return user_data.set(monetary.enums.DATA_KEYS.RANK, parseInt(_rank, 10) || 1);
				},
				new_member_paid: function new_member_paid() {
					return user_data.set(monetary.enums.DATA_KEYS.NEW_MEMBER_PAID, 1);
				},
				birthday_paid: function birthday_paid() {
					return user_data.set(monetary.enums.DATA_KEYS.BIRTHDAY_PAID, new Date().getFullYear());
				},
				wage_expiry: function wage_expiry() {
					var expiry = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

					return user_data.set(monetary.enums.DATA_KEYS.WAGE_EXPIRY, expiry);
				},
				wage_posts: function wage_posts() {
					var posts = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

					return user_data.set(monetary.enums.DATA_KEYS.WAGE_POSTS, posts);
				}
			};
		}
	}, {
		key: "increase",
		value: function increase() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				money: function money() {
					var amount = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

					var current_money = user_data.get(monetary.enums.DATA_KEYS.MONEY) || 0;

					return user_data.set(monetary.enums.DATA_KEYS.MONEY, current_money + parseFloat(amount));
				}
			};
		}
	}, {
		key: "decrease",
		value: function decrease() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				money: function money() {
					var amount = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

					var current_money = user_data.get(monetary.enums.DATA_KEYS.MONEY) || 0;

					return user_data.set(monetary.enums.DATA_KEYS.MONEY, current_money - parseFloat(amount));
				}
			};
		}
	}, {
		key: "clear",
		value: function clear() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			return {
				all: function all() {
					return user_data.clear("data");
				},
				rank_up: function rank_up() {
					return user_data.clear(monetary.enums.DATA_KEYS.RANK);
				},
				new_member_paid: function new_member_paid() {
					return user_data.clear(monetary.enums.DATA_KEYS.NEW_MEMBER_PAID);
				},
				birthday_paid: function birthday_paid() {
					return user_data.clear(monetary.enums.DATA_KEYS.BIRTHDAY_PAID);
				},
				wage_expiry: function wage_expiry() {
					return user_data.clear(monetary.enums.DATA_KEYS.WAGE_EXPIRY);
				},
				wage_posts: function wage_posts() {
					return user_data.clear(monetary.enums.DATA_KEYS.WAGE_POSTS);
				}
			};
		}
	}, {
		key: "save",
		value: function save() {
			var _this = this;

			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			return new Promise(function (resolve, reject) {
				var user_data = _this.data(user_id);

				if (user_data) {
					user_data.save().then(function (status) {
						return resolve(status);
					}).catch(function (status) {
						return reject(status);
					});
				} else {
					var evt_obj = Object.create(null);

					evt_obj.user_id = user_id;
					evt_obj.message = "No user data";

					reject(evt_obj);
				}
			});
		}
	}, {
		key: "sync",
		value: function sync(user_id) {
			if (user_id != yootil.user.id()) {
				return;
			}

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			var data = user_data.get("data");

			$(monetary.api.events).trigger("monetary.before_sync", data);

			this._sync.update(data);

			$(monetary.api.events).trigger("monetary.after_sync", data);
		}
	}, {
		key: "refresh_all_data",
		value: function refresh_all_data() {
			monetary.setup_data();
		}
	}, {
		key: "clear_all_data",
		value: function clear_all_data() {
			monetary._KEY_DATA.clear();
		}
	}, {
		key: "events",
		get: function get() {
			return this._events;
		}
	}, {
		key: "queue",
		get: function get() {
			return this._queue;
		}
	}]);

	return _class5;
}();

monetary.sync_handler = function () {
	function _class6() {
		_classCallCheck(this, _class6);
	}

	_createClass(_class6, null, [{
		key: "change",
		value: function change(new_data, old_data) {
			this._new_data = new_data;
			this._old_data = old_data;

			monetary.api.set(yootil.user.id()).data(this._new_data);

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			this.update_profile();
			this.update_mini_profile();
		}
	}, {
		key: "update_profile",
		value: function update_profile() {
			if (monetary.profile.initialised && yootil.page.member.id() == yootil.user.id()) {
				monetary.profile.update(yootil.user.id());
			}
		}
	}, {
		key: "update_mini_profile",
		value: function update_mini_profile() {
			if (monetary.mini_profile.initialised) {
				monetary.mini_profile.update(yootil.user.id());
			}
		}
	}, {
		key: "update_all",
		value: function update_all() {
			this.update_profile();
			this.update_mini_profile();
		}
	}, {
		key: "old_data",
		get: function get() {
			return this._old_data;
		}
	}, {
		key: "new_data",
		get: function get() {
			return this._new_data;
		}
	}]);

	return _class6;
}();

/**
 * Will handle anything on the profile page
 */

monetary.profile = function () {
	function _class7() {
		_classCallCheck(this, _class7);
	}

	_createClass(_class7, null, [{
		key: "init",
		value: function init() {
			this.settings = Object.create(null);
			this.setup();

			if (!this.settings.show_money || !yootil.location.profile_home() || !yootil.page.member.exists()) {
				return;
			}

			this._initialised = true;
			this._using_custom = false;
			this._using_content_box = false;
			this._template = null;
			this._money_elem = null;

			$(this.ready.bind(this));
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				this.settings.show_money = !! ~ ~settings.profile_show_money;
				this.settings.new_content_box = !! ~ ~settings.profile_new_cbox;
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			this.add_money_to_profile();
			this.add_edit_ability();
		}
	}, {
		key: "add_money_to_profile",
		value: function add_money_to_profile() {
			var evt_data = Object.create(null);

			evt_data.profile_id = yootil.page.member.id();
			evt_data.money = monetary.api.get(evt_data.profile_id).money();

			// Look for custom element, otherwise we in insert
			// after the date registered.

			var $custom = $(".monetary-user-money");

			if ($custom.length) {
				this._using_custom = true;
				this._template = $custom.text();

				evt_data.template = this._template;
				evt_data.money_str = monetary.utils.full_money_str(evt_data.money, this._template);

				$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

				$custom.html("<span data-monetary-money>" + evt_data.money_str + "</span>");
			} else if (this.settings.new_content_box) {
				this._using_content_box = true;
				this.create_new_content_box(evt_data);
			} else {
				var $last_head = $("td.headings:last");

				if ($last_head.length) {
					evt_data.money_str = monetary.utils.money_str(evt_data.money, true);

					$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

					var $row = $last_head.parent();
					var $money_td = $("<td class='monetary-user-money'><span data-monetary-money>" + evt_data.money_str + "</span></td>");
					var currency_name = monetary.settings.currency_name + monetary.settings.currency_separator;

					$("<tr/>").html("<td>" + currency_name + "</td>").append($money_td).insertAfter($row);
				}
			}

			this._$money_elem = $(".monetary-user-money").show();
		}
	}, {
		key: "create_new_content_box",
		value: function create_new_content_box(evt_data) {
			evt_data.money_str = monetary.utils.full_money_str(evt_data.money);

			$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

			var $content_box = yootil.create.profile_content_box("monetary-profile-content-box");
			var $span = $("<span class='monetary-user-money'><span data-monetary-money>" + evt_data.money_str + "</span></span>");

			$content_box.append($span);
			$content_box.prependTo("#center-column");
		}
	}, {
		key: "add_edit_ability",
		value: function add_edit_ability() {
			var _this2 = this;

			if (!this._$money_elem.length) {
				return;
			}

			if (monetary.permissions.can_edit_money()) {
				(function () {
					var cur_profile = yootil.page.member.id();
					var $edit_image = $("<img class='monetary-edit-icon' src='" + monetary.settings.images.edit + "' alt='Edit' title='Edit' />");

					$edit_image.on("click", function () {
						return _this2.edit_dialog(cur_profile);
					});

					_this2._$money_elem.append($edit_image);
				})();
			}
		}
	}, {
		key: "edit_dialog",
		value: function edit_dialog() {
			var _this3 = this;

			var profile_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			if (!profile_id) {
				return;
			}

			var dialog_html = "";

			dialog_html += "<p>";
			dialog_html += monetary.settings.currency_symbol + ": <input type='text' style='width: 100px' name='monetary-edit-money' /> ";
			dialog_html += "<button id='monetary-set-money' title='Sets the money value to this'>Set</button> ";
			dialog_html += "<button id='monetary-reset-money'>Reset</button>";
			dialog_html += "</p>";

			dialog_html += "<p style='margin-top: 10px;'>";
			dialog_html += monetary.settings.currency_symbol + ": <input type='text' style='width: 100px' name='monetary-edit-adjust-money' value='0' /> ";
			dialog_html += "<button id='monetary-add-money'>Add</button> ";
			dialog_html += "<button id='monetary-remove-money'>Remove</button>";
			dialog_html += "</p>";

			var $dialog_html = $("<span />").html(dialog_html);

			$dialog_html.find("button#monetary-set-money").on("click", function () {
				return _this3.set_money(profile_id);
			});
			$dialog_html.find("button#monetary-reset-money").on("click", function () {
				return _this3.reset_money(profile_id);
			});
			$dialog_html.find("button#monetary-add-money").on("click", function () {
				return _this3.add_remove_money(profile_id);
			});
			$dialog_html.find("button#monetary-remove-money").on("click", function () {
				return _this3.add_remove_money(profile_id, true);
			});

			var $dialog = pb.window.dialog("monetary-edit-money-dialog", {

				title: "Edit " + monetary.settings.currency_name,
				modal: true,
				height: 180,
				width: 300,
				resizable: false,
				draggable: false,
				html: $dialog_html,

				open: function open() {
					var evt_data = Object.create(null);

					evt_data.profile_id = profile_id;
					evt_data.money = monetary.api.get(profile_id).money();
					evt_data.money_str = monetary.utils.money_format(evt_data.money, true);

					$(monetary.api.events).trigger("monetary.profile.edit_money_opened", evt_data);

					$(this).find("input[name=monetary-edit-money]").val(evt_data.money_str);
				},

				buttons: {

					"Close": function Close() {
						var evt_data = Object.create(null);

						evt_data.profile_id = profile_id;

						$(this).dialog("close");
						$(monetary.api.events).trigger("monetary.profile.edit_money_closed", evt_data);
					}

				}

			});
		}
	}, {
		key: "set_money",
		value: function set_money() {
			var profile_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]");
			var evt_data = Object.create(null);

			evt_data.profile_id = profile_id;
			evt_data.new_value = parseFloat($field.val());
			evt_data.old_value = monetary.api.get(profile_id).money();

			if (evt_data.new_value != evt_data.old_value) {
				$(monetary.api.events).trigger("monetary.profile.edit_money_set", evt_data);
				monetary.api.set(profile_id).money(evt_data.new_value);
				this.save_and_update(profile_id);
			}
		}
	}, {
		key: "reset_money",
		value: function reset_money() {
			var profile_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var evt_data = Object.create(null);

			evt_data.profile_id = profile_id;
			evt_data.old_value = monetary.api.get(profile_id).money();
			evt_data.new_value = 0;

			if (evt_data.old_value != 0) {
				$(monetary.api.events).trigger("monetary.profile.edit_money_reset", evt_data);
				$("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]").val(evt_data.new_value);
				monetary.api.set(profile_id).money(evt_data.new_value);
				this.save_and_update(profile_id);
			}
		}
	}, {
		key: "add_remove_money",
		value: function add_remove_money() {
			var profile_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
			var remove = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			var $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-adjust-money]");
			var old_value = monetary.api.get(profile_id).money();
			var value = parseFloat($field.val());

			var evt_data = Object.create(null);

			evt_data.profile_id = profile_id;
			evt_data.removed = remove;
			evt_data.added = !remove;
			evt_data.value = value;
			evt_data.old_value = old_value;
			evt_data.new_value = remove ? old_value - value : old_value + value;

			if (evt_data.old_value != evt_data.new_value) {
				$(monetary.api.events).trigger("monetary.profile.edit_money_add_remove", evt_data);

				if (remove) {
					monetary.api.decrease(profile_id).money(evt_data.value);
				} else {
					monetary.api.increase(profile_id).money(evt_data.value);
				}

				this.save_and_update(profile_id);
			}
		}
	}, {
		key: "save_and_update",
		value: function save_and_update() {
			var _this4 = this;

			var profile_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var evt_data = Object.create(null);

			evt_data.profile_id = profile_id;

			$(monetary.api.events).trigger("monetary.profile.edit_money_before_save", evt_data);

			monetary.api.save(profile_id).then(function (status) {
				_this4.update(profile_id);

				var evt_data = Object.create(null);

				evt_data.profile_id = profile_id;

				$(monetary.api.events).trigger("monetary.profile.edit_money_saved", evt_data);

				monetary.api.sync(profile_id);
			}).catch(function (status) {
				pb.window.alert("Monetary Error", "Could not edit money (ID#" + profile_id + ").<br /><br />" + yootil.html_encode(status.message));
			});
		}
	}, {
		key: "update",
		value: function update() {
			var profile_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var evt_data = Object.create(null);

			evt_data.profile_id = profile_id;
			evt_data.money = monetary.api.get(profile_id).money();
			evt_data.money_str = "";

			if (this._using_content_box) {
				evt_data.money_str = monetary.utils.full_money_str(evt_data.money);
			} else if (this._using_custom) {
				evt_data.money_str = monetary.utils.full_money_str(evt_data.money, this._template);
			} else {
				evt_data.money_str = monetary.utils.money_str(evt_data.money, true);
			}

			$(monetary.api.events).trigger("monetary.profile.edit_money_before_dom_update", evt_data);
			$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

			this._$money_elem.find("span[data-monetary-money]").html(evt_data.money_str);

			$(monetary.api.events).trigger("monetary.profile.edit_money_after_dom_update", evt_data);
		}
	}, {
		key: "using_custom",
		get: function get() {
			return this._using_custom;
		}
	}, {
		key: "using_content_box",
		get: function get() {
			return this._using_content_box;
		}
	}, {
		key: "template",
		get: function get() {
			return this._template;
		}
	}, {
		key: "initialised",
		get: function get() {
			return this._initialised;
		}
	}, {
		key: "money_elem",
		get: function get() {
			return this._$money_elem;
		}
	}, {
		key: "show_money",
		get: function get() {
			return this.settings.show_money;
		}
	}, {
		key: "new_content_box",
		get: function get() {
			return this.settings.new_content_box;
		}
	}]);

	return _class7;
}();

monetary.mini_profile = function () {
	function _class8() {
		_classCallCheck(this, _class8);
	}

	_createClass(_class8, null, [{
		key: "init",
		value: function init() {
			this.settings = Object.create(null);
			this.setup();

			if (!this.settings.show_money) {
				return;
			}

			var location_check = yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts();

			if (!location_check) {
				return;
			}

			this._initialised = true;
			this._using_custom = false;
			this._template = undefined;

			$(this.ready.bind(this));
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				this.settings.show_money = !! ~ ~settings.mini_profile_show_money;
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			this.add_money_to_mini_profiles();
			yootil.event.after_search(this.add_money_to_mini_profiles, this);
		}
	}, {
		key: "add_money_to_mini_profiles",
		value: function add_money_to_mini_profiles() {
			var _this5 = this;

			var $mini_profiles = yootil.get.mini_profiles();

			if (!$mini_profiles.length || $mini_profiles.find(".monetary-user-money[data-monetary-money]").length) {
				return;
			}

			$mini_profiles.each(function (index, item) {
				var $mini_profile = $(item);
				var $elem = $mini_profile.find(".monetary-user-money");
				var $user_link = $mini_profile.find("a.user-link[href*='user/']");
				var $info = $mini_profile.find(".info");

				if (!$elem.length && !$info.length) {
					console.warn("Monetary Mini Profile: No info element found.");
					return;
				}

				if ($user_link.length) {
					var user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

					if (!user_id_match || !parseInt(user_id_match[1], 10)) {
						console.warn("Monetary Mini Profile: Could not match user link.");
						return;
					}

					// Need to refresh the data table as AJAX requests
					// pull back fresh key data.

					monetary.api.refresh_all_data();

					var evt_data = Object.create(null);

					evt_data.user_id = parseInt(user_id_match[1], 10);
					evt_data.money = monetary.api.get(evt_data.user_id).money();
					evt_data.mini_profile = item;
					evt_data.mini_profile_index = index;

					var using_info = false;

					if ($elem.length) {
						evt_data.template = $elem.text();

						_this5._template = evt_data.template;
						_this5._using_custom = true;
					} else {
						using_info = true;
						$elem = $("<div class='monetary-user-money'></div>");
					}

					evt_data.money_str = monetary.utils.full_money_str(evt_data.money, evt_data.template);

					$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

					$elem.attr("data-monetary-money", evt_data.money).attr("data-monetary-user-id", evt_data.user_id);
					$elem.html(evt_data.money_str);

					if (using_info) {
						$info.prepend($elem);
					}

					$elem.show();
				} else {
					console.warn("Monetary Mini Profile: Could not find user link.");
				}
			});
		}
	}, {
		key: "update",
		value: function update() {
			var user_id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

			var $mini_profiles = yootil.get.mini_profiles(user_id);

			if ($mini_profiles.length) {
				var $elems = $mini_profiles.find(".monetary-user-money");

				if ($elems.length) {
					var evt_data = Object.create(null);

					evt_data.user_id = user_id;
					evt_data.money = monetary.api.get(evt_data.user_id).money();
					evt_data.money_str = monetary.utils.full_money_str(evt_data.money, this._template);

					$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

					$elems.attr("data-monetary-money", evt_data.money);
					$elems.html(evt_data.money_str);
				}
			}
		}
	}, {
		key: "using_custom",
		get: function get() {
			return this._using_custom;
		}
	}, {
		key: "template",
		get: function get() {
			return this._template;
		}
	}, {
		key: "initialised",
		get: function get() {
			return this._initialised;
		}
	}, {
		key: "show_money",
		get: function get() {
			return this.settings.show_money;
		}
	}]);

	return _class8;
}();

monetary.post = function () {
	function _class9() {
		_classCallCheck(this, _class9);
	}

	_createClass(_class9, null, [{
		key: "init",
		value: function init() {
			this.settings = Object.create(null);

			this.settings.group_amounts = new Map();
			this.settings.board_amounts = new Map();
			this.settings.category_amounts = new Map();

			this.setup();

			if (yootil.location.posting() || yootil.location.thread()) {
				this._initialised = true;
				this._submitted = false;
				this._hook = "";

				$(this.ready.bind(this));
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				// Earning amounts

				this.settings.default_amounts = Object.create(null);

				this.settings.default_amounts.new_post = parseFloat(settings.new_post) || 0;
				this.settings.default_amounts.new_thread = parseFloat(settings.new_thread) || 0;
				this.settings.default_amounts.new_poll = parseFloat(settings.new_poll) || 0;

				// Group earning amounts

				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = settings.group_amounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var grp_af = _step2.value;

						var grp_amounts = Object.create(null);

						grp_amounts.new_post = parseFloat(grp_af.new_post) || 0;
						grp_amounts.new_thread = parseFloat(grp_af.new_thread) || 0;
						grp_amounts.new_poll = parseFloat(grp_af.new_poll) || 0;

						var _iteratorNormalCompletion5 = true;
						var _didIteratorError5 = false;
						var _iteratorError5 = undefined;

						try {
							for (var _iterator5 = grp_af.groups[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
								var grp = _step5.value;

								this.settings.group_amounts.set(parseInt(grp, 10), grp_amounts);
							}
						} catch (err) {
							_didIteratorError5 = true;
							_iteratorError5 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion5 && _iterator5.return) {
									_iterator5.return();
								}
							} finally {
								if (_didIteratorError5) {
									throw _iteratorError5;
								}
							}
						}
					}

					// Board earning amounts
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = settings.board_amounts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var brd_af = _step3.value;

						var brd_amounts = Object.create(null);

						brd_amounts.new_post = parseFloat(brd_af.new_post) || 0;
						brd_amounts.new_thread = parseFloat(brd_af.new_thread) || 0;
						brd_amounts.new_poll = parseFloat(brd_af.new_poll) || 0;

						var _iteratorNormalCompletion6 = true;
						var _didIteratorError6 = false;
						var _iteratorError6 = undefined;

						try {
							for (var _iterator6 = brd_af.boards[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
								var brd = _step6.value;

								this.settings.board_amounts.set(parseInt(brd, 10), brd_amounts);
							}
						} catch (err) {
							_didIteratorError6 = true;
							_iteratorError6 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion6 && _iterator6.return) {
									_iterator6.return();
								}
							} finally {
								if (_didIteratorError6) {
									throw _iteratorError6;
								}
							}
						}
					}

					// Category earning amounts
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = settings.category_amounts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var cat_af = _step4.value;

						var cat_amounts = Object.create(null);

						cat_amounts.new_post = parseFloat(cat_af.new_post) || 0;
						cat_amounts.new_thread = parseFloat(cat_af.new_thread) || 0;
						cat_amounts.new_poll = parseFloat(cat_af.new_poll) || 0;

						var _iteratorNormalCompletion7 = true;
						var _didIteratorError7 = false;
						var _iteratorError7 = undefined;

						try {
							for (var _iterator7 = cat_af.categories[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
								var cat = _step7.value;

								this.settings.category_amounts.set(parseInt(cat, 10), cat_amounts);
							}
						} catch (err) {
							_didIteratorError7 = true;
							_iteratorError7 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion7 && _iterator7.return) {
									_iterator7.return();
								}
							} finally {
								if (_didIteratorError7) {
									throw _iteratorError7;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			var _this6 = this;

			this._new_thread = yootil.location.posting_thread() ? true : false;
			this._new_post = !this._new_thread ? true : false;
			this._editing = yootil.location.editing() ? true : false;
			this._poll = false;
			this._hook = this._new_thread ? "thread_new" : yootil.location.thread() ? "post_quick_reply" : "post_new";
			this._money_added = 0;

			var $the_form = yootil.form.posting();

			if ($the_form.length) {
				$the_form.on("submit", function () {
					var poll_input = $the_form.find("input[name=has_poll]");

					_this6._poll = poll_input.length && poll_input.val() == 1 ? true : false;
					_this6._submitted = true;
					_this6.set_on();
				});
			} else {
				console.warn("Monetary Post: Could not find form.");
			}
		}
	}, {
		key: "set_on",
		value: function set_on() {
			var evt_data = Object.create(null);

			evt_data.user_id = yootil.user.id();
			evt_data.amounts = this.earning_amounts();
			evt_data.add = 0;
			evt_data.remove = 0;
			evt_data.category_can_earn = monetary.permissions.can_earn_in_category();
			evt_data.board_can_earn = monetary.permissions.can_earn_in_board();

			$(monetary.api.events).trigger("monetary.post.before", evt_data);

			var money_to_add = 0;

			if (!this._editing) {
				if (evt_data.category_can_earn && evt_data.board_can_earn) {
					if (this._new_thread) {
						money_to_add += parseFloat(evt_data.amounts.new_thread);

						if (this._poll) {
							money_to_add += parseFloat(evt_data.amounts.new_poll);
						}
					} else if (this._new_post) {
						money_to_add += parseFloat(evt_data.amounts.new_post);
					}
				}

				if (evt_data.add) {
					money_to_add += parseFloat(evt_data.add);
				}

				if (evt_data.remove) {
					money_to_add -= parseFloat(evt_data.remove);
				}

				if (money_to_add) {
					if (this._submitted) {
						var evt_data_2 = Object.create(null);

						evt_data_2.user_id = evt_data.user_id;
						evt_data_2.money_added = evt_data.money_to_add;
						evt_data_2.money_before = monetary.api.get(evt_data.user_id).money();

						if (this._money_added) {
							monetary.api.decrease(evt_data.user_id).money(this._money_added);
							evt_data_2.money_added -= this._money_added;
						}

						// Update the new value of money being added in case we need to remove it again.

						this._money_added = money_to_add;

						monetary.api.increase(evt_data.user_id).money(money_to_add);
						yootil.key.set_on(monetary.enums.PLUGIN_KEY, monetary.api.get(evt_data.user_id).data(), evt_data.user_id, this._hook);

						evt_data_2.money_after = monetary.api.get(evt_data.user_id).money();

						$(monetary.api.events).trigger("monetary.post.after", evt_data_2);
					}
				}
			}
		}
	}, {
		key: "earning_amounts",
		value: function earning_amounts() {
			var group_ids = yootil.user.group_ids();
			var board_id = yootil.page.board.id();
			var category_id = yootil.page.category.id();

			if (group_ids.length && this.settings.group_amounts.size) {
				var _iteratorNormalCompletion8 = true;
				var _didIteratorError8 = false;
				var _iteratorError8 = undefined;

				try {
					for (var _iterator8 = group_ids[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
						var grp_id = _step8.value;

						if (this.settings.group_amounts.has(parseInt(grp_id, 10))) {
							return this.settings.group_amounts.get(parseInt(grp_id, 10));
						}
					}
				} catch (err) {
					_didIteratorError8 = true;
					_iteratorError8 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion8 && _iterator8.return) {
							_iterator8.return();
						}
					} finally {
						if (_didIteratorError8) {
							throw _iteratorError8;
						}
					}
				}
			}

			if (board_id && this.settings.board_amounts.size) {
				if (this.settings.board_amounts.has(parseInt(board_id, 10))) {
					return this.settings.board_amounts.get(parseInt(board_id, 10));
				}
			}

			if (category_id && this.settings.category_amounts.size) {
				if (this.settings.category_amounts.has(parseInt(category_id, 10))) {
					return this.settings.category_amounts.get(parseInt(category_id, 10));
				}
			}

			return this.settings.default_amounts;
		}
	}, {
		key: "initialised",
		get: function get() {
			return this._initialised;
		}
	}, {
		key: "is_new_thread",
		get: function get() {
			return this._new_thread;
		}
	}, {
		key: "is_new_post",
		get: function get() {
			return this._new_post;
		}
	}, {
		key: "is_editing",
		get: function get() {
			return this._editing;
		}
	}, {
		key: "has_poll",
		get: function get() {
			return this._poll;
		}
	}, {
		key: "group_amounts",
		get: function get() {
			return this.settings.group_amounts;
		}
	}, {
		key: "board_amounts",
		get: function get() {
			return this.settings.board_amounts;
		}
	}, {
		key: "category_amounts",
		get: function get() {
			return this.settings.category_amounts;
		}
	}]);

	return _class9;
}();

monetary.rank_up = function () {
	function _class10() {
		_classCallCheck(this, _class10);
	}

	_createClass(_class10, null, [{
		key: "init",
		value: function init() {
			this._enabled = true;
			this._amount = 250;

			this.setup();

			if (this._enabled && (yootil.location.posting() || yootil.location.thread())) {
				this.check_rank();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				this._enabled = !! ~ ~settings.rank_up_enabled;
				this._amount = parseFloat(settings.rank_up_amount);
			}
		}
	}, {
		key: "check_rank",
		value: function check_rank() {
			var _this7 = this;

			if (this.ranked_up()) {
				$(monetary.api.events).on("monetary.post.before", function (evt, data) {
					data.add = _this7._amount;
				});

				monetary.api.set(yootil.user.id()).rank(yootil.user.rank().id);
			}
		}
	}, {
		key: "ranked_up",
		value: function ranked_up() {
			var current_rank = yootil.user.rank().id;
			var old_rank = monetary.api.get(yootil.user.id()).rank();

			return current_rank > old_rank && old_rank;
		}
	}, {
		key: "enabled",
		get: function get() {
			return this._enabled;
		}
	}, {
		key: "amount",
		get: function get() {
			return this._amount;
		}
	}]);

	return _class10;
}();

monetary.new_member = function () {
	function _class11() {
		_classCallCheck(this, _class11);
	}

	_createClass(_class11, null, [{
		key: "init",
		value: function init() {
			this._amount = 0;
			this._pay_old_members = false;
			this._dialog_title = "New Registered Member Reward";
			this._dialog_width = 220;
			this._dialog_height = 350;
			this._message = "You have received {CURRENCY_NAME.LOWER} for becoming a new member:<br /><br />{CURRENCY_SYMBOL}{MONEY}";

			this.setup();

			if (this._amount && !monetary.api.get(yootil.user.id()).new_member_paid()) {
				this.pay_member();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				this._amount = parseFloat(settings.new_user_amount);
				this._pay_old_members = !! ~ ~settings.pay_old_users;

				// Dialog

				this._dialog_title = settings.new_user_dialog_title;
				this._dialog_width = parseFloat(settings.new_user_dialog_width) || this._dialog_width;
				this._dialog_height = parseFloat(settings.new_user_dialog_height) || this._dialog_height;
				this._message = settings.new_user_message;
			}
		}
	}, {
		key: "pay_member",
		value: function pay_member() {
			var _this8 = this;

			var now = yootil.ts();
			var registered_on = yootil.user.registered_on().unix_timestamp * 1000;
			var diff = now - registered_on;

			// We will consider a new member to be someone that registered in the
			// last 48 hours.

			var _48hrs = 60 * 60 * 48 * 1000;

			if (this._pay_old_members || diff <= _48hrs) {
				monetary.api.queue.add(function (queue) {
					_this8.create_dialog(queue, diff, _48hrs);
				});
			}
		}
	}, {
		key: "create_dialog",
		value: function create_dialog(queue, diff, _48hrs) {
			var dialog_msg = pb.text.nl2br(monetary.utils.full_money_str(this._amount, this._message));

			dialog_msg = dialog_msg.replace("{MEMBER_NAME}", yootil.html_encode(yootil.user.name(), true));

			var evt_data = Object.create(null);

			evt_data.user_id = yootil.user.id();
			evt_data.old_member = diff > _48hrs ? true : false;
			evt_data.difference = diff;
			evt_data.message = dialog_msg;
			evt_data.amount = this._amount;
			evt_data.rejected = false;

			var $dialog = pb.window.dialog("monetary-new-member-dialog", {

				title: this._dialog_title,
				modal: true,
				height: this._dialog_height,
				width: this._dialog_width,
				resizable: false,
				draggable: false,
				html: dialog_msg,

				open: function open() {
					$(monetary.api.events).trigger("monetary.new_member.dialog_open", evt_data);
				},

				buttons: {

					"Reject": function Reject() {
						var _this9 = this;

						pb.window.confirm("Are you sure you want to reject this reward?", function () {
							evt_data.rejected = true;

							$(monetary.api.events).trigger("monetary.new_member.before_save", evt_data);

							monetary.api.set(evt_data.user_id).new_member_paid();

							monetary.api.save(evt_data.user_id).then(function (status) {
								$(monetary.api.events).trigger("monetary.new_member.after_save", evt_data);

								monetary.api.sync(evt_data.user_id);
							}).catch(function (status) {
								console.warn("Monetary Error [New Member - R]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
							});

							$(_this9).dialog("close");

							if (queue) {
								queue.next();
							}
						});
					},

					"Accept": function Accept() {
						evt_data.rejected = false;

						$(monetary.api.events).trigger("monetary.new_member.before_save", evt_data);

						monetary.api.set(evt_data.user_id).new_member_paid();
						monetary.api.increase(evt_data.user_id).money(evt_data.amount);

						monetary.api.save(evt_data.user_id).then(function (status) {
							$(monetary.api.events).trigger("monetary.new_member.after_save", evt_data);

							monetary.api.sync(evt_data.user_id);

							// Manually ran sync handler updates so we can update
							// possible pages we might be on.

							monetary.sync_handler.update_all();
						}).catch(function (status) {
							console.warn("Monetary Error [New Member - A]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
						});

						$(this).dialog("close");

						if (queue) {
							queue.next();
						}
					}

				}

			});
		}
	}, {
		key: "amount",
		get: function get() {
			return this._amount;
		}
	}, {
		key: "pay_old_members",
		get: function get() {
			return this._pay_old_members;
		}
	}, {
		key: "dialog_title",
		get: function get() {
			return this._dialog_title;
		}
	}, {
		key: "dialog_width",
		get: function get() {
			return this._dialog_width;
		}
	}, {
		key: "dialog_height",
		get: function get() {
			return this._dialog_height;
		}
	}, {
		key: "message",
		get: function get() {
			return this._message;
		}
	}]);

	return _class11;
}();

monetary.birthday = function () {
	function _class12() {
		_classCallCheck(this, _class12);
	}

	_createClass(_class12, null, [{
		key: "init",
		value: function init() {
			this._amount = 0;
			this._dialog_title = "Happy Birthday";
			this._dialog_width = 220;
			this._dialog_height = 350;
			this._message = "You have received {CURRENCY_SYMBOL}{MONEY} for your birthday.";

			this.setup();

			if (this._amount) {
				this.pay_member();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				this._amount = parseFloat(settings.birthday_amount);

				// Dialog

				this._dialog_title = settings.birthday_dialog_title;
				this._dialog_width = parseFloat(settings.birthday_dialog_width) || this._dialog_width;
				this._dialog_height = parseFloat(settings.birthday_dialog_height) || this._dialog_height;
				this._message = settings.birthday_message;
			}
		}
	}, {
		key: "pay_member",
		value: function pay_member() {
			var _this10 = this;

			var birthday = yootil.user.birthday();

			if (birthday && birthday.day && birthday.month) {
				var date = new Date();
				var day = date.getDate();
				var month = date.getMonth() + 1;
				var year = date.getFullYear();
				var year_paid = monetary.api.get(yootil.user.id()).birthday_paid();

				if (!year_paid || year_paid < year) {
					if (month == birthday.month && day == birthday.day) {
						monetary.api.queue.add(function (queue) {
							_this10.create_dialog(queue);
						});
					}
				}
			}
		}
	}, {
		key: "create_dialog",
		value: function create_dialog(queue) {
			var dialog_msg = pb.text.nl2br(monetary.utils.full_money_str(this._amount, this._message));

			dialog_msg = dialog_msg.replace("{MEMBER_NAME}", yootil.html_encode(yootil.user.name(), true));

			var evt_data = Object.create(null);

			evt_data.user_id = yootil.user.id();
			evt_data.message = dialog_msg;
			evt_data.amount = this._amount;
			evt_data.rejected = false;

			var $dialog = pb.window.dialog("monetary-birthday-dialog", {

				title: this._dialog_title,
				modal: true,
				height: this._dialog_height,
				width: this._dialog_width,
				resizable: false,
				draggable: false,
				html: dialog_msg,

				open: function open() {
					$(monetary.api.events).trigger("monetary.birthday.dialog_open", evt_data);
				},

				buttons: {

					"Reject": function Reject() {
						var _this11 = this;

						pb.window.confirm("Are you sure you want to reject this reward?", function () {
							evt_data.rejected = true;

							$(monetary.api.events).trigger("monetary.birthday.before_save", evt_data);

							monetary.api.set(evt_data.user_id).birthday_paid();

							monetary.api.save(evt_data.user_id).then(function (status) {
								$(monetary.api.events).trigger("monetary.birthday.after_save", evt_data);

								monetary.api.sync(evt_data.user_id);
							}).catch(function (status) {
								console.warn("Monetary Error [Birthday - R]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
							});

							$(_this11).dialog("close");

							if (queue) {
								queue.next();
							}
						});
					},

					"Accept": function Accept() {
						evt_data.rejected = false;

						$(monetary.api.events).trigger("monetary.birthday.before_save", evt_data);

						monetary.api.set(evt_data.user_id).birthday_paid();
						monetary.api.increase(evt_data.user_id).money(evt_data.amount);

						monetary.api.save(evt_data.user_id).then(function (status) {
							$(monetary.api.events).trigger("monetary.birthday.after_save", evt_data);

							monetary.api.sync(evt_data.user_id);

							// Manually ran sync handler updates so we can update
							// possible pages we might be on.

							monetary.sync_handler.update_all();
						}).catch(function (status) {
							console.warn("Monetary Error [Birthday - A]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
						});

						$(this).dialog("close");

						if (queue) {
							queue.next();
						}
					}

				}

			});
		}
	}, {
		key: "amount",
		get: function get() {
			return this._amount;
		}
	}, {
		key: "dialog_title",
		get: function get() {
			return this._dialog_title;
		}
	}, {
		key: "dialog_width",
		get: function get() {
			return this._dialog_width;
		}
	}, {
		key: "dialog_height",
		get: function get() {
			return this._dialog_height;
		}
	}, {
		key: "message",
		get: function get() {
			return this._message;
		}
	}]);

	return _class12;
}();

monetary.wages = function () {
	function _class13() {
		_classCallCheck(this, _class13);
	}

	_createClass(_class13, null, [{
		key: "init",
		value: function init() {
			this.settings = Object.create(null);

			this.settings.group_rules = new Map();
			this.settings.member_rules = new Map();

			this.setup();

			if (this.settings.enabled && (yootil.location.posting() || yootil.location.thread())) {
				this.check_wage_rules();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			if (monetary.SETTINGS) {
				var settings = monetary.SETTINGS;

				this.settings.enabled = !! ~ ~settings.wages_enabled;
				this.settings.paid_when = Math.max(1, parseInt(settings.wages_paid_when, 10)) || 1;
				this.settings.bonus = parseFloat(settings.wages_bonus) || 0;

				// Group earning rules

				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = settings.wages_group_rules[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var grp_af = _step9.value;

						var grp_amounts = Object.create(null);

						grp_amounts.amount = parseFloat(grp_af.amount) || 0;
						grp_amounts.posts = parseFloat(grp_af.posts) || 0;

						var _iteratorNormalCompletion11 = true;
						var _didIteratorError11 = false;
						var _iteratorError11 = undefined;

						try {
							for (var _iterator11 = grp_af.groups[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
								var grp = _step11.value;

								this.settings.group_rules.set(parseInt(grp, 10), grp_amounts);
							}
						} catch (err) {
							_didIteratorError11 = true;
							_iteratorError11 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion11 && _iterator11.return) {
									_iterator11.return();
								}
							} finally {
								if (_didIteratorError11) {
									throw _iteratorError11;
								}
							}
						}
					}

					// Member earning rules
				} catch (err) {
					_didIteratorError9 = true;
					_iteratorError9 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion9 && _iterator9.return) {
							_iterator9.return();
						}
					} finally {
						if (_didIteratorError9) {
							throw _iteratorError9;
						}
					}
				}

				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = settings.wages_member_rules[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var mem_af = _step10.value;

						var mem_amounts = Object.create(null);

						mem_amounts.amount = parseFloat(mem_af.amount) || 0;
						mem_amounts.posts = parseFloat(mem_af.posts) || 0;

						this.settings.member_rules.set(parseInt(mem_af.posts, 10), mem_amounts);
					}
				} catch (err) {
					_didIteratorError10 = true;
					_iteratorError10 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion10 && _iterator10.return) {
							_iterator10.return();
						}
					} finally {
						if (_didIteratorError10) {
							throw _iteratorError10;
						}
					}
				}
			}
		}
	}, {
		key: "check_wage_rules",
		value: function check_wage_rules() {}
	}, {
		key: "enabled",
		get: function get() {
			return this.settings.enabled;
		}
	}, {
		key: "paid_when",
		get: function get() {
			return this.settings.paid_when;
		}
	}, {
		key: "bonus",
		get: function get() {
			return this.settings.bonus;
		}
	}, {
		key: "group_rules",
		get: function get() {
			return this.settings.group_rules;
		}
	}, {
		key: "member_rules",
		get: function get() {
			return this.settings.member_rules;
		}
	}]);

	return _class13;
}();

monetary.init();