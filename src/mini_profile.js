monetary.mini_profile = class {

	static init(){
		let location_check = (

			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts()

		);

		if(!location_check){
			return;
		}

		$(this.ready.bind(this));
	}

	static ready(){
		this.add_money_to_mini_profiles();
		yootil.event.after_search(this.add_money_to_mini_profiles, this);
	}

	static add_money_to_mini_profiles(){
		let mini_profiles = yootil.get
	}

};