monetary.mini_profile = class {

	static init(){
		this.settings = Object.create(null);
		this.setup();

		if(!this.settings.show_money){
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

	static setup(){
		if(monetary.SETTINGS){
			let settings = monetary.SETTINGS;

			this.settings.show_money = !! ~~ settings.mini_profile_show_money;
		}
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

				if(!user_id_match || !parseInt(user_id_match[1], 10)){
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

	static get show_money(){
		return this.settings.show_money;
	}

};