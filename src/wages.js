monetary.wages = class {

	static init(){
		this.settings = Object.create(null);

		this.settings.group_rules = new Map();
		this.settings.member_rules = new Map();

		this.setup();

		if(this.settings.enabled && (yootil.location.posting() || yootil.location.thread())){
			this.check_wage_rules();
		}
	}

	static setup(){
		if(monetary.SETTINGS){
			let settings = monetary.SETTINGS;

			this.settings.enabled = !! ~~ settings.wages_enabled;
			this.settings.paid_when = Math.max(1, parseInt(settings.wages_paid_when, 10)) || 1;
			this.settings.bonus = parseFloat(settings.wages_bonus) || 0;

			// Group earning rules

			for(let grp_af of settings.wages_group_rules){
				let grp_amounts = Object.create(null);

				grp_amounts.amount = parseFloat(grp_af.amount) || 0;
				grp_amounts.posts = parseInt(grp_af.minimum_posts, 10) || 0;

				for(let grp of grp_af.groups){
					this.settings.group_rules.set(parseInt(grp, 10), grp_amounts);
				}
			}

			// Member earning rules

			for(let mem_af of settings.wages_member_rules){
				let mem_amounts = Object.create(null);

				mem_amounts.amount = parseFloat(mem_af.amount) || 0;
				mem_amounts.posts = parseInt(mem_af.minimum_posts, 10) || 0;

				this.settings.member_rules.set(mem_amounts.posts, mem_amounts);
			}
		}
	}

	static check_wage_rules(){
		if(!this.settings.group_rules.size && !this.settings.member_rules.size){
			monetary.api.clear(yootil.user.id()).wage_posts();
			monetary.api.clear(yootil.user.id()).wage_expiry();
			
			return;
		}

		let user_id = yootil.user.id();
		let highest_amount = 0;
		let posts = monetary.api.get(user_id).wage_posts();

		// Check group rules first

		let grps = yootil.user.group_ids();
		
		if(Array.isArray(grps) && grps.length){
			for(let id of grps){
				if(this.settings.group_rules.has(parseInt(id, 10))){
					let rule = this.settings.group_rules.get(parseInt(id, 10));

					if(rule.amount > highest_amount){
						highest_amount = rule.amount;
					}
				}
			}
		}
		
		// No group amount?  Then look for highest member rule.

		if(!highest_amount){
			for(let [key, val] of this.settings.member_rules){
				if(posts >= key){
					highest_amount = val.amount;
				}
			}
		}

		let expiry = monetary.api.get(user_id).wage_expiry();
		let pay_when = ((60 * 60 * 24) * this.settings.paid_when) * 1000;
		let now = yootil.ts();
		let wage_expire = expiry;
		
		if(!expiry){
			wage_expire = now + pay_when;
		}

		let post_incremented = false;

		/*console.log("Posts: ", posts);
		console.log("Amount: ", highest_amount);
		console.log("Now: ", now, new Date(now));
		console.log("Pay On: ", expiry, new Date(wage_expire));
		console.log("Can Pay: ", now >= wage_expire);*/

		$(monetary.api.events).on("monetary.post.before", (evt, data) => {
			if(highest_amount && now >= wage_expire){

				// Add bonus

				if(this.settings.bonus){
					highest_amount += (yootil.user.posts() * this.settings.bonus) / 100;
				}

				data.add += highest_amount;

				monetary.api.set(user_id).wage_posts(0);
				monetary.api.set(user_id).wage_expiry(now + pay_when);
			} else {
				if(!post_incremented){
					post_incremented = true;
					monetary.api.increase(user_id).wage_posts();
				}

				if(!expiry){
					monetary.api.set(user_id).wage_expiry(now + pay_when);
				}
			}
		});
	}

	static get enabled(){
		return this.settings.enabled;
	}

	static get paid_when(){
		return this.settings.paid_when;
	}

	static get bonus(){
		return this.settings.bonus;
	}

	static get group_rules(){
		return this.settings.group_rules;
	}

	static get member_rules(){
		return this.settings.member_rules;
	}

};