monetary.api = class {

	static data(user_id = 0){
		let id = ~~ user_id;

		if(id > 0){
			if(!monetary._DATA.has(id)){
				monetary._DATA.set(id, new monetary.user_data(id));
			}

			return monetary._DATA.get(id);
		}

		console.error("monetary.api: User ID not valid");

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
	
	static save(user_id = 0){
		let p = new Promise((resolve, reject) => {
			let user_data = this.data(user_id);

			if(user_data){
				user_data.save().then(status => resolve(status)).catch(status => reject(status));
			} else {
				reject({
					message: "No data"
				});
			}
		});
		
		return p;
	}

	static sync(user_id){
		if(user_id != yootil.user.id()){
			return;
		}

		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		this._sync.update(user_data.get("data"));
	}

};