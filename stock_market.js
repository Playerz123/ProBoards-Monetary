money.stock_market = (function(){

	return {
	
		fetching: false,
		
		data: {},
		
		symbols: {},
		
		html: "",
		
		current: 1,
		
		total: 0,
		
		settings: {
			enabled: true,
			show_chart: true,
			compact: false
		},
		
		replacements: {},
		
		invest_data: {},
		
		init: function(){
			this.setup();
			
			if(this.settings.enabled){
				if(money.images.stock_market){
					yootil.bar.add("/stockmarket", money.images.stock_market, "Stock Market", "pdmsstock");
				}
			}
			
			if(yootil.location.check.forum() && location.href.match(/\/stockmarket\/?/i)){
				if(this.settings.enabled){
					this.check_for_data();
					this.start();
				} else {
					money.show_default();
				}
			}
		},
		
		register: function(){
			money.modules.push(this);
			return this;
		},
		
		start: function(){
			this.html = "<div id='stock-wrapper'><img src='" + money.images.preloader + "' /></div>";
			this.fetch_stock_data();
			
			yootil.create.page("stockmarket", "Stock Market");
			yootil.create.nav_branch("/stockmarket/", "Stock Market");	
			
			yootil.create.container("<div style='float: left'>Stock Market Investments</div><div style='float: right'>Funds: " + money.settings.money_symbol + "<span id='pd_money_wallet_amount'>" + money.get(true) + "</span></div>", "<div id='stock-invest-content'><img src='" + money.images.invest_preloader + "' /></div>").show().appendTo("#content");
			
			yootil.create.container("<div style='float: left'>Stock Market<span id='stock-market-total'></span></div><div style='cursor: pointer; float: right'><span id='stock-left'>&laquo; Previous</span> &nbsp;&nbsp;&nbsp; <span id='stock-right'>Next &raquo;</span></div>", this.html).show().appendTo("#content");
		},
		
		setup: function(){
			if(money.plugin){
				var settings = money.plugin.settings;
				
				this.settings.enabled = (settings.stock_enabled == "0")? false : true;
				this.settings.show_chart = (settings.stock_show_chart == "0")? false : true;
				this.settings.compact = (settings.compact_layout && settings.compact_layout == 1)? true : false;
				
				if(settings.stock_replace && settings.stock_replace.length){
					for(var r = 0, l = settings.stock_replace.length; r < l; r ++){
						this.replacements[settings.stock_replace[r].current_symbol] = settings.stock_replace[r];
					}
				}
			}
		},
		
		get_stock_name: function(stock_id){
			if(this.replacements[stock_id] && this.replacements[stock_id].new_name.length){
				return this.replacements[stock_id].new_name;
			}
			
			if(this.symbols[stock_id]){
				return this.symbols[stock_id].Name;
			}
			
			return stock_id;
		},
		
		get_stock_symbol: function(stock_id){
			if(this.replacements[stock_id] && this.replacements[stock_id].new_symbol.length){
				return this.replacements[stock_id].new_symbol;
			}
			
			return stock_id;
		},
		
		fetch_stock_data: function(){
			this.fetching = true;
			
			$.ajax({
				url: "http://pixeldepth.net/proboards/plugins/monetary_system/stock/quotes.php",
				context: this,
				crossDomain: true,
				dataType: "json"		
			}).done(function(data){
				this.fetching = false;
				
				if(data && data.results && data.results.length){
					this.data = data.results;
				}
					
				this.build_stock_table();
			});
		},
		
		check_for_data: function(){
			if(money.data.s){
				this.invest_data = money.data.s;
			}
		},
		
		has_invested: function(stock_symbol){
			if(this.invest_data[stock_symbol]){
				return true;
			}
			
			return false;
		},
		
		remove_from_data: function(stock_symbol){
			if(this.has_invested(stock_symbol)){
				delete this.invest_data[stock_symbol];
			}
		},
		
		refund_stock: function(stock_id){
			var self = this;
			var info = "";
			
			info += "Your investment in " + this.get_stock_symbol(stock_id) + " is being refunded, as the";
			info += " stock has been removed from the market.<br /><br />";
			info += "Refund: " + money.settings.money_symbol + yootil.number_format(money.format(parseInt(this.invest_data[stock_id].a) * parseFloat(this.invest_data[stock_id].b), true));
			
			proboards.dialog("stock-refund-dialog", {
				modal: true,
				height: 220,
				width: 320,
				title: "Refunding Stock",
				html: info,
				resizable: false,
				draggable: false,
				
				buttons: {
									
					"Accept Refund": function(){
											
						var amount = (self.has_invested(stock_id))? self.invest_amount(stock_id) : 0;
						
						if(amount){
							var bid = self.invest_data[stock_id].b;
							var total_cost = (bid * amount);
							
							money.data.m += money.format(total_cost);
								
							self.remove_from_data(stock_id);
							self.update_wallet();
							self.save_investments();
						}
					
						$(this).dialog("close");
					}
				}
			});
		},
		
		// How much stock?
		
		invest_amount: function(stock_symbol){
			if(this.has_invested(stock_symbol)){
				return this.invest_data[stock_symbol].a;
			}
			
			return 0;
		},
		
		save_investments: function(){
			money.data.s = this.invest_data;
			yootil.key.set("pixeldepth_money", money.data, null, true);
		},
		
		insert_invest_row: function(stock_id){
			var new_bid_total = (parseInt(this.invest_data[stock_id].a) * parseFloat(this.symbols[stock_id].BidRealtime));
			var old_bid_total = (parseInt(this.invest_data[stock_id].a) * parseFloat(this.invest_data[stock_id].b));
			var html = "<tr class='stock-invest-content-row' id='stock-invest-row-" + stock_id + "' style='display: none'>";
			
			html += "<td>" + this.get_stock_name(stock_id);
			
			if(!this.settings.compact){
				html += " (" + this.get_stock_symbol(stock_id) + ")";
			}
			
			html += "</td>";
			html += "<td>" + yootil.number_format(this.invest_data[stock_id].b) + "</td>";
			html += "<td>" + yootil.number_format(this.symbols[stock_id].BidRealtime) + "</td>";
			
			if(!this.settings.compact){
				html += "<td>" + yootil.number_format(this.invest_data[stock_id].a) + "</td>";
			}
			
			html += "<td>" + money.settings.money_symbol + yootil.number_format(money.format(parseInt(this.invest_data[stock_id].a) * parseFloat(this.invest_data[stock_id].b), true)); + "</td>";
			html += "<td>" + money.settings.money_symbol + yootil.number_format(money.format(new_bid_total - old_bid_total, true)) + "</td>";
			html += "<td><button class='stock-sell-button' data-stock-id='" + stock_id + "'>Sell</button></td>";

			html += "</tr>";
			
			var self = this;
			
			if(!$("#stock-investments-table").length){
				this.create_investment_headers();
			}
			
			if($("#stock-invest-row-" + stock_id).length){
				$("#stock-invest-row-" + stock_id).replaceWith($(html));
			} else {
				$("#stock-investments-table").append($(html).hide());
			}
			
			$("#stock-investments-table").find(".stock-sell-button[data-stock-id=" + stock_id + "]").click(function(){
				$.proxy(self.bind_sell_event, self)(this); 
			})
			
			$("#stock-invest-row-" + stock_id).show("normal");
		},
		
		remove_invest_row: function(stock_id){
			$("#stock-invest-row-" + stock_id).hide("normal", function(){
				$(this).remove();
				
				var invest_table = $("#stock-investments-table");
									
				if(invest_table.find("tr").length == 1){
					invest_table.remove();
					$("#stock-invest-content").html("<span>You currently have no investments.</span>");
				}
			});
		},
		
		update_wallet: function(){
			$("#pd_money_wallet_amount").html(money.get(true));
		},
		
		buy_stock: function(stock_symbol, amount, insert_invest_row){
			if(stock_symbol && amount && this.stock_exists(stock_symbol)){
				var current_amount = (this.has_invested(stock_symbol))? this.invest_amount(stock_symbol) : 0;
				var updating = (current_amount)? false : true;
				var total_amount = (current_amount + amount);
				var bid = this.symbols[stock_symbol].BidRealtime;
				var total_cost = (bid * amount);
				
				if(money.get() < total_cost){
					proboards.alert("Not Enough Funds", "You do not have enough funds to make this purchase.", {
						modal: true,
						resizable: false,
						draggable: false
					});
				} else {
					money.data.m -= money.format(total_cost);
					
					this.invest_data[stock_symbol] = {
						a: total_amount,
						b: bid
					};
					
					this.insert_invest_row(stock_symbol);
					this.update_wallet();
					this.save_investments();
				}
			} else {
				proboards.alert("An Error Occurred", "An error occurred, please try again.", {
					modal: true,
					resizable: false,
					draggable: false
				});
			}
		},
		
		stock_exists: function(stock_symbol){
			if(this.symbols[stock_symbol]){
				return true;
			}
			
			return false;
		},
		
		create_investment_headers: function(return_html){
			var html = "";
						
			html += "<table id='stock-investments-table'><tr class='stock-invest-content-headers'>";
			html += "<th style='width: 30%'>Stock Name</th>";
			html += "<th style='width: 12%'>Paid Bid</th>";
			html += "<th style='width: 12%'>Current Bid</th>";
			
			if(!this.settings.compact){
				html += "<th style='width: 12%'>Total Units</th>";
			}
			
			html += "<th style='width: 13%'>Total Cost</th>";
			html += "<th style='width: 15%'>Profit</th>";
			html += "<th style='width: 6%'></th>";
			html += "</tr>";
			
			if(return_html){
				return html;
			}
			
			html += "</table>";
			
			$("#stock-invest-content").empty().html(html);
		},
		
		current_investment_list: function(){
			var invest = $("#stock-invest-content");
			var html = "";
						
			html += this.create_investment_headers(true);
			
			var table = "";
			
			for(var key in this.invest_data){
				if(!this.symbols[key]){
					this.refund_stock(key);
					continue;
				}
				
				table += "<tr class='stock-invest-content-row' id='stock-invest-row-" + key + "'>";
				table += "<td>" + this.get_stock_name(key);
				
				if(!this.settings.compact){
					tbale += " (" + this.get_stock_symbol(key) + ")";
				}
				
				table += "</td>";
				
				table += "<td>" + yootil.number_format(this.invest_data[key].b) + "</td>";
				table += "<td>" + yootil.number_format(this.symbols[key].BidRealtime) + "</td>";
				
				if(!this.settings.compact){
					table += "<td>" + yootil.number_format(this.invest_data[key].a) + "</td>";
				}
				
				table += "<td>" + money.settings.money_symbol + yootil.number_format(money.format(parseInt(this.invest_data[key].a) * parseFloat(this.invest_data[key].b), true)); + "</td>";
				
				var profit_html = "";
				var new_bid_total = (parseInt(this.invest_data[key].a) * parseFloat(this.symbols[key].BidRealtime));
				var old_bid_total = (parseInt(this.invest_data[key].a) * parseFloat(this.invest_data[key].b));
				var formatted_total = money.settings.money_symbol + yootil.number_format(money.format(new_bid_total - old_bid_total, true));
							
				if(new_bid_total < old_bid_total){
					profit_html += "<span class='stock-market-loss'>" + formatted_total + "</span> <img src='" + money.images.down + "' style='position: relative; top: 2px;' />";
				} else {				
					if(new_bid_total > old_bid_total){
						profit_html += "<span class='stock-market-profit'>" + formatted_total + "</span> <img src='" + money.images.up + "' style='position: relative; top: 2px;' />";
					} else {
						profit_html += formatted_total;
					}
				}
				
				table += "<td>" + profit_html + "</td>";
				table += "<td><button class='stock-sell-button' data-stock-id='" + key + "'>Sell</button></td>";
				table += "</tr>";
			}
			
			if(!table.length){
				html = "<span>You currently have no investments.</span>";
			} else {
				table += "</table>";
				html += table;
			}

			var stock_invest_obj = $(html);
			var self = this;
			
			stock_invest_obj.find(".stock-sell-button").click(function(){
				$.proxy(self.bind_sell_event, self)(this); 
			});
			
			invest.empty().append(stock_invest_obj);
		},
		
		bind_sell_event: function(button){
			var stock_id = $(button).attr("data-stock-id");
			
			var amount = parseInt(this.invest_data[stock_id].a);
			var bid = parseInt(this.symbols[stock_id].BidRealtime);
			var s = (amount == 1)? "" : "s";
			var info = "";
				
			info += "<strong>" + this.get_stock_name(stock_id) + " (" + this.get_stock_symbol(stock_id) + ")</strong><br /><br />";
			info += "Purchased Amount: " + yootil.number_format(amount) + " unit" + s + "<br />";
			info += "Paid Bid: " + yootil.number_format(this.invest_data[stock_id].b) + "<br />";
			info += "Current Bid: " + yootil.number_format(this.symbols[stock_id].BidRealtime) + "<br /><br />";
			info += "Total Return: " + money.settings.money_symbol + yootil.number_format(money.format(amount * parseFloat(this.symbols[stock_id].BidRealtime), true));
			
			var self = this;
			
			proboards.dialog("stock-sell-dialog", {
				modal: true,
				height: 220,
				width: 320,
				title: "Sell Stock",
				html: info,
				resizable: false,
				draggable: false,
				
				buttons: {
				
					Cancel: function(){
						$(this).dialog("close");
					},
					
					"Sell Stock": function(){
						proboards.dialog("stock-sell-confirm-dialog", { 
							title: "Confirm Selling Stock",
							html: "Are you sure you want to sell this stock?", 
							modal: true,
							resizable: false,
							draggable: false,
							
							buttons: {
							
								No: function(){ 
									$(this).dialog('close');
								},
								
								"Yes": function(){
									self.sell_stock(stock_id);
									$(this).dialog("close");
								}
							}
						});
					
						$(this).dialog("close");
					}
				}
			});	
		},
		
		sell_stock: function(stock_id){
			var amount = (this.has_invested(stock_id))? this.invest_amount(stock_id) : 0;
			
			if(amount){
				var bid = this.symbols[stock_id].BidRealtime;
				var total_cost = (bid * amount);
				
				money.data.m += money.format(total_cost);
					
				this.remove_from_data(stock_id);
				this.update_wallet();
				this.remove_invest_row(stock_id);				
				this.save_investments();
			}
		},
		
		// TODO: Tidy up inline CSS
		
		build_stock_table: function(){
			var stock_table = $("<div id='stock-content-strip'></div>");
			var self = this;
			var compact_width = (this.settings.compact)? " style='width: 600px'" : "";
			var chart_size = (this.settings.compact)? "m" : "l";
			
			$("#stock-market-total").html(" (" + this.data.length + ")");
			
			for(var d = 0, dl = this.data.length; d < dl; d ++){
				var up_down = "";
				var stock_html = "";
				
				if(this.replacements[this.data[d].Symbol] && this.replacements[this.data[d].Symbol].disabled && this.replacements[this.data[d].Symbol].disabled == 1){
					delete this.replacements[this.data[d].Symbol];
					continue;
				}
				
				this.symbols[this.data[d].Symbol] = this.data[d];
				
				if(parseFloat(this.data[d].PreviousClose) < parseFloat(this.data[d].BidRealtime)){
					up_down = "<img src='" + money.images.up + "' style='position: relative; top: 2px;' /> ";
				} else if(parseFloat(this.data[d].PreviousClose) > parseFloat(this.data[d].BidRealtime)){
					up_down = "<img src='" + money.images.down + "' style='position: relative; top: 2px;' /> ";
				}

				if(this.data[d].ChangeAndPercent == 0){
					this.data[d].ChangeAndPercent = "0.00";
				}

				if(this.data[d].RealPercentChange == 0){
					this.data[d].RealPercentChange = "0.00";
				}
								
				stock_html += "<div class='stock-block'" + compact_width + ">";
				stock_html += "<div class='stock-block-header'>";
				stock_html += "<div style='float: left;'>" + this.get_stock_name(this.data[d].Symbol) + " (" + this.get_stock_symbol(this.data[d].Symbol) + ") <span style='position: relative; top: -2px;' id='stock-invest-buttons'><button class='stock-buy-button' data-stock-id='" + this.data[d].Symbol + "'>Buy</button></span></div>";
				stock_html += "<div style='float: right'>" + this.data[d].BidRealtime + " " + up_down + "<span style='font-size: 14px;'>" + this.data[d].ChangeAndPercent + " (" + this.data[d].RealPercentChange + "%)</span></div><br style='clear: both' /></div>";
				
				stock_html += "<table class='stock-block-table-left'>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Previous Close:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].PreviousClose + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Bid:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].BidRealtime + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Volume:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].Volume + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>1 Year Target:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].YearTarget + "</td>";
				stock_html += "</tr>";
				
				stock_html += "</table>";
				stock_html += "<table class='stock-block-table-center'>";
			
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Open:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].Open + "</td>";
				stock_html += "</tr>";

				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Day's Low:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].DaysLow + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Day's High:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].DaysHigh + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>P/E:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].PERatio + "</td>";
				stock_html += "</tr>";
				
				stock_html += "</table>";
				stock_html += "<table class='stock-block-table-right'>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Days Range:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].DaysRange + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>52 Week Range:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].Week52Range + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>Market Cap.:</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].MarketCapitalization + "</td>";
				stock_html += "</tr>";
				
				stock_html += "<tr>";
				stock_html += "<td class='stock-block-cell-left'>EPS</td>";
				stock_html += "<td class='stock-block-cell-right'>" + this.data[d].EPS + "</td>";
				stock_html += "</tr>";
				
				stock_html += "</table>";
				
				stock_html += "<br style='clear: both' />";
				
				if(this.settings.show_chart){
					stock_html += "<div class='stock-block-chart'>";
					stock_html += "<img src='http://chart.finance.yahoo.com/z?s=" + this.data[d].Symbol + "&t=2w&l=off&z=" + chart_size + "' />";
					stock_html += "</div>";
				}
				
				stock_html += "</div>";
				
				var stock_obj = $(stock_html);
				
				stock_obj.find(".stock-buy-button").click(function(){
					var stock_id = $(this).attr("data-stock-id");
					var buy_element = "<div title='Buy Stock (" + self.get_stock_symbol(stock_id) + ")'><p>Stock Units: <input type='text' style='width: 100px' name='stock-buy-" + stock_id + "' /></p></div>";
					
					if(self.has_invested(stock_id) && self.invest_amount(stock_id) > 0){
						if(self.invest_data[stock_id].b != self.symbols[stock_id].BidRealtime){
							proboards.alert("An Error Occurred", "You have already made an investment in " + self.get_stock_name(stock_id) + " (" + self.get_stock_symbol(stock_id) + ") at a different price.  You will need to sell your current units before investing into this company again.", {
								modal: true,
								resizable: false,
								draggable: false,
								width: 350,
								height: 200
							});
						
							return;
						}
					}
								
					$(buy_element).dialog({
						modal: true,
						height: 140,
						width: 300,
						resizable: false,
						draggable: false,
						open: function(){
							$(this).find("input[name=stock-buy-" + stock_id + "]").val("");
						},
						
						buttons: {
						
							Cancel: function(){
								$(this).dialog("close");
							},
							
							"Buy Stock": function(){
								var amount = parseInt($(this).find("input[name=stock-buy-" + stock_id + "]").val());
															
								if(amount > 0){
									var s = (amount == 1)? "" : "s";
									var info = "";
									
									info += "<strong>" + self.get_stock_name(stock_id) + " (" + self.get_stock_symbol(stock_id) + ")</strong><br /><br />";
									info += "Purchase Amount: " + yootil.number_format(amount) + " unit" + s + "<br />";
									info += "Cost Per Unit: " + money.settings.money_symbol + yootil.number_format(self.symbols[stock_id].BidRealtime) + "<br /><br />";
									info += "Total Purchase: " + money.settings.money_symbol + yootil.number_format(money.format(amount * parseFloat(self.symbols[stock_id].BidRealtime), true));
																		
									proboards.dialog("stock-buy-confirm", { 
										title: "Confirm Purchase",
										html: info, 
										modal: true,
										resizable: false,
										draggable: false,
										
										buttons: {
										
											No: function(){ 
												$(this).dialog('close');
											},
											
											"Yes": function(){
												self.buy_stock(stock_id, amount, true);
												$(this).dialog("close");
											}
										}
									});
								} else {
									proboards.alert("Invalid Amount", "You need to enter an amount greater than 0.", {
										modal: true,
										resizable: false,
										draggable: false
									});
								}
								
								$(this).dialog("close");
							}
							
						}
					});
				});
				
				stock_table.append(stock_obj);
				
				this.total ++;
			}
			
			var stock_content = $("<div id='stock-content'" + compact_width + "></div>").append(stock_table);
			
			this.html = stock_content;
			this.current_investment_list();
			this.update();
		},
		
		update: function(){
			var self = this;
			
			$("#stock-wrapper").empty().append($(this.html));

			$("#stock-right").click(function(){
				if(self.current == self.total){
					return false;
				}
    
				self.current ++;
    
				$("#stock-content-strip").animate({"left": "-=908px"}, "slow");
			});
			
			$("#stock-left").click(function(){
				if(self.current <= 1){
					return false;
				}
    
				self.current --;
    
				$("#stock-content-strip").animate({"left": "+=908px"}, "slow");
			});
			
		}
	
	};
	
})().register();