// Will handle anything on the profile page

monetary.profile = class {

	static init(){
		$(this.ready.bind(this));
	}

	static ready(){
		if(monetary.settings.profile_new_content_box){
			this.create_new_content_box();
		} else {

			// Add below posts, or look for custom id element.

		}
	}

	static create_new_content_box(){
		let $content_box = yootil.create.profile_content_box("monetary-content-box");

		// Need to pass in the money for this profile (fetch from data later)

		let profile_money = 5000000;

		$content_box.append(monetary.utils.full_money_string(profile_money));
		$content_box.prependTo("#center-column");
	}

};