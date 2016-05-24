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
		$(this.ready.bind(this));
	}

	static ready(){
		let profile_money = monetary.api.get(yootil.page.member.id()).money();

		if(monetary.settings.profile_new_content_box){
			this.create_new_content_box(profile_money);
		} else {

			// Look for custom element, otherwise we in insert
			// below the post count.

			let $custom = $(".monetary-profile-money");

			if($custom.length){
				let tpl = $custom.text();
				
				$custom.html(monetary.utils.full_money_str(profile_money, tpl)).show();
			} else {
				let $last_head = $("td.headings:last");

				if($last_head.length){
					let $row = $last_head.parent();
					let $money_td = $("<td class='monetary-profile-money-td'>" + monetary.utils.money_str(profile_money, true) + "</td>");
					let currency_name = monetary.settings.currency_name + monetary.settings.currency_separator;

					$("<tr/>").html("<td>" + currency_name + "</td>").append($money_td).insertAfter($row);
				}
			}
		}
	}

	static create_new_content_box(profile_money = 0){
		let $content_box = yootil.create.profile_content_box("monetary-profile-content-box");

		$content_box.append(monetary.utils.full_money_str(profile_money));
		$content_box.prependTo("#center-column");
	}

};