// fucking the property
_defineProperty = function(obj, prop, desc) {
    if ('_get' in desc) obj.__defineGetter__(prop, desc._get);
    if ('_set' in desc) obj.__defineSetter__(prop, desc._set);
    return obj;
};


var com = {};

/**
 * add to a function to certain package
 **/
var as_package = function(name, fn){
	if (com == null) return 'data is undefined';

	try{
		var sname = name.split('.'), 
			path = "";

		sname.shift();
		
		for (var i=0; i<sname.length; i++){
			path += '["'+sname[i]+'"]';
			if (eval('com'+path) == null){
				eval('com'+path+'={}');
			}
		}
		eval('com'+path + '=fn');
	}catch(e){
		console.log('error:', e);
	}
};


/**
 * get a function from certain package
 * */
var as_import = function(name){
	var sname = name.split('.');
	var n = sname.pop();
	eval(''+n+ '='+name);
};

/**
 * coco:
 * 		chain
 * 				run
 * 		mixin
 * 		q
 * 				extend
 * 				content
 * 				find		//todo
 * 				bind		
 * 				unbind
 * 				click		
 * 				tween
 * 				storyboard
 * 				delay
 * 				fadeIn		//todo
 * 				fadeOut		//todo
 * 				show		//todo
 * 				hide		//todo
 * 				attr
 * 				append
 * 				appendTo
 * 				remove
 * 		hash
 * 				clone
 * 				foreach
 * 				foreach_deep_in
 * 				gethash
 * 				q
 * 				get
 * 				set
 * 				value
 * 				create
 * 		register
 * 		unregister
 * 		using
 *
 **/

var coco = new function(){
	var instance = {};
	instance.chain = {
		run: function(arr_task) {
				new com.seayo.utils.chain(arr_task);
				return instance;
			}
	};
	
	instance.wait = {
		run: function(arr_task, callback) {
			new com.seayo.utils.wait(arr_task, callback);
			return instance;
		}
	};
	
	instance.wait_for = function(task_length, callback) {
		var wait = new com.seayo.utils.wait([],callback);
		wait.set_max(task_length);
		return wait;
	};
	instance.mixin = function(obj, props) {
		var tobj = obj || (props.sort ? [] : {});
		for (var x in props) {
			if (typeof tobj[x] == undefined || tobj[x] !== props[x]) {
				tobj[x] = props[x];
			}
		} 
		return tobj;
	};

	
	instance.q = function(){
		var targets = arguments;
		var self = {
			extend: function() {
				return self;
			},
			
			content: function() {
				if (targets.length == 1) {
					return targets[0];
				}else if (targets.length > 1) {
					return targets;
				} 
				return null;
			},
			
			set_as: function(mode) {
			/*	try {
					if (mode == 'button') {
						for (var i in targets) {
							var target = targets[i];
							target.addEventListener('addedToStage', function(e) {
								e.currentTarget.stop();
								e.currentTarget.buttonMode = true;
							});
							target.addEventListener('mouseOut', function(e) {
								e.currentTarget.gotoAndStop(1);
							});
							target.addEventListener('mouseOver', function(e) {
								e.currentTarget.gotoAndStop(2);
							});
						}
					}else if (mode == 'window') {
						
					}
				}catch (e) {
					console.log('can not set as button');
				}*/
				return self;
			},
			
			find: function() {
				
			},
			
			bind: function(event_name, fn, is_weak) {
				try {
					is_weak = is_weak || false;
					
					var _bind = function(_t, _evt_name, _fn){
						//_t['on' + _evt_name] = function(e){
							//_fn.apply(this, [_t]);
						//};
						//console.debug('_t', _t.name);
						if (_evt_name == 'click') {
							_t['_on' + _evt_name] = _fn;
						} else {
							_t['on' + _evt_name] = _fn;
						}
					};
					
					for (var i in targets) {
						var target = targets[i];
						_bind(target, event_name, fn)
					}
				}catch (e) {
					console.error('Error: can not bind event: ' + event_name + '---' + e.stack);
				}
				return self;
			},
			
			unbind: function(event_name){
				try {
					for (var i in targets) {
						var target = targets[i];
						target['on' + event_name] = null;
						delete target['__on' + event_name];
					}
				} catch (e) {
					console.error('Error: fail to unbind event:', event_name);
				}
				return self;
			},
			
			click: function(fn, is_weak) {
				self.bind('click', fn, is_weak);
				return self;
			},

			trigger: function(event_name, touch, callback){
				try {
					for (var i in targets) {
						var target = targets[i],
							_event = '__on' + event_name;
						if (!target[_event]) _event = 'on' + event_name;
						target[_event] && target[_event](touch);
						callback && callback();
					}
				} catch (e) {
					console.error('Error: fail to trigger event:', event_name, target, e.stack);
				}
				return self;
			},
			
			//~ call: function(name, ...REST) {
				//~ try {
					//~ for (var i in targets) {
						//~ var target = targets[i];
						//~ if (target[name]) target[name].apply(this, REST);
					//~ }
				//~ }catch (e) {
					//~ console.log('can not invoke', name, 'as function');
				//~ }
				//~ return self;
			//~ },
			
			tween: function(duration, vars) {
				//try {
					for (var i in targets) {
						var target = targets[i];
						new com.seayo.utils.tweening(target, self._toDuration(duration), vars);
					}
				//}catch (e) {
				//	console.log('can not exec the tween');
				//}
				return self;
			},
			
			storyboard: function() {
				try {
					var arr_chain = [];
					var sb = {
						then: function() {
							// name of function
							var args = arguments,
								name = args[0],
								param = args[1] || null;
								
							if (name == 'tween'){
								arr_chain.push(function(c) {
									var vars = args[2] || {};
									// assign onComplete and invoke it automatic
									vars.onComplete = function(){c.next();};
									self[name](param, vars);
								});
							}else{
								arr_chain.push(function(c) {
									self[name](param, function(){c.next()});
								});
							}
							return sb;
						},
						end: function(callback) {
							arr_chain.push(function(c) {
								if (callback) callback();
							});
							instance.chain.run(arr_chain);
							return self;
						}
					};
					return sb;
				}catch (e) {
					console.log('can not exec storyboard');
				}
			},
			
			_toDuration: function(t) {
				var _t = t || 0;
				// 1000 is slow, 300 is fast
				if (t == 'slow'){
					_t = 1;
				}else if (t == 'fast') {
					_t = 0.3;
				}
				return _t;
			},
			
			delay: function(t, fn) {
				return self.tween(self._toDuration(t), { 'onComplete': fn } );
			},
			
			fadeIn: function(t, fn) {
				return self.tween(self._toDuration(t), {'alpha':1, 'onComplete': fn});
			},
			
			fadeOut: function(t, fn) {
				return self.tween(self._toDuration(t), {'alpha':0, 'onComplete': fn});
			},
			
			show: function(t, fn) {
				return self.tween(self._toDuration(t), {'alpha':1, 'scaleX': 1, 'scaleY': 1, 'onComplete': fn});
			},
			
			hide: function(t, fn) {
				return self.tween(self._toDuration(t), {'alpha':0, 'scaleX': 0, 'scaleY': 0, 'onComplete': fn});
			},
			
			attr: function(k, v) {
				try {
					var a = {};
					(typeof k == 'object')? a = k : a[k] = v;
					
					for (var i in targets) {
						var target = targets[i];
						for (var name in a){
							if (target.hasOwnProperty(name) || target.__proto__.hasOwnProperty(name)) {//seems buggy
								if (typeof v === 'function') a[name] = v(target);
								target[name] = a[name];
								
							}
						}
					}
				}catch (e) {
					console.error('can not set attr', a);
				}
				return self;
			},
			
			append: function(_sub_target) {
				try {
					for (var i in targets) {
						var target = targets[i];
						target.addChild(_sub_target);
					}
				}catch (e) {
					console.log('can not append', _sub_target);
				}
				return self;
			},
			
			appendTo: function(_parent) {
				try {
					for (var i in targets) {
						var target = targets[i];
						if (_parent) _parent.addChild(target);
					}
				}catch (e) {
					console.log('can not append to', _parent);
				}
				return self;
			},
			
			remove: function() {
				try {
					for (var i in targets) {
						var target = targets[i];
//						console.log('target', target);
//						console.log('target._parent', target._parent);
						
						target._parent.removeChild(target);
					}
				}catch (e) {
					console.log('can not remove');
				}
				return self;
			},
			
			clear: function() {
				try {
					for (var i in targets) {
						var target = targets[i];
						for (var child in target.getChildren()) {
							target.removeChild(child);
						}
					}
				}catch (e) {
					console.log('can not remove');
				}
				return self;				
			}
			
		};
		
		return self;
	};
	
	instance.hash = function(obj) {
		obj = obj || {};
		
		var self = {
			clone: function() {
				var copy = function() {
					this.get_data = function() {
						return obj;
					};
				};
				var c = new copy;
				return c.get_data();
			},
			
			foreach: function(fn) {
				for (var key in obj) {
					try{
						if (fn) fn(key, obj[key]);
					}catch (e) {
						console.log(e.stack);
						continue;
					}
				}
				return self;
			},
			
			foreach_deep_in: function(path, fn) {
				if(!path || path == "") return obj;
				var arr_path = path.split(".");
				
				var result = obj;
				while (arr_path.length > 0) {
					try {
						// get current path
						var curr_path = arr_path[0];
						result = result[curr_path];
						// invoke
						if (fn) fn(arr_path, result);
						arr_path.shift();
					}catch (e) {
						console.log('can not read this part ' +arr_path.join('.')+ ' in a hash path ' +path);
						break;
					}
				}
			},
			
			gethash: function(path) {
				var result = self.get(path);
				return instance.hash(result);
			},
			
			q: function(path) { return self.get(path); },
			get: function(path) {
				var result;
				self.foreach_deep_in(path, function(_path, _result) {
					result = _result;
				});
				return result;
			},
			
			set: function(path, value) {
				self.foreach_deep_in(path, function(_path, _result) {
					// only two are left: current node and next node
					if (_path.length == 2) {
						// get next path
						var _next_path = _path[1];
						_result[_next_path] = value;
						return;
					}
				});
			},
			
			value: function(v) {
				if (v == null) {
					return obj;
				}else {
					obj = v;
				}
			},
			
			create: function() {
				return new function() {
					return instance.mixin(obj, instance.hash(obj));
				};
			}
		};
		
		return self;
	};
	
	instance.register = function(name, fn) {
		instance[name] = fn;
		return instance;
	};
	
	instance.unregister = function(name) {
		instance[name] = undefined;
		delete instance[name];
		return instance;
	};
	
	instance.using = function(name) {
		return instance[name] || {};
	};
	
	return instance;
};


as_package('com.Error',
	function(v){
		// throw error
		console.log(v);
		console.log(v.stack);
	}
);


as_package('com.seayo.utils.URLLoader',
	function(){
		var self = {
			load: function(url, callback){
				// if local? then
				
				gLib.Storage.FileSystem.readFile(url, false, function(err, data){
					var result = {"target": {"data": {}}};
					if(!err){
						result.target.data = data;
					}else{
						console.error('fail to read file : ', url);
						result.target.data = null;
						new com.Error(err);
					}
					console.log(url + ' content: ', result);
					if (callback) callback(result);
				});
				
				/*
				var xhr = new gLib.Network.XHR();
				xhr.onreadystatechange = function(){
					try {
						var success = xhr.readyState === 4;
					} catch (e) {
						console.log(e);
						return;
					}
					success && xhr.status === 200 && callback && callback(xhr.responseText);
				};				
				xhr.open('GET', url, true);
				xhr.send();
				*/
			},

			//write file and save
			save: function(url, data, callback){
				gLib.Storage.FileSystem.writeFile(url, data, false, function(error){
//console.log('save ... data', data);					
					if (!error) {
						console.log('save successfully! Good luck!');
						callback && callback();
					} else {
						throw new Error('Fail to save file:' + url + error);
					}
				});
			}
		};
		return self;
	}
);

as_package('com.seayo.utils.wait', function(arr_task,callback){
	var thread_max = arr_task.length;
	var thread_count = 0;

	this.next = function() {
		thread_count++;
		if (thread_count == thread_max) {
			callback && callback();
		}
	};
	this.set_max = function(max) {
		thread_max = max;
	};
	
	for(var i=0;i< thread_max;i++) {
		var fn = arr_task.shift();
		fn(this);
	}
});

as_package('com.seayo.utils.chain',
	
	function(arr_task){
		var self = function(_arr){
			var arr = _arr;
			var _data = {};
			
			// get data and set data
			self.data = function(v){
				if (v == null){
					return _data;

				}else{
					_data = v;
					//self.progress = arr_task.length;
				}
			};
			
			// exec next
			self.next = function() {
				if (arr.length > 0){
					var fn = arr.shift();
					//self.progress = arr_task.length;
					fn(self);
				}
			};
			
			// break this chain
			self.kill = function(fn){
				while(arr.length > 0){
					arr.pop();
				}
				arr.push(function(c){
					fn && fn();
				});
			};
			
			self.next();
		}
		
		new self(arr_task);
	}
);


var objectToString = function(o, mode) {
	if (o == null) return;
	if (mode == null) mode = 1;
	
	var r = [];
	if (typeof o == "object") {
		if (!o.sort) {
			for (var i in o) {
				if (mode == 1) {
					r.push(i + ":" + objectToString(o[i]) + "\n");
				}else{
					r.push(i + ":" + o[i] + "\n");
				}
			}
			r = "{" + r.join() + "}";
		}else{
			for (var i = 0; i < o.length; i++) {
				if (mode == 1) {
					r.push(objectToString(o[i]));
				}else{
					r.push(o[i]);
				}
			}
			r = "[" + r.join() + "]";
		}
		return r;
	}else if(typeof o == "string") {
		return o.toString();
		//return "\""+o.replace(/([\'\"\\])/g,"\\$1").replace(/(\n)/g,"\\n").replace(/(\r)/g,"\\r").replace(/(\t)/g,"\\t")+"\"";;
	}
	
	return o.toString();
};

//var konsole_view = new gLib.UI.View();

//as_package('com.seayo.utils.console', new function(){
//	var konsole = console;
//		
//	var konsole_text = new gLib.UI.EditTextArea();
//	konsole_text.pos = 0;
//	konsole_text.text = [];
//	konsole_text.setTextSize(12);
//	konsole_text.setTextGravity([0,0]);
//	konsole_text.render = function(){
//		var pagesize = 50;
//		var from_page = konsole_text.pos*pagesize;
//		var to_page = from_page + pagesize;
//	
//		if (to_page > konsole_text.length) to_page = konsole_text.length;
//	
//		var str = '';
//		for (var i = from_page; i<to_page; i++){
//			str += konsole_text.text[i] + '\n';
//		}
//		konsole_text.setText(str);
//	};

//	//var konsole_view = new gLib.UI.View();
//	konsole_view.addChild(konsole_text);

//	var btn_down = new gLib.UI.Button();
//	btn_down.setText('<');
//	btn_down.setFrame([685, 40, 50, 40]);
//	btn_down.setGradient(gStyle.SimpleButton.gradient);
//	konsole_view.addChild(btn_down);
//	
//	var btn_up = new gLib.UI.Button();
//	btn_up.setText('>');
//	btn_up.setFrame([750, 40, 50, 40]);
//	btn_up.setGradient(gStyle.SimpleButton.gradient);
//	konsole_view.addChild(btn_up);

//	var btn_clear = new gLib.UI.Button();
//	btn_clear.setText('Clear');
//	btn_clear.setFrame([600, 40, 50, 40]);
//	btn_clear.setGradient(gStyle.SimpleButton.gradient);
//	konsole_view.addChild(btn_clear);
//	
//	konsole_text.setFrame([0,0,800,80]);
//	konsole_view.setFrame([0,0,800,80]);

//	btn_clear.onclick = function(){
//		konsole_text.pos = 0;
//		konsole_text.text = [];
//		konsole_text.text.length = 0;
//		konsole_text.render();
//	};
//	
//	btn_up.onclick = function(){
//		konsole_text.pos ++;
//		konsole_text.render();
//	};
//	btn_down.onclick = function(){
//		konsole_text.pos --;
//		konsole_text.render();
//	};	
//	
//	append = function(m_arguments, level){
//		var args = [];
//		// only one argument and that is an [object]
//		if ((m_arguments.length === 1) && (typeof m_arguments[0] === 'object')){
//			var obj = objectToString(arguments[0]).split('\n');
//			for (var j in obj){
//				konsole_text.text.push(obj[j]);
//			}
//		// multi arguments and split as ','
//		}else{
//			for (var i in m_arguments){
//				args.push(m_arguments[i]);
//			}
//			konsole_text.text.push(args);
//		}
//		// render text and output
//		konsole_text.render();
//		level = level || 'info';
//		// add a prefix to indicate log level
//		if(typeof m_arguments[0] === 'string' && m_arguments[0].charAt(1)!==':'){
//			m_arguments[0] = level.substr(0,1)+ ": "+m_arguments[0];
//		}
//		konsole.log.apply(konsole, m_arguments);
//	};
//	
//	return {
//		log: function(){
//			append(arguments,'log');
//		},
//		debug: function(){
//			append(arguments,'debug');
//		},
//		info: function(){
//			append(arguments,'info');
//		},
//		warn: function(){
//			append(arguments,'warn');
//		},
//		error: function(){
//			append(arguments,'error');
//		}
//	};
//});
//console = com.seayo.utils.console;
	
as_package('com.seayo.utils.tweening',
	
	function(obj, duration, vars){
		
		var attrs = [],tween_events = {
			// @param t Specifies time.
			// @param b Specifies the initial position of a component.
			// @param c Specifies the total change in position of the component.
			// @param d Specifies the duration of the effect, in milliseconds.
			'easing' : function(t, b, c, d) { return c * t / d + b; },
			'onComplete': function() { },

			'onUpdate': function(v) { }
		};
		
		// relaxed type to accommodate numbers or arrays
		var initVal = [],
			endVal = [],
			duration = duration || 0,
			_duration = duration * 1000,
			startTime;
			// keep d is not Zero always
			if (_duration == 0) _duration = 1;
		
		var tick = {
			IntervalToken: null
		};
		
		function getCurrTimer(){
			return new Date().getTime();
		}
		
		function render(curTime){
			var returnVal = [];
			for (var i=0, j=initVal.length; i<j; i++) {
				returnVal[i] = tween_events.easing(curTime, initVal[i], endVal[i]-initVal[i], _duration)
				obj[attrs[i]] = returnVal[i];

			}
			return returnVal;
		}
		
		var doInterval = function() {
			
			var curTime = getCurrTimer()-startTime;
			if (curTime > _duration){
				for (var i=0, j=endVal.length; i<j; i++) {
					obj[attrs[i]] = endVal[i];
				}
				clearInterval(tick.IntervalToken);
				delete tick.IntervalToken;
				tick = null;
				tween_events.onComplete();
			}else {
				tween_events.onUpdate(render(curTime));
			}
		}
		
		function create(){
			var index = 0;
			var _vars = vars || {};
			for (var i in tween_events){
				if (_vars[i]) {
					tween_events[i] = _vars[i];
					_vars[i] = null;
				};
			}
			
			for (var i in _vars) {
				if (_vars[i] != null){
					attrs.push(i);			// build attrs index , such as ['x','y'...]
					initVal.push(obj[i]);	// form
					endVal.push(_vars[i]);	// to
				}
			}
			
			startTime = getCurrTimer();
			tick.IntervalToken = setInterval(doInterval, 32);// period to refresh, in ms unit
		}
		create();
	}
);


as_package('com.seayo.utils.eventhub', 
	function(){
		var self = {
			//---------------------------------------------------------
			bind: function(name, fn) {
				self.unbind(name);
				self.listen(name, '0', fn);
			},
			
			//---------------------------------------------------------
			unbind: function(name){
				self[name] = null;
				delete self[name];
			},
			
			//---------------------------------------------------------
			listen: function(name, sub, fn) {
				if (!name) return;
				if (!self[name]) self[name] = {};
				if (fn){
					self[name][sub] = fn;
				}else {
					self[name][sub] = function(e) { };
				}
			},
			
			//---------------------------------------------------------
			deaf: function() {
				
			},
			
			//---------------------------------------------------------
			dispatch_all: function(eventData){
				try{
					for (var i=0; i<eventData.length; i++ ){
						self.dispatch(eventData[i]);
					}
				}catch(e){console.log(e.stack)}
			},
			
			//---------------------------------------------------------
			// exec an event
			exec: function() {
				var name = Array.prototype.shift.call(arguments),
					rest = arguments;
				try {
					if (self[name]) {
						var fn_group = self[name];
						for (var fn in fn_group) {
							fn_group[fn].apply(this, rest);
						}
					}
				}catch(e){console.log(e.stack)}
			},
			
			//---------------------------------------------------------
			/// polymorphic interface
			dispatch: function() {
				var eventData = arguments[0];
				// dispatch('event_name', eventData)
				if (typeof eventData == "string") {
					self.exec.apply(self, arguments);
					return;
					
				// dispatch({'event_name': {...}})
				}else if ((typeof eventData == "object") || (typeof eventData == "array")) {
					for (var eventName in eventData) {
						self.exec(eventName, eventData[eventName]);
					}
					return;
				}else{
					console.log("can not dispatch "+eventData);
				}
			}
		};

		return self;
	}
);
