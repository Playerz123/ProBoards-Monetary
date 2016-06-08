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