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
		$(this.ready.bind(this));
	}

	static ready(){
		this.add_money_to_profile();
		this.add_edit_ability();
	}

	static add_money_to_profile(){
		let profile_money = monetary.api.get(yootil.page.member.id()).money();

		if(monetary.settings.profile_new_content_box){
			this.create_new_content_box(profile_money);
		} else {

			// Look for custom element, otherwise we in insert
			// after the date registered.

			let $custom = $(".monetary-profile-money");

			if($custom.length){
				let tpl = $custom.text();

				$custom.html(monetary.utils.full_money_str(profile_money, tpl)).show();
			} else {
				let $last_head = $("td.headings:last");

				if($last_head.length){
					let $row = $last_head.parent();
					let $money_td = $("<td class='monetary-profile-money'>" + monetary.utils.money_str(profile_money, true) + "</td>");
					let currency_name = monetary.settings.currency_name + monetary.settings.currency_separator;

					$("<tr/>").html("<td>" + currency_name + "</td>").append($money_td).insertAfter($row);
				}
			}
		}
	}

	static create_new_content_box(profile_money = 0){
		let $content_box = yootil.create.profile_content_box("monetary-profile-content-box");
		let $span = $("<span class='monetary-profile-money'>" + monetary.utils.full_money_str(profile_money) + "</span>");

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

				$edit_image.on("click", () => console.log("hi"));

				$money_elem.append($edit_image);
			}
		}
	}

};