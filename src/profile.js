/**
 * Will handle anything on the profile page
 *
 * Custom element:
 *
 * <div class="monetary-profile-money">
 *     {CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}
 * </div>
 */


monetary.profile = class {

	static init(){
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
		let profile_money = monetary.api.get(yootil.page.member.id()).money();

		// Look for custom element, otherwise we in insert
		// after the date registered.

		let $custom = $(".monetary-profile-money");

		if($custom.length){
			this._using_custom = true;
			this._template = $custom.text();

			$custom.html("<span data-monetary-money>" + monetary.utils.full_money_str(profile_money, this._template) + "</span>").show();
		} else if(monetary.settings.profile_new_content_box){
			this._using_content_box = true;
			this.create_new_content_box(profile_money);
		} else {
			let $last_head = $("td.headings:last");

			if($last_head.length){
				let $row = $last_head.parent();
				let $money_td = $("<td class='monetary-profile-money'><span data-monetary-money>" + monetary.utils.money_str(profile_money, true) + "</span></td>");
				let currency_name = monetary.settings.currency_name + monetary.settings.currency_separator;

				$("<tr/>").html("<td>" + currency_name + "</td>").append($money_td).insertAfter($row);
			}
		}

		this._$money_elem = $(".monetary-profile-money");
	}

	static create_new_content_box(profile_money = 0){
		let $content_box = yootil.create.profile_content_box("monetary-profile-content-box");
		let $span = $("<span class='monetary-profile-money'><span data-monetary-money>" + monetary.utils.full_money_str(profile_money) + "</span></span>");

		$content_box.append($span);
		$content_box.prependTo("#center-column");
	}

	static add_edit_ability(){
		if(!monetary.settings.members_who_can_edit.length){
			return;
		}

		if(!this._$money_elem.length){
			return;
		}

		let cur_user = yootil.user.id();
		let cur_profile = yootil.page.member.id();

		// Array.prototype.includes is strict, and ProBoards elements are strings for now :(
		// Using .find for the moment until we discuss plugin side of things for v6.

		if(monetary.settings.members_who_can_edit.find(id => (~~ id) == cur_user)){

			// Is the profile owned by the current user?  If so, and is not staff, bail out.

			if(cur_profile == cur_user && !yootil.user.staff()){
				return;
			} else {
				let $edit_image = $("<img class='monetary-edit-icon' src='" + monetary.settings.images.edit + "' alt='Edit' title='Edit' />");

				$edit_image.on("click", () => this.edit_dialog(cur_profile));

				this._$money_elem.append($edit_image);
			}
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
				let current_money = monetary.api.get(profile_id).money();
				let money_str = monetary.utils.money_format(current_money, true);

				$(this).find("input[name=monetary-edit-money]").val(money_str);

				$(monetary.api.events).trigger("monetary.profile_edit_money_open", {

					profile_id,
					current_money

				});
			},

			buttons: {

				"Close": function(){
					$(this).dialog("close");
					$(monetary.api.events).trigger("monetary.profile_edit_money_close", {

						profile_id

					});
				}

			}

		});
	}

	static set_money(profile_id = 0){
		let $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]");
		let data = {

			profile_id,
			new_value: parseFloat($field.val()),
			old_value: monetary.api.get(profile_id).money()

		};

		if(data.new_value != data.old_value){
			$(monetary.api.events).trigger("monetary.profile_edit_money_set", data);
			monetary.api.set(profile_id).money(data.new_value);
			this.save_and_update(profile_id);
		}
	}

	static reset_money(profile_id = 0){
		let data = {

			profile_id,
			old_value: monetary.api.get(profile_id).money(),
			new_value: 0
		};

		if(data.old_value != 0){
			$(monetary.api.events).trigger("monetary.profile_edit_money_reset", data);
			$("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]").val(data.new_value);
			monetary.api.set(profile_id).money(data.new_value);
			this.save_and_update(profile_id);
		}
	}

	static add_remove_money(profile_id = 0, remove = false){
		let $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-adjust-money]");
		let old_value = monetary.api.get(profile_id).money();
		let value = parseFloat($field.val());
		
		let data = {

			profile_id,
			removed: remove,
			added: !remove,
			value,
			old_value,
			new_value: (remove)? (old_value - value) : (old_value + value)

		};

		if(data.old_value != data.new_value){
			$(monetary.api.events).trigger("monetary.profile_edit_money_add_remove", data);

			if(remove){
				monetary.api.decrease(profile_id).money(data.value);
			} else {
				monetary.api.increase(profile_id).money(data.value);
			}

			this.save_and_update(profile_id);
		}
	}

	static save_and_update(profile_id = 0){
		$(monetary.api.events).trigger("monetary.profile_edit_money_before_save", {

			profile_id

		});

		monetary.api.save(profile_id).then(status => {
			this.update(profile_id);

			$(monetary.api.events).trigger("monetary.profile_edit_money_saved", {

				profile_id

			});

			monetary.api.sync(profile_id);
		}).catch(status => {
			pb.window.alert("Monetary Error", "Could not edit money (ID#" + profile_id + ").<br /><br />" + yootil.html_encode(status.message));
		});
	}

	static update(profile_id = 0){
		let data = {

			profile_id,
			money: monetary.api.get(profile_id).money(),
			money_str: ""

		}

		$(monetary.api.events).trigger("monetary.profile_edit_money_before_dom_update", data);

		if(this._using_content_box){
			data.money_str = monetary.utils.full_money_str(data.money);
		} else if(this._using_custom){
			data.money_str = monetary.utils.full_money_str(data.money, this._template);
		} else {
			data.money_str = monetary.utils.money_str(data.money, true);
		}

		this._$money_elem.find("span[data-monetary-money]").html(data.money_str);

		$(monetary.api.events).trigger("monetary.profile_edit_money_after_dom_update", data);
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