/**
 * Will handle anything on the profile page
 *
 * Custom element:
 *
 * <div class="monetary-profile-money-custom">
 *     {CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}
 * </div>
 */


monetary.profile = class {

	static init(){
		this.using_custom = false;
		this.using_content_box = false;
		this.template = null;

		$(this.ready.bind(this));
	}

	static ready(){
		this.add_money_to_profile();
		this.add_edit_ability();
	}

	static add_money_to_profile(){
		let profile_money = monetary.api.get(yootil.page.member.id()).money();

		if(monetary.settings.profile_new_content_box){
			this.using_content_box = true;
			this.create_new_content_box(profile_money);
		} else {

			// Look for custom element, otherwise we in insert
			// after the date registered.

			let $custom = $(".monetary-profile-money");

			if($custom.length){
				this.using_custom = true;
				this.template = $custom.text();

				$custom.html("<span data-monetary-money>" + monetary.utils.full_money_str(profile_money, this.template) + "</span>").show();
			} else {
				let $last_head = $("td.headings:last");

				if($last_head.length){
					let $row = $last_head.parent();
					let $money_td = $("<td class='monetary-profile-money'><span data-monetary-money>" + monetary.utils.money_str(profile_money, true) + "</span></td>");
					let currency_name = monetary.settings.currency_name + monetary.settings.currency_separator;

					$("<tr/>").html("<td>" + currency_name + "</td>").append($money_td).insertAfter($row);
				}
			}
		}
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

		let $money_elem = $(".monetary-profile-money");

		// Can't find the default element?  Look for custom one then.

		if(!$money_elem.length){
			$money_elem = $(".monetary-profile-money-custom");
		}

		if(!$money_elem.length){
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

				$edit_image.on("click", () => this.edit_dialog(cur_profile, $money_elem));

				$money_elem.append($edit_image);
			}
		}
	}

	static edit_dialog(profile_id = 0, $money_elem = null){
		if(!profile_id || !$money_elem){
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

		$dialog_html.find("button#monetary-set-money").on("click", () => this.set_money(profile_id, $money_elem));
		$dialog_html.find("button#monetary-reset-money").on("click", () => this.reset_money(profile_id, $money_elem));
		$dialog_html.find("button#monetary-add-money").on("click", () => this.add_remove_money(profile_id, $money_elem));
		$dialog_html.find("button#monetary-remove-money").on("click", () => this.add_remove_money(profile_id, $money_elem, true));

		let $dialog = pb.window.dialog("monetary-edit-money-dialog", {

			title: "Edit " + monetary.settings.currency_name,
			modal: true,
			height: 180,
			width: 300,
			resizable: false,
			draggable: false,
			html: $dialog_html,

			open: function(){
				let users_money = monetary.utils.money_format(monetary.api.get(profile_id).money(), true);

				$(this).find("input[name=monetary-edit-money]").val(users_money);
			},

			buttons: {

				"Close": function(){
					$(this).dialog("close");
				}

			}

		});
	}

	static set_money(profile_id = 0, $money_elem = null){
		let $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]");
		let value = parseFloat($field.val());
		let current_money = monetary.api.get(profile_id).money();

		if(value != current_money){
			monetary.api.set(profile_id).money(value);
			this.save_and_update(profile_id, $money_elem);
		}
	}

	static reset_money(profile_id = 0, $money_elem = null){
		let current_money = monetary.api.get(profile_id).money();

		if(current_money != 0){
			$("#monetary-edit-money-dialog").find("input[name=monetary-edit-money]").val(0);
			monetary.api.set(profile_id).money(0);
			this.save_and_update(profile_id, $money_elem);
		}
	}

	static add_remove_money(profile_id = 0, $money_elem = null, remove = false){
		let $field = $("#monetary-edit-money-dialog").find("input[name=monetary-edit-adjust-money]");
		let value = parseFloat($field.val());
		let current_money = monetary.api.get(profile_id).money();
		let new_value = (remove)? (current_money - value) : (current_money + value);

		if(current_money != new_value){
			if(remove){
				monetary.api.decrease(profile_id).money(value);
			} else {
				monetary.api.increase(profile_id).money(value);
			}

			this.save_and_update(profile_id, $money_elem);
		}
	}

	static save_and_update(profile_id = 0, $money_elem = null){
		monetary.api.save(profile_id).then(status => {
			let money = monetary.api.get(profile_id).money();
			let money_str = "";

			if(this.using_content_box){
				money_str = monetary.utils.full_money_str(money);
			} else if(this.using_custom){
				money_str = monetary.utils.full_money_str(money, this.template);
			} else {
				money_str = monetary.utils.money_str(money, true);
			}

			$money_elem.find("span[data-monetary-money]").html(money_str);
		}).catch(status => {
			pb.window.alert("Monetary Error", "Could not edit money (ID#" + profile_id + ").<br /><br />" + yootil.html_encode(status.message));
		});
	}

};