/**
 * @class monetary
 * @static
 *
 * Main class.
 */

class monetary {

	static init(){
		this._PLUGIN_ID = "pixeldepth_monetary";
		this._KEY = "pixeldepth_money";
		this._VERSION = "{VER}";
		this._CALLED = yootil.ts();
		this._PLUGIN = {};
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
		return this._PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this._KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this._VERSION;
	}

	static get CALLED(){
		return this._CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this._KEY];

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