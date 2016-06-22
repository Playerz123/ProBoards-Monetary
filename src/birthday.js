monetary.birthday = class {

	static init(){
		this._amount = 0;
		this._dialog_title = "Happy Birthday";
		this._dialog_width = 220;
		this._dialog_height = 350;
		this._message = "You have received {CURRENCY_SYMBOL}{MONEY} for your birthday.";

		this.setup();

		if(this._amount){
			$(this.pay_member.bind(this));
		}
	}

	static setup(){
		if(monetary.SETTINGS){
			let settings = monetary.SETTINGS;

			this._amount = parseFloat(settings.birthday_amount);

			// Dialog

			this._dialog_title = settings.birthday_dialog_title;
			this._dialog_width = parseFloat(settings.birthday_dialog_width) || this._dialog_width;
			this._dialog_height = parseFloat(settings.birthday_dialog_height) || this._dialog_height;
			this._message = settings.birthday_message;
		}
	}

	static pay_member(){
		let birthday = yootil.user.birthday();

		if(birthday && birthday.day && birthday.month){
			let date = new Date();
			let day = date.getDate();
			let month = date.getMonth() + 1;
			let year = date.getFullYear();
			let year_paid = monetary.api.get(yootil.user.id()).birthday_paid();

			if(!year_paid || year_paid < year){
				if(month == birthday.month && day == birthday.day){
					monetary.api.queue.add(queue =>{
						this.create_dialog(queue);
					});
				}
			}
		}
	}

	static create_dialog(queue){
		let dialog_msg = pb.text.nl2br(monetary.utils.full_money_str(this._amount, this._message));

		dialog_msg = dialog_msg.replace("{MEMBER_NAME}", yootil.html_encode(yootil.user.name(), true));

		let evt_data = Object.create(null);

		evt_data.user_id = yootil.user.id();
		evt_data.message = dialog_msg;
		evt_data.amount = this._amount;
		evt_data.rejected = false;

		let $dialog = pb.window.dialog("monetary-birthday-dialog", {

			title: this._dialog_title,
			modal: true,
			height: this._dialog_height,
			width: this._dialog_width,
			resizable: false,
			draggable: false,
			html: dialog_msg,

			open: function(){
				$(monetary.api.events).trigger("monetary.birthday.dialog_open", evt_data);
			},

			buttons: {

				"Reject": function(){
					pb.window.confirm("Are you sure you want to reject this reward?", () => {
						evt_data.rejected = true;

						$(monetary.api.events).trigger("monetary.birthday.before_save", evt_data);

						monetary.api.set(evt_data.user_id).birthday_paid();

						monetary.api.save(evt_data.user_id).then(status => {
							$(monetary.api.events).trigger("monetary.birthday.after_save", evt_data);

							monetary.api.sync(evt_data.user_id);
						}).catch(status =>{
							console.warn("Monetary Error [Birthday - R]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
						});

						$(this).dialog("close");

						if(queue){
							queue.next();
						}
					});
				},

				"Accept": function(){
					evt_data.rejected = false;

					$(monetary.api.events).trigger("monetary.birthday.before_save", evt_data);

					monetary.api.set(evt_data.user_id).birthday_paid();
					monetary.api.increase(evt_data.user_id).money(evt_data.amount);

					monetary.api.save(evt_data.user_id).then(status => {
						$(monetary.api.events).trigger("monetary.birthday.after_save", evt_data);

						monetary.api.sync(evt_data.user_id);

						// Manually ran sync handler updates so we can update
						// possible pages we might be on.

						monetary.sync_handler.update_all();
					}).catch(status => {
						console.warn("Monetary Error [Birthday - A]", "Could not save data (ID#" + evt_data.user_id + ").<br /><br />" + yootil.html_encode(status.message));
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