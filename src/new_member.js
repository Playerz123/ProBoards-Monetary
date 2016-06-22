monetary.new_member = class {

	static init(){
		this._amount = 0;
		this._pay_old_members = false;
		this._dialog_title = "New Registered Member Reward";
		this._dialog_width = 220;
		this._dialog_height = 350;
		this._message = "You have received {CURRENCY_NAME.LOWER} for becoming a new member:<br /><br />{CURRENCY_SYMBOL}{MONEY}";

		this.setup();

		if(this._amount && !monetary.api.get(yootil.user.id()).new_member_paid()){
			$(this.pay_member.bind(this));
		}
	}

	static setup(){
		if(monetary.SETTINGS){
			let settings = monetary.SETTINGS;

			this._amount = parseFloat(settings.new_user_amount);
			this._pay_old_members = !! ~~ settings.pay_old_users;

			// Dialog

			this._dialog_title = settings.new_user_dialog_title;
			this._dialog_width = parseFloat(settings.new_user_dialog_width) || this._dialog_width;
			this._dialog_height = parseFloat(settings.new_user_dialog_height) || this._dialog_height;
			this._message = settings.new_user_message;
		}
	}

	static pay_member(){
		let now = yootil.ts();
		let registered_on = (yootil.user.registered_on().unix_timestamp * 1000);
		let diff = now - registered_on;

		// We will consider a new member to be someone that registered in the
		// last 48 hours.

		let _48hrs = (60 * 60 * 48) * 1000;

		if(this._pay_old_members || diff <= _48hrs){
			monetary.api.queue.add(queue => {
				this.create_dialog(queue, diff, _48hrs);
			});
		}
	}

	static create_dialog(queue, diff, _48hrs){
		let dialog_msg = pb.text.nl2br(monetary.utils.full_money_str(this._amount, this._message));

		dialog_msg = dialog_msg.replace("{MEMBER_NAME}", yootil.html_encode(yootil.user.name(), true));

		let evt_data = Object.create(null);

		evt_data.user_id = yootil.user.id();
		evt_data.old_member = (diff > _48hrs)? true : false;
		evt_data.difference = diff;
		evt_data.message = dialog_msg;
		evt_data.amount = this._amount;
		evt_data.rejected = false;

		let $dialog = pb.window.dialog("monetary-new-member-dialog", {

			title: this._dialog_title,
			modal: true,
			height: this._dialog_height,
			width: this._dialog_width,
			resizable: false,
			draggable: false,
			html: dialog_msg,

			open: function(){
				$(monetary.api.events).trigger("monetary.new_member.dialog_open", evt_data);
			},

			buttons: {

				"Reject": function(){
					pb.window.confirm("Are you sure you want to reject this reward?", () => {
						evt_data.rejected = true;

						$(monetary.api.events).trigger("monetary.new_member.before_save", evt_data);

						monetary.api.set(evt_data.user_id).new_member_paid();

						monetary.api.save(evt_data.user_id).then(status => {
							$(monetary.api.events).trigger("monetary.new_member.after_save", evt_data);

							monetary.api.sync(evt_data.user_id);
						}).catch(status =>{
							console.warn("Monetary Error [New Member - R]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
						});

						$(this).dialog("close");

						if(queue){
							queue.next();
						}
					});
				},

				"Accept": function(){
					evt_data.rejected = false;

					$(monetary.api.events).trigger("monetary.new_member.before_save", evt_data);

					monetary.api.set(evt_data.user_id).new_member_paid();
					monetary.api.increase(evt_data.user_id).money(evt_data.amount);

					monetary.api.save(evt_data.user_id).then(status => {
						$(monetary.api.events).trigger("monetary.new_member.after_save", evt_data);

						monetary.api.sync(evt_data.user_id);

						// Manually ran sync handler updates so we can update
						// possible pages we might be on.

						monetary.sync_handler.update_all();
					}).catch(status => {
						console.warn("Monetary Error [New Member - A]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
					});

					$(this).dialog("close");

					if(queue){
						queue.next();
					}
				}

			}

		});
	}

	static get amount(){
		return this._amount;
	}

	static get pay_old_members(){
		return this._pay_old_members;
	}

	static get dialog_title(){
		return this._dialog_title;
	}

	static get dialog_width(){
		return this._dialog_width;
	}

	static get dialog_height(){
		return this._dialog_height;
	}

	static get message(){
		return this._message;
	}

};