/**
 * @class monetary
 * @static
 *
 * Main class.
 *
 * Custom element (i.e profile and mini profile):
 *
 * <div class="monetary-user-money">
 *     {CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}
 * </div>
 */

class monetary {

	static init(){
		this.enums = Object.assign(Object.create(null), {

			PLUGIN_ID: "pixeldepth_monetary",
			PLUGIN_KEY: "pixeldepth_money",
			PLUGIN_VERSION: "{VER}",
			PLUGIN_CALLED: yootil.ts(),

			SYNC_KEY: "monetary",

			YOOTIL_MIN_REQUIRED_VERSION: "2.0.0",

			DATA_KEYS: Object.assign(Object.create(null), {

				MONEY: "m",
				RANK: "rnk",
				NEW_MEMBER_PAID: "nmp",
				BIRTHDAY_PAID: "bd",

				WAGE_POSTS: "wp",
				WAGE_EXPIRY: "we"

			})

		});

		Object.freeze(this.enums);

		if(!this.correct_yootil_version()){
			return;
		}

		this._KEY_DATA = new Map();

		this.settings.init();
		this.setup_data();
		this.importer.init();

		// Extension pre inits
		
		yootil.extension.run("monetary").pre_inits();
		
		// Inits

		this.api.init();

		// Sub modules

		this.initialise_modules();

		// Extension inits

		yootil.extension.run("monetary").inits();

		// Extension post inits

		yootil.extension.run("monetary").post_inits();

		// Ready inits

		$(yootil.extension.run("monetary").ready);
		
		return this;
	}

	static initialise_modules(){
		this.profile.init();
		this.mini_profile.init();

		if(yootil.user.logged_in()){
			this.post.init();
			this.rank_up.init();
			this.wages.init();
			this.new_member.init();
			this.birthday.init();
		}
	}

	static correct_yootil_version(){
		if(typeof yootil == "undefined"){
			console.warn("Yootil is required for the Monetary plugin, but was not found.");

			return false;
		} else if(yootil.compare_version(yootil.version, this.enums.YOOTIL_MIN_REQUIRED_VERSION) == -1){
			console.warn("Monetary plugin requires a mininum Yootil version of " + this.enums.YOOTIL_MIN_REQUIRED_VERSION + ".");

			return false;
		}

		return true;
	}

	/**
	 * Plugin ID.
	 * @return {String}
	 */

	static get PLUGIN_ID(){
		return this.enums.PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this.enums.PLUGIN_KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this.enums.PLUGIN_VERSION;
	}

	static get CALLED(){
		return this.enums.PLUGIN_CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

	static set SETTINGS(settings){
		this._SETTINGS = settings;
	}

	static get SETTINGS(){
		return this._SETTINGS;
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.enums.PLUGIN_KEY];

		for(let [key, value] of Object.entries(user_data)){
			let id = parseInt(key, 10) || 0;

			if(id && !this._KEY_DATA.has(id)){
				this._KEY_DATA.set(id, new monetary.user_data(id, value));
			}
		}
	}

};