/**
 * @class monetary
 * @static
 *
 * Main class.
 */

class monetary {

	static init(){
		this.ENUMS = {

			PLUGIN_ID: "pixeldepth_monetary",
			PLUGIN_KEY: "pixeldepth_money",
			PLUGIN_VERSION: "{VER}",
			PLUGIN_CALLED: yootil.ts(),

			DATA_KEYS: {

				MONEY: "m"

			}

		};

		Object.freeze(this.ENUMS);

		this._DATA = new Map();

		this.settings.setup();
		this.setup_data();

		if(this.settings.profile_show_money && yootil.location.profile_home() && yootil.page.member.exists()){
			this.profile.init();
		}

		return this;
	}

	/**
	 * Plugin ID.
	 * @return {String}
	 */

	static get PLUGIN_ID(){
		return this.ENUMS.PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this.ENUMS.PLUGIN_KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this.ENUMS.PLUGIN_VERSION;
	}

	static get CALLED(){
		return this.ENUMS.PLUGIN_CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.ENUMS.PLUGIN_KEY];

		for(let [key, value] of Object.entries(user_data)){
			if(!this._DATA.has(key)){
				this._DATA.set(key, new monetary.user_data(key, value));
			}
		}
	}

	static data(user_id = 0){
		return monetary.api.data(user_id);
	}

}