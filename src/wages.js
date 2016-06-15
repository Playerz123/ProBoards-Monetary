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
				grp_amounts.posts = parseFloat(grp_af.posts) || 0;

				for(let grp of grp_af.groups){
					this.settings.group_rules.set(parseInt(grp, 10), grp_amounts);
				}
			}

			// Member earning rules

			for(let mem_af of settings.wages_member_rules){
				let mem_amounts = Object.create(null);

				mem_amounts.amount = parseFloat(mem_af.amount) || 0;
				mem_amounts.posts = parseFloat(mem_af.posts) || 0;

				this.settings.member_rules.set(parseInt(mem_af.posts, 10), mem_amounts);
			}
		}
	}

	static check_wage_rules(){

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