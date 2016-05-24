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
		let data = this.data(user_id);
		
		if(!data){
			return null;
		}

		return {

			money(format = false, include_symbol = false){
				let amount = data.get(monetary.ENUMS.DATA_KEYS.MONEY);

				if(format){
					amount = monetary.utils.money_str(amount, true, include_symbol)
				}

				return amount;
			}

		};
	}

	set(){
		let self = this;

		return {

			money(amount = 0){
				self._data.m = parseFloat(amount);
			}

		};
	}

	increase(){
		let self = this;

		return {

			money(amount = 0){
				self._data.m += parseFloat(amount);
			}

		};
	}

	decrease(){
		let self = this;

		return {

			money(amount = 0){
				self._data.m -= parseFloat(amount);
			}

		};
	}

};