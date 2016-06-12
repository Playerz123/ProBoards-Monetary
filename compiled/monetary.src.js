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

class monetary {

	static init(){
		this.enums = Object.assign(Object.create(null), {

			PLUGIN_ID: "pixeldepth_monetary",
			PLUGIN_KEY: "pixeldepth_money",
			PLUGIN_VERSION: "2.0.0",
			PLUGIN_CALLED: yootil.ts(),

			SYNC_KEY: "monetary",

			YOOTIL_MIN_REQUIRED_VERSION: "2.0.0",

			DATA_KEYS: Object.assign(Object.create(null), {

				MONEY: "m"

			})

		});

		Object.freeze(this.enums);

		if(!this.correct_yootil_version()){
			return;
		}

		this._KEY_DATA = new Map();

		this.settings.setup();
		this.setup_data();

		// Extension pre inits
		
		yootil.extension.run("monetary").pre_inits();
		
		// Inits

		this.api.init();

		// Extension inits run after API init

		yootil.extension.run("monetary").inits();

		this.profile.init();
		this.mini_profile.init();
		this.post.init();

		// Extension post inits

		yootil.extension.run("monetary").post_inits();

		// Ready inits

		$(yootil.extension.run("monetary").ready);
		
		return this;
	}

	static correct_yootil_version(){
		if(typeof yootil == "undefined"){
			console.warn("Yootil is required for the Monetary plugin, but was not found.");

			return false;
		} else if(yootil.compare_version(yootil.version, this.enums.YOOTIL_MIN_REQUIRED_VERSION) == -1){
			console.warn("Monetary plugin requires a mininum Yootil version of " + this.enums.YOOTIL_MIN_REQUIRED_VERSION + ".");

			return false;
		}

		return true;
	}

	/**
	 * Plugin ID.
	 * @return {String}
	 */

	static get PLUGIN_ID(){
		return this.enums.PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this.enums.PLUGIN_KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this.enums.PLUGIN_VERSION;
	}

	static get CALLED(){
		return this.enums.PLUGIN_CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.enums.PLUGIN_KEY];

		for(let [key, value] of Object.entries(user_data)){
			let id = parseInt(key, 10);

			if(!this._KEY_DATA.has(id)){
				this._KEY_DATA.set(id, new monetary.user_data(id, value));
			}
		}
	}

	static data(user_id = 0){
		return monetary.api.data(user_id);
	}

}

monetary.user_data = class {

	constructor(user_id = 0, data = {}){
		this._id = user_id;
		this._DATA = Object.assign(Object.create(null), {

			[monetary.enums.DATA_KEYS.MONEY]: parseFloat(data[monetary.enums.DATA_KEYS.MONEY]) || 0

		});
	}

	save(){
		$(monetary.api.events).trigger("monetary.user_data_key_saved", this._DATA);
		
		return yootil.key.set(monetary.enums.PLUGIN_KEY, this._DATA, this._id);
	}

	get(key = ""){
		if(key in this._DATA){
			return this._DATA[key];
		} else if(key == "data"){
			return this._DATA;
		}

		return null;
	}

	set(key = "", value){
		if(key in this._DATA){
			this._DATA[key] = value;

			return true;
		} else if(key == "data"){
			this._DATA = value;

			return true;
		}

		return false;
	}

};

monetary.utils = class {

	static full_money_str(money = 0, tpl = "{CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}"){
		tpl = tpl.replace("{CURRENCY_NAME}", monetary.settings.currency_name);
		tpl = tpl.replace("{CURRENCY_SEPARATOR}", monetary.settings.currency_separator);
		tpl = tpl.replace("{CURRENCY_SEPARATOR_SPACE}", ((monetary.settings.currency_separator_space)? " " : ""));
		
		let currency_symbol = (monetary.settings.currency_symbol_image)? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

		tpl = tpl.replace("{CURRENCY_SYMBOL}", currency_symbol);
		tpl = tpl.replace("{MONEY}", this.money_str(money, true, false));

		return tpl;
	}

	static money_str(money = 0, format = true, include_symbol = true){
		let money_amount = this.money_format(money);
		let str = money_amount.toString();

		if(format){
			str = yootil.number_format(money_amount, monetary.settings.currency_delimiter);
		}

		if(include_symbol){
			let currency_symbol = (monetary.settings.currency_symbol_image)? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

			str = currency_symbol + yootil.html_encode(str);
		}

		return str;
	}

	static money_format(money = 0, force_decimal = false){
		let money_num = parseFloat(money).toFixed(2);

		if(monetary.settings.object_currency && !force_decimal){
			money_num = Math.trunc(money_num);
		}

		return money_num;
	}

};

monetary.settings = class {

	static init(){
		this._amounts = Object.assign(Object.create(null), {

			new_thread: 50,
			new_poll: 10,
			new_post: 25

		});

		this._group_amounts = new Map();
		this._board_amounts = new Map();
		this._category_amounts = new Map();
	}

	static setup(){
		this.init();

		let plugin = pb.plugin.get(monetary.enums.PLUGIN_ID);

		if(plugin){
			monetary.PLUGIN = plugin;

			if(plugin.settings){
				let settings = plugin.settings;

				// Currency settings

				this._currency_name = settings.currency_name;
				this._currency_symbol = settings.currency_symbol;
				this._currency_symbol_image = settings.currency_symbol_image;
				this._currency_separator = settings.currency_separator;
				this._object_currency = !! ~~ settings.object_based_currency;
				this._currency_separator_space = !! ~~ settings.currency_separator_space;
				this._currency_delimiter = settings.currency_delimiter;

				// Profile settings

				this._profile_show_money = !! ~~ settings.profile_show_money;
				this._profile_new_content_box = !! ~~ settings.profile_new_cbox;

				// Mini profile settings

				this._mini_profile_show_money = !! ~~ settings.mini_profile_show_money;

				// Permissions

				this._members_who_can_edit = settings.members_who_can_edit;
				this._categories_can_not_earn = settings.categories_can_not_earn;
				this._boards_can_not_earn = settings.boards_can_not_earn;

				// Earning amounts

				this._amounts.new_post = parseFloat(settings.new_post) || 0;
				this._amounts.new_thread = parseFloat(settings.new_thread) || 0;
				this._amounts.new_poll = parseFloat(settings.new_poll) || 0;

				// Group earning amounts

				for(let grp_af of settings.group_amounts){
					let grp_amounts = Object.create(null);

					grp_amounts.new_post = parseFloat(grp_af.new_post) || 0;
					grp_amounts.new_thread = parseFloat(grp_af.new_thread) || 0;
					grp_amounts.new_poll = parseFloat(grp_af.new_poll) || 0;

					for(let grp of grp_af.groups){
						this._group_amounts.set(parseInt(grp, 10), grp_amounts);
					}
				}

				// Board earning amounts

				for(let brd_af of settings.board_amounts){
					let brd_amounts = Object.create(null);

					brd_amounts.new_post = parseFloat(brd_af.new_post) || 0;
					brd_amounts.new_thread = parseFloat(brd_af.new_thread) || 0;
					brd_amounts.new_poll = parseFloat(brd_af.new_poll) || 0;

					for(let brd of brd_af.boards){
						this._board_amounts.set(parseInt(brd, 10), brd_amounts);
					}
				}

				// Category earning amounts

				for(let cat_af of settings.category_amounts){
					let cat_amounts = Object.create(null);

					cat_amounts.new_post = parseFloat(cat_af.new_post) || 0;
					cat_amounts.new_thread = parseFloat(cat_af.new_thread) || 0;
					cat_amounts.new_poll = parseFloat(cat_af.new_poll) || 0;

					for(let cat of cat_af.categories){
						this._category_amounts.set(parseInt(cat, 10), cat_amounts);
					}
				}
			}

			if(plugin.images){
				this._images = plugin.images;
			}
		}

		//Object.freeze(this._amounts);
	}

	static get images(){
		return this._images;
	}

	static get default_amounts(){
		return this._amounts;
	}

	static get currency_name(){
		return this._currency_name;
	}

	static get currency_symbol(){
		return this._currency_symbol;
	}

	static get currency_separator(){
		return this._currency_separator;
	}

	static get object_currency(){
		return this._object_currency;
	}

	static get currency_separator_space(){
		return this._currency_separator_space;
	}

	static get currency_symbol_image(){
		return this._currency_symbol_image;
	}

	static get currency_delimiter(){
		return this._currency_delimiter;
	}

	static get profile_show_money(){
		return this._profile_show_money;
	}

	static get profile_new_content_box(){
		return this._profile_new_content_box;
	}

	static get members_who_can_edit(){
		return this._members_who_can_edit;
	}

	static get categories_can_not_earn(){
		return this._categories_can_not_earn;
	}

	static get boards_can_not_earn(){
		return this._boards_can_not_earn;
	}

	static get mini_profile_show_money(){
		return this._mini_profile_show_money;
	}

	static get group_amounts(){
		return this._group_amounts;
	}

	static get board_amounts(){
		return this._board_amounts;
	}

	static get category_amounts(){
		return this._category_amounts;
	}

	static earning_amounts(){
		let group_ids = yootil.user.group_ids();
		let board_id = yootil.page.board.id();
		let category_id = yootil.page.category.id();

		if(group_ids.length && this._group_amounts.size){
			for(let grp_id of group_ids){
				if(this._group_amounts.has(parseInt(grp_id, 10))){
					return this._group_amounts.get(parseInt(grp_id, 10));
				}
			}
		}

		if(board_id && this._board_amounts.size){
			if(this._board_amounts.has(parseInt(board_id, 10))){
				return this._board_amounts.get(parseInt(board_id, 10));
			}
		}

		if(category_id && this._category_amounts.size){
			if(this._category_amounts.has(parseInt(category_id, 10))){
				return this._category_amounts.get(parseInt(category_id, 10));
			}
		}

		return this._amounts;	
	}

};

monetary.permissions = class {

	static can_edit_money(){
		if(!monetary.settings.members_who_can_edit.length){
			return false;
		}

		let user_id = yootil.user.id();

		// Array.prototype.includes is strict, and ProBoards array elements are strings :(
		// Using .find for the moment until we discuss plugin side of things for v6.

		if(monetary.settings.members_who_can_edit.find(id => parseInt(id, 10) == user_id)){
			if(monetary.profile.initialised && (yootil.page.member.id() == user_id && !yootil.user.staff())){
				return false;
			}

			return true;
		}

		return false;
	}

	static can_earn_in_category(){
		if(!monetary.settings.categories_can_not_earn.length){
			return true;
		}

		let category_id = yootil.page.category.id();

		if(monetary.settings.categories_can_not_earn.find(id => parseInt(id, 10) == category_id)){
			return false;
		}

		return true;
	}

	static can_earn_in_board(){
		if(!monetary.settings.boards_can_not_earn.length){
			return true;
		}

		let board_id = yootil.page.board.id();

		if(monetary.settings.boards_can_not_earn.find(id => parseInt(id, 10) == board_id)){
			return false;
		}

		return true;
	}

	static can_earn(){
		return this.can_earn_in_category() && this.can_earn_in_board();
	}

};

monetary.api = class {

	static init(){
		this.events = Object.create(null);
		this._sync = new yootil.sync(monetary.enums.SYNC_KEY, this.get(yootil.user.id()).data(), new monetary.sync_handler());
	}

	static data(user_id = 0){
		let id = parseInt(user_id, 10);

		if(id > 0){
			if(!monetary._KEY_DATA.has(id)){
				monetary._KEY_DATA.set(id, new monetary.user_data(id));
			}

			return monetary._KEY_DATA.get(id);
		}

		console.warn("Monetary API: User ID not valid");

		return null;
	}

	static get(user_id = 0){
		let user_data = this.data(user_id);
		
		if(!user_data){
			return null;
		}

		return {

			money(format = false, include_symbol = false){
				let amount = parseFloat(user_data.get(monetary.enums.DATA_KEYS.MONEY));

				if(format){
					amount = monetary.utils.money_str(amount, true, include_symbol)
				}

				return amount;
			},
			
			data(){
				return user_data.get("data");
			}

		};
	}

	static set(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			money(amount = 0){
				return user_data.set(monetary.enums.DATA_KEYS.MONEY, parseFloat(amount));
			},

			data(value = {}){
				return user_data.set("data", value);
			}

		};
	}

	static increase(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			money(amount = 0){
				let current_money = user_data.get(monetary.enums.DATA_KEYS.MONEY) || 0;

				return user_data.set(monetary.enums.DATA_KEYS.MONEY, current_money + parseFloat(amount));
			}

		};
	}

	static decrease(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			money(amount = 0){
				let current_money = user_data.get(monetary.enums.DATA_KEYS.MONEY) || 0;

				return user_data.set(monetary.enums.DATA_KEYS.MONEY, current_money - parseFloat(amount));
			}

		};
	}
	
	static save(user_id = 0){
		return new Promise((resolve, reject) => {
			let user_data = this.data(user_id);

			if(user_data){
				user_data.save().then(status => resolve(status)).catch(status => reject(status));
			} else {
				let evt_obj = Object.create(null);

				evt_obj.user_id = user_id;
				evt_obj.message = "No user data";

				reject(evt_obj);
			}
		});
	}

	static sync(user_id){
		if(user_id != yootil.user.id()){
			return;
		}

		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		let data = user_data.get("data");

		$(monetary.api.events).trigger("monetary.before_sync", data);
		
		this._sync.update(data);

		$(monetary.api.events).trigger("monetary.after_sync", data);
	}

	static refresh_all_data(){
		monetary.setup_data();
	}
	
	static clear_all_data(){
		monetary._KEY_DATA.clear();
	}

};

monetary.sync_handler = class {

	change(new_data, old_data){
		this._new_data = new_data;
		this._old_data = old_data;

		monetary.api.set(yootil.user.id()).data(this._new_data);

		$(this.ready.bind(this));
	}

	ready(){
		this.update_profile();
		this.update_mini_profile();
	}

	get old_data(){
		return this._old_data;
	}

	get new_data(){
		return this._new_data;
	}

	update_profile(){
		if(monetary.profile.initialised && yootil.page.member.id() == yootil.user.id()){
			monetary.profile.update(yootil.user.id());
		}
	}
	
	update_mini_profile(){
		if(monetary.mini_profile.initialised){
			monetary.mini_profile.update(yootil.user.id());
		}
	}

}

/**
 * Will handle anything on the profile page
 */


monetary.profile = class {

	static init(){
		if(!monetary.settings.profile_show_money || !yootil.location.profile_home() || !yootil.page.member.exists()){
			return;
		}

		this._initialised = true;
		this._using_custom = false;
		this._using_content_box = false;
		this._template = null;
		this._money_elem = null;

		$(this.ready.bind(this));
	}

	static ready(){
		this.add_money_to_profile();
		this.add_edit_ability();
	}

	static add_money_to_profile(){
		let evt_data = Object.create(null);

		evt_data.profile_id = yootil.page.member.id();
		evt_data.money = monetary.api.get(evt_data.profile_id).money();

		// Look for custom element, otherwise we in insert
		// after the date registered.

		let $custom = $(".monetary-user-money");

		if($custom.length){
			this._using_custom = true;
			this._template = $custom.text();

			evt_data.template = this._template;
			evt_data.money_str = monetary.utils.full_money_str(evt_data.money, this._template);

			$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

			$custom.html("<span data-monetary-money>" + evt_data.money_str + "</span>");
		} else if(monetary.settings.profile_new_content_box){
			this._using_content_box = true;
			this.create_new_content_box(evt_data);
		} else {
			let $last_head = $("td.headings:last");

			if($last_head.length){
				evt_data.money_str = monetary.utils.money_str(evt_data.money, true);

				$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

				let $row = $last_head.parent();
				let $money_td = $("<td class='monetary-user-money'><span data-monetary-money>" + evt_data.money_str + "</span></td>");
				let currency_name = monetary.settings.currency_name + monetary.settings.currency_separator;

				$("<tr/>").html("<td>" + currency_name + "</td>").append($money_td).insertAfter($row);
			}
		}

		this._$money_elem = $(".monetary-user-money").show();
	}

	static create_new_content_box(evt_data){
		evt_data.money_str = monetary.utils.full_money_str(evt_data.money);

		$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

		let $content_box = yootil.create.profile_content_box("monetary-profile-content-box");
		let $span = $("<span class='monetary-user-money'><span data-monetary-money>" + evt_data.money_str + "</span></span>");

		$content_box.append($span);
		$content_box.prependTo("#center-column");
	}

	static add_edit_ability(){
		if(!this._$money_elem.length){
			return;
		}

		if(monetary.permissions.can_edit_money()){
			let cur_profile = yootil.page.member.id();
			let $edit_image = $("<img class='monetary-edit-icon' src='" + monetary.settings.images.edit + "' alt='Edit' title='Edit' />");

			$edit_image.on("click", () => this.edit_dialog(cur_profile));

			this._$money_elem.append($edit_image);
		}
	}

	static edit_dialog(profile_id = 0){
		if(!profile_id){
			return;
		}

		let dialog_html = "";

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

		let $dialog_html = $("<span />").html(dialog_html);

		$dialog_html.find("button#monetary-set-money").on("click", () => this.set_money(profile_id));
		$dialog_html.find("button#monetary-reset-money").on("click", () => this.reset_money(profile_id));
		$dialog_html.find("button#monetary-add-money").on("click", () => this.add_remove_money(profile_id));
		$dialog_html.find("button#monetary-remove-money").on("click", () => this.add_remove_money(profile_id, true));

		let $dialog = pb.window.dialog("monetary-edit-money-dialog", {

			title: "Edit " + monetary.settings.currency_name,
			modal: true,
			height: 180,
			width: 300,
			resizable: false,
			draggable: false,
			html: $dialog_html,

			open: function(){
				let evt_data = Object.create(null);

				evt_data.profile_id = profile_id;
				evt_data.money = monetary.api.get(profile_id).money();
				evt_data.money_str = monetary.utils.money_format(evt_data.money, true);

				$(monetary.api.events).trigger("monetary.profile_edit_money_open", evt_data);

				$(this).find("input[name=monetary-edit-money]").val(evt_data.money_str);
			},

			buttons: {

				"Close": function(){
					let evt_data = Object.create(null);

					evt_data.profile_id = profile_id;

					$(this).dialog("close");
					$(monetary.api.events).trigger("monetary.profile_edit_money_close", evt_data);
				}

			}

		});
	}

	static set_money(profile_id = 0){
		let $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]");
		let evt_data = Object.create(null);

		evt_data.profile_id = profile_id;
		evt_data.new_value = parseFloat($field.val());
		evt_data.old_value = monetary.api.get(profile_id).money();

		if(evt_data.new_value != evt_data.old_value){
			$(monetary.api.events).trigger("monetary.profile_edit_money_set", evt_data);
			monetary.api.set(profile_id).money(evt_data.new_value);
			this.save_and_update(profile_id);
		}
	}

	static reset_money(profile_id = 0){
		let evt_data = Object.create(null);

		evt_data.profile_id = profile_id;
		evt_data.old_value = monetary.api.get(profile_id).money();
		evt_data.new_value = 0;

		if(evt_data.old_value != 0){
			$(monetary.api.events).trigger("monetary.profile_edit_money_reset", evt_data);
			$("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]").val(evt_data.new_value);
			monetary.api.set(profile_id).money(evt_data.new_value);
			this.save_and_update(profile_id);
		}
	}

	static add_remove_money(profile_id = 0, remove = false){
		let $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-adjust-money]");
		let old_value = monetary.api.get(profile_id).money();
		let value = parseFloat($field.val());
		
		let evt_data = Object.create(null);

		evt_data.profile_id = profile_id;
		evt_data.removed = remove;
		evt_data.added = !remove;
		evt_data.value = value;
		evt_data.old_value = old_value;
		evt_data.new_value = (remove)? (old_value - value) : (old_value + value);

		if(evt_data.old_value != evt_data.new_value){
			$(monetary.api.events).trigger("monetary.profile_edit_money_add_remove", evt_data);

			if(remove){
				monetary.api.decrease(profile_id).money(evt_data.value);
			} else {
				monetary.api.increase(profile_id).money(evt_data.value);
			}

			this.save_and_update(profile_id);
		}
	}

	static save_and_update(profile_id = 0){
		let evt_data = Object.create(null);

		evt_data.profile_id = profile_id;

		$(monetary.api.events).trigger("monetary.profile_edit_money_before_save", evt_data);

		monetary.api.save(profile_id).then(status => {
			this.update(profile_id);

			let evt_data = Object.create(null);

			evt_data.profile_id = profile_id;

			$(monetary.api.events).trigger("monetary.profile_edit_money_saved", evt_data);

			monetary.api.sync(profile_id);
		}).catch(status => {
			pb.window.alert("Monetary Error", "Could not edit money (ID#" + profile_id + ").<br /><br />" + yootil.html_encode(status.message));
		});
	}

	static update(profile_id = 0){
		let evt_data = Object.create(null);

		evt_data.profile_id = profile_id;
		evt_data.money = monetary.api.get(profile_id).money();
		evt_data.money_str = "";

		if(this._using_content_box){
			evt_data.money_str = monetary.utils.full_money_str(evt_data.money);
		} else if(this._using_custom){
			evt_data.money_str = monetary.utils.full_money_str(evt_data.money, this._template);
		} else {
			evt_data.money_str = monetary.utils.money_str(evt_data.money, true);
		}

		$(monetary.api.events).trigger("monetary.profile_edit_money_before_dom_update", evt_data);
		$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

		this._$money_elem.find("span[data-monetary-money]").html(evt_data.money_str);

		$(monetary.api.events).trigger("monetary.profile_edit_money_after_dom_update", evt_data);
	}

	static get using_custom(){
		return this._using_custom;
	}

	static get using_content_box(){
		return this._using_content_box;
	}

	static get template(){
		return this._template;
	}

	static get initialised(){
		return this._initialised;
	}

	static get money_elem(){
		return this._$money_elem;
	}

};

monetary.mini_profile = class {

	static init(){
		if(!monetary.settings.mini_profile_show_money){
			return;	
		}
		
		let location_check = (

			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts()

		);

		if(!location_check){
			return;
		}

		this._initialised = true;
		this._using_custom = false;
		this._template = undefined;

		$(this.ready.bind(this));
	}

	static ready(){
		this.add_money_to_mini_profiles();
		yootil.event.after_search(this.add_money_to_mini_profiles, this);
	}

	static add_money_to_mini_profiles(){
		let $mini_profiles = yootil.get.mini_profiles();
		
		if(!$mini_profiles.length || $mini_profiles.find(".monetary-user-money[data-monetary-money]").length){
			return;
		}

		$mini_profiles.each((index, item) => {
			let $mini_profile = $(item);
			let $elem = $mini_profile.find(".monetary-user-money");
			let $user_link = $mini_profile.find("a.user-link[href*='user/']");
			let $info = $mini_profile.find(".info");

			if(!$elem.length && !$info.length){
				console.warn("Monetary Mini Profile: No info element found.");
				return;
			}

			if($user_link.length){
				let user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

				if(!user_id_match){
					console.warn("Monetary Mini Profile: Could not match user link.");
					return;
				}

				// Need to refresh the data table as AJAX requests
				// pull back fresh key data.

				monetary.api.refresh_all_data();

				let evt_data = Object.create(null);

				evt_data.user_id = parseInt(user_id_match[1], 10);
				evt_data.money = monetary.api.get(evt_data.user_id).money();
				evt_data.mini_profile = item;
				evt_data.mini_profile_index = index;

				let using_info = false;

				if($elem.length){
					evt_data.template = $elem.text();

					this._template = evt_data.template;
					this._using_custom = true;
				} else {
					using_info = true;
					$elem = $("<div class='monetary-user-money'></div>");
				}

				evt_data.money_str = monetary.utils.full_money_str(evt_data.money, evt_data.template);

				$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

				$elem.attr("data-monetary-money", evt_data.money).attr("data-monetary-user-id", evt_data.user_id);
				$elem.html(evt_data.money_str);

				if(using_info){
					$info.prepend($elem);
				}

				$elem.show();
			} else {
				console.warn("Monetary Mini Profile: Could not find user link.");
			}

		});
	}

	static update(user_id = 0){
		let $mini_profiles = yootil.get.mini_profiles(user_id);

		if($mini_profiles.length){
			let $elems = $mini_profiles.find(".monetary-user-money");

			if($elems.length){
				let evt_data = Object.create(null);

				evt_data.user_id = user_id;
				evt_data.money = monetary.api.get(evt_data.user_id).money();
				evt_data.money_str = monetary.utils.full_money_str(evt_data.money, this._template);

				$(monetary.api.events).trigger("monetary.before_money_shown", evt_data);

				$elems.attr("data-monetary-money", evt_data.money);
				$elems.html(evt_data.money_str);
			}
		}
	}
	
	static get using_custom(){
		return this._using_custom;
	}

	static get template(){
		return this._template;
	}

	static get initialised(){
		return this._initialised;
	}

};

monetary.post = class {

	static init(){
		/*if(!monetary.settings.post_amount && !monetary.settings.thread_amount && !monetary.settings.poll_amount){
			return;
		}*/

		if((yootil.location.posting() || yootil.location.thread()) && monetary.permissions.can_earn()){
			this._initialised = true;
			this._submitted = false;
			this._hook = "";
			
			$(this.ready.bind(this));
		}
	}

	static ready(){
		this._new_thread = (yootil.location.posting_thread())? true : false;
		this._new_post = (!this._new_thread)? true : false;
		this._editing = (yootil.location.editing())? true : false;
		this._poll = false;
		this._hook = (this._new_thread)? "thread_new" : ((yootil.location.thread())? "post_quick_reply" : "post_new");
		this._money_added = 0;

		let $the_form = yootil.form.posting();

		if($the_form.length){
			$the_form.on("submit", () => {
				let poll_input = $the_form.find("input[name=has_poll]");

				this._poll = (poll_input.length && poll_input.val() == 1)? true : false;
				this._submitted = true;
				this.set_on();
			});
		} else {
			console.warn("Monetary Post: Could not find form.");
		}
	}
	
	static set_on(){
		let evt_data = Object.create(null);

		evt_data.user_id = yootil.user.id();
		evt_data.amounts = monetary.settings.earning_amounts();

		console.log(evt_data.amounts);

		$(monetary.api.events).trigger("monetary.before_post_money", evt_data);

		let money_to_add = 0;

		if(!this._editing){
			if(this._new_thread){
				money_to_add += parseFloat(evt_data.amounts.new_thread);

				if(this._poll){
					money_to_add += parseFloat(evt_data.amounts.new_poll);
				}
			} else if(this._new_post){
				money_to_add += parseFloat(evt_data.amounts.new_post);
			}

			if(money_to_add){

				// Need to remove any money that may have been added to the key.  ProBoards needs to support
				// passing a handler to handle updating the key instead of set_on running straight away.

				// We do bind to the submit event above, however, if the form doesn't validate, then money gets
				// added to the data object.  The user could keep submitting, and the money will keep going up.

				// Also need to think about plugins such as Chris' word count plugin that awards money based on
				// length of post (I think?).  If the user submits the post, but it fails, the calculations are
				// already done and added.  What if the post length changes?  No way for the updated amounts to
				// get added correctly (big flaw with the old monetary plugin).

				// Possible fix: Check if form has been submitted, if so, remove previous money added.

				if(this._submitted){
					let evt_data_2 = Object.create(null);

					evt_data_2.user_id = evt_data.user_id;
					evt_data_2.money_added = evt_data.money_to_add;
					evt_data_2.money_before = monetary.api.get(evt_data.user_id).money();

					if(this._money_added){
						monetary.api.decrease(evt_data.user_id).money(this._money_added);
						evt_data_2.money_added -= this._money_added;
					}

					// Update the new value of money being added in case we need to remove it again.

					this._money_added = money_to_add;

					monetary.api.increase(evt_data.user_id).money(money_to_add);
					yootil.key.set_on(monetary.enums.PLUGIN_KEY, monetary.api.get(evt_data.user_id).data(), evt_data.user_id, this._hook);

					evt_data_2.money_after = monetary.api.get(evt_data.user_id).money();

					$(monetary.api.events).trigger("monetary.after_post_money", evt_data_2);
				}
			}
		}
	}

	static get initialised(){
		return this._initialised;
	}

	static get is_new_thread(){
		return this._new_thread;
	}

	static get is_new_post(){
		return this._new_post;
	}

	static get is_editing(){
		return this._editing;
	}

	static get has_poll(){
		return this._poll;
	}

};

monetary.init();