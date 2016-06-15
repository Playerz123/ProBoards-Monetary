monetary.api = class {

	static init(){
		this._events = Object.create(null);
		this._sync = new yootil.sync(monetary.enums.SYNC_KEY, this.get(yootil.user.id()).data(), monetary.sync_handler);
		this._queue = new yootil.queue(true);
	}

	static data(user_id = 0){
		let id = parseInt(user_id, 10);

		if(id > 0){
			if(!monetary._KEY_DATA.has(id)){
				monetary._KEY_DATA.set(id, new monetary.user_data(id));
			}

			return monetary._KEY_DATA.get(id);
		}

		console.warn("Monetary API: User ID not valid");

		return null;
	}

	static get(user_id = 0){
		let user_data = this.data(user_id);
		
		if(!user_data){
			return null;
		}

		return {

			money(format = false, include_symbol = false){
				let amount = parseFloat(user_data.get(monetary.enums.DATA_KEYS.MONEY));

				if(format){
					amount = monetary.utils.money_str(amount, true, include_symbol)
				}

				return amount;
			},
			
			data(){
				return user_data.get("data");
			},

			rank(){
				return user_data.get(monetary.enums.DATA_KEYS.RANK);
			},

			new_member_paid(){
				return !! user_data.get(monetary.enums.DATA_KEYS.NEW_MEMBER_PAID);
			},
			
			birthday_paid(){
				return user_data.get(monetary.enums.DATA_KEYS.BIRTHDAY_PAID);
			}

		};
	}

	static set(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			money(amount = 0){
				return user_data.set(monetary.enums.DATA_KEYS.MONEY, parseFloat(amount));
			},

			data(value = {}){
				return user_data.set("data", value);
			},

			rank(rank = 0){
				return user_data.set(monetary.enums.DATA_KEYS.RANK, parseInt(rank, 10));
			},

			new_member_paid(){
				return user_data.set(monetary.enums.DATA_KEYS.NEW_MEMBER_PAID, 1);
			},

			birthday_paid(){
				return user_data.set(monetary.enums.DATA_KEYS.BIRTHDAY_PAID, (new Date().getFullYear()));
			}

		};
	}

	static increase(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			money(amount = 0){
				let current_money = user_data.get(monetary.enums.DATA_KEYS.MONEY) || 0;

				return user_data.set(monetary.enums.DATA_KEYS.MONEY, current_money + parseFloat(amount));
			}

		};
	}

	static decrease(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			money(amount = 0){
				let current_money = user_data.get(monetary.enums.DATA_KEYS.MONEY) || 0;

				return user_data.set(monetary.enums.DATA_KEYS.MONEY, current_money - parseFloat(amount));
			}

		};
	}

	static clear(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			all(){
				return user_data.clear("data");
			},

			rank_up(){
				return user_data.clear(monetary.enums.DATA_KEYS.RANK);
			},

			new_member_paid(){
				return user_data.clear(monetary.enums.DATA_KEYS.NEW_MEMBER_PAID);
			},

			birthday_paid(){
				return user_data.clear(monetary.enums.DATA_KEYS.BIRTHDAY_PAID);
			}

		};
	}
	
	static save(user_id = 0){
		return new Promise((resolve, reject) => {
			let user_data = this.data(user_id);

			if(user_data){
				user_data.save().then(status => resolve(status)).catch(status => reject(status));
			} else {
				let evt_obj = Object.create(null);

				evt_obj.user_id = user_id;
				evt_obj.message = "No user data";

				reject(evt_obj);
			}
		});
	}

	static sync(user_id){
		if(user_id != yootil.user.id()){
			return;
		}

		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		let data = user_data.get("data");

		$(monetary.api.events).trigger("monetary.before_sync", data);
		
		this._sync.update(data);

		$(monetary.api.events).trigger("monetary.after_sync", data);
	}

	static refresh_all_data(){
		monetary.setup_data();
	}

	static clear_all_data(){
		monetary._KEY_DATA.clear();
	}

	static get events(){
		return this._events;
	}

	static get queue(){
		return this._queue;
	}

};