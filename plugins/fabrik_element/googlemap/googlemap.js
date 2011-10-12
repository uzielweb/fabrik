/** call back method when maps api is loaded*/
function googlemapload() {
	window.addEvent('domready', function () {
		if (document.body) {
			window.fireEvent('google.map.loaded');
		} else {
			console.log('no body');
		}	
	});
}

var FbGoogleMap = new Class({
	Extends : FbElement,

	options : {
		'lat': 0,
		'lat_dms': 0,
		'key': '',
		'lon': 0,
		'lon_dms': 0,
		'zoomlevel': '13',
		'control': '',
		'maptypecontrol': false,
		'overviewcontrol': false,
		'scalecontrol': false,
		'drag': false,
		'maptype': 'G_NORMAL_MAP',
		'geocode': false,
		'latlng': false,
		'latlng_dms': false,
		'staticmap': false,
		'auto_center': false,
		'scrollwheel': false,
		'streetView': false,
		'center': 0,
		'reverse_geocode': false
	},
	
	initialize : function (element, options) {
		this.parent(element, options);
		// @TODO test google object when offline $type(google) isnt working
		if (this.options.center === 1 && this.options.rowid === 0) {
			if (geo_position_js.init()) {
				geo_position_js.getCurrentPosition(this.geoCenter.bind(this), this.geoCenterErr.bind(this), {
					enableHighAccuracy: true
				});
			} else {
				fconsole('Geo locaiton functionality not available');
			}
		}
		window.addEvent('google.map.loaded', function () {
			switch (this.options.maptype) {
			case 'G_SATELLITE_MAP':
				this.options.maptype = google.maps.MapTypeId.SATELLITE;
				break;
			case 'G_HYBRID_MAP':
				this.options.maptype = google.maps.MapTypeId.HYBRID;
				break;
			case 'TERRAIN':
				this.options.maptype = google.maps.MapTypeId.TERRAIN;
				break;
			default:
			/* falls through */
			case 'G_NORMAL_MAP':
				this.options.maptype = google.maps.MapTypeId.ROADMAP;
				break;
			}
			this.makeMap();
		}.bind(this));
	},

	getValue: function () {
		if (typeOf(this.field) !== 'null') {
			return this.field.get('value');
		}
		return false;
	},

	makeMap: function () {
		if (typeOf(this.element) === 'null') {
			return;
		}
		if (typeof(this.map) !== 'undefined') {
			return;
		}
		if (this.options.geocode || this.options.reverse_geocode) {
			this.geocoder = new google.maps.Geocoder();
		}
		this.field = this.element.getElement('input.fabrikinput');
		this.watchGeoCode();
		if (this.options.staticmap) {
			var i = this.element.getElement('img');
			var w = i.getStyle('width').toInt();
			var h = i.getStyle('height').toInt();
		}

		if (!this.options.staticmap) {

			var zoomControl =  this.options.control === '' ? false : true;
			var zoomControlStyle = this.options.control === 'GSmallMapControl' ? google.maps.ZoomControlStyle.SMALL : google.maps.ZoomControlStyle.LARGE;
		
			var mapOpts = {
					center: new google.maps.LatLng(this.options.lat, this.options.lon),
					zoom: this.options.zoomlevel.toInt(),
					mapTypeId: this.options.maptype,
					scaleControl: this.options.scalecontrol,
					mapTypeControl: this.options.maptypecontrol,
					overviewMapControl: this.options.overviewcontrol,
					scrollwheel: this.options.scrollwheel,
					streetViewControl: this.options.streetView,
					zoomControl: true,
					zoomControlOptions: {
						style: zoomControlStyle
					}
				};
			this.map = new google.maps.Map(document.id(this.element).getElement('.map'), mapOpts);
			
			var point = new google.maps.LatLng(this.options.lat, this.options.lon);
			var opts = {
				map: this.map,
				position: point
			};
			opts.draggable = this.options.drag;
				
			if (this.options.latlng === true) {
				document.id(this.element).getElement('.lat').addEvent('blur', this.updateFromLatLng.bindWithEvent(this));
				document.id(this.element).getElement('.lng').addEvent('blur', this.updateFromLatLng.bindWithEvent(this));
			}

			if (this.options.latlng_dms === true) {
				document.id(this.element).getElement('.latdms').addEvent('blur', this.updateFromDMS.bindWithEvent(this));
				document.id(this.element).getElement('.lngdms').addEvent('blur', this.updateFromDMS.bindWithEvent(this));
			}

			this.marker = new google.maps.Marker(opts);

			if (this.options.latlng === true) {
				document.id(this.element.id).getElement('.lat').value = this.marker.getPosition().lat() + '° N';
				document.id(this.element.id).getElement('.lng').value = this.marker.getPosition().lng() + '° E';
			}

			if (this.options.latlng_dms === true) {
				document.id(this.element.id).getElement('.latdms').value = this.latDecToDMS();
				document.id(this.element.id).getElement('.lngdms').value = this.lngDecToDMS();
			}

			google.maps.event.addListener(this.marker, "dragend", function () {
				this.field.value = this.marker.getPosition() + ":" + this.map.getZoom();
				if (this.options.latlng === true) {
					document.id(this.element).getElement('.lat').value = this.marker.getPosition().lat() + '° N';
					document.id(this.element).getElement('.lng').value = this.marker.getPosition().lng() + '° E';
				}
				if (this.options.latlng_dms === true) {
					document.id(this.element).getElement('.latdms').value = this.latDecToDMS();
					document.id(this.element).getElement('.lngdms').value = this.lngDecToDMS();
				}
				if (this.options.reverse_geocode) {
					this.geocoder.geocode({'latLng': this.marker.getPosition()}, function (results, status) {
						if (status === google.maps.GeocoderStatus.OK) {
							if (results[0]) {
								//infowindow.setContent(results[1].formatted_address);
								//infowindow.open(map, marker);
								//alert(results[0].formatted_address);
								results[0].address_components.each(function (component) {
									component.types.each(function (type) {
										if (type === 'street_number') {
											if (this.options.reverse_geocode_fields.route) {
												$(this.options.reverse_geocode_fields.route).value = component.long_name + ' ';
											}
										}
										else if (type === 'route') {
											if (this.options.reverse_geocode_fields.route) {
												$(this.options.reverse_geocode_fields.route).value += component.long_name;
											}
										}
										else if (type === 'street_address') {
											if (this.options.reverse_geocode_fields.route) {
												$(this.options.reverse_geocode_fields.route).value = component.long_name;
											}
										}	
										else if (type === 'neighborhood') {
											if (this.options.reverse_geocode_fields.neighborhood) {
												$(this.options.reverse_geocode_fields.neighborhood).value = component.long_name;
											}
										}	
										else if (type === 'locality') {
											if (this.options.reverse_geocode_fields.city) {
												$(this.options.reverse_geocode_fields.locality).value = component.long_name;
											}
										}
										else if (type === 'administrative_area_level_1') {
											if (this.options.reverse_geocode_fields.state) {
												$(this.options.reverse_geocode_fields.state).value = component.long_name;
											}
										}
										else if (type === 'postal_code') {
											if (this.options.reverse_geocode_fields.zip) {
												$(this.options.reverse_geocode_fields.zip).value = component.long_name;
											}
										}
										else if (type === 'country') {
											if (this.options.reverse_geocode_fields.country) {
												$(this.options.reverse_geocode_fields.country).value = component.long_name;
											}
										}
									}.bind(this));
								}.bind(this));
							}
							else {
								alert("No results found");
							}
						} else {
							alert("Geocoder failed due to: " + status);
				        }
					}.bind(this));						
				}
			}.bind(this));
			google.maps.event.addListener(this.map, "zoom_changed", function (oldLevel, newLevel) {
				this.field.value = this.marker.getPosition() + ":" + this.map.getZoom();
			}.bind(this));
			if (this.options.auto_center && this.options.editable) {
				google.maps.event.addListener(this.map, "dragend", function () {
					this.marker.setPosition(this.map.getCenter());
					this.field.value = this.marker.getPosition() + ":" + this.map.getZoom();
					if (this.options.latlng === true) {
						document.id(this.element).getElement('.lat').value = this.marker.getPosition().lat() + '° N';
						document.id(this.element).getElement('.lng').value = this.marker.getPosition().lng() + '° E';
					}
					if (this.options.latlng_dms === true) {
						document.id(this.element).getElement('.latdms').value = this.latDecToDMS();
						document.id(this.element).getElement('.lngdms').value = this.lngDecToDMS();
					}
				}.bind(this));
			}
		}
		this.watchTab();
	},

	updateFromLatLng : function () {
		var lat = document.id(this.element.id).getElement('.lat').get('value').replace('° N', '').toFloat();
		var lng = document.id(this.element.id).getElement('.lng').get('value').replace('° E', '').toFloat();
		var pnt = new google.maps.LatLng(lat, lng);
		this.marker.setPosition(pnt);
		this.map.setCenter(pnt, this.map.getZoom());
		this.field.value = this.marker.getPosition() + ":" + this.map.getZoom();
		document.id(this.element).getElement('.latdms').value = this.latDecToDMS();
		document.id(this.element).getElement('.lngdms').value = this.lngDecToDMS();
	},

	updateFromDMS : function () {
		var latdms = document.id(this.element.id).getElement('.latdms').get('value').replace('S', '-');
		latdms = latdms.replace('N', '');
		var lngdms = document.id(this.element.id).getElement('.lngdms').get('value').replace('W', '-');
		lngdms = lngdms.replace('E', '');

		var latdms_d_ms = latdms.split('°');
		var latdms_topnt = latdms_d_ms[0];
		var latdms_m_s = latdms_d_ms[1].split('\'');
		var latdms_m = latdms_m_s[0].toFloat() * 60;
		var latdms_ms = (latdms_m + latdms_m_s[1].replace('"', '').toFloat()) / 3600;
		latdms_topnt = Math.abs(latdms_topnt.toFloat()) + latdms_ms.toFloat();
		if (latdms_d_ms[0].toString().indexOf('-') !== -1) {
			latdms_topnt = -latdms_topnt;
		}

		var lngdms_d_ms = lngdms.toString().split('°');
		var lngdms_topnt = lngdms_d_ms[0];
		var lngdms_m_s = lngdms_d_ms[1].split('\'');
		var lngdms_m = Math.abs(lngdms_m_s[0].toFloat()) * 60;
		var lngdms_ms = (lngdms_m + Math.abs(lngdms_m_s[1].replace('"', '').toFloat())) / 3600;
		lngdms_topnt = Math.abs(lngdms_topnt.toFloat()) + lngdms_ms.toFloat();
		if (lngdms_d_ms[0].toString().indexOf('-') !== -1) {
			lngdms_topnt = -lngdms_topnt;
		}

		var pnt = new google.maps.LatLng(latdms_topnt.toFloat(), lngdms_topnt.toFloat());
		this.marker.setPosition(pnt);
		this.map.setCenter(pnt, this.map.getZoom());
		this.field.value = this.marker.getPosition() + ":" + this.map.getZoom();
		document.id(this.element).getElement('.lat').value = latdms_topnt + '° N';
		document.id(this.element).getElement('.lng').value = lngdms_topnt + '° E';
	},

	latDecToDMS : function () {
		var latdec = this.marker.getPosition().lat();
		var dmslat_d = parseInt(Math.abs(latdec), 10);
		var dmslat_m_float = 60 * (Math.abs(latdec).toFloat() - dmslat_d.toFloat());
		var dmslat_m = parseInt(dmslat_m_float, 10);
		var dmslat_s_float = 60 * (dmslat_m_float.toFloat() - dmslat_m.toFloat());
		// var dmslat_s = Math.round(dmslat_s_float.toFloat()*100)/100;
		var dmslat_s = dmslat_s_float.toFloat();

		if (dmslat_s === 60) {
			dmslat_m = dmslat_m.toFloat() + 1;
			dmslat_s = 0;
		}
		if (dmslat_m === 60) {
			dmslat_d = dmslat_d.toFloat() + 1;
			dmslat_m = 0;
		}

		var dmslat_dir = 'N';
		if (latdec.toString().indexOf('-') !== -1) {
			dmslat_dir = 'S';
		} else {
			dmslat_dir = 'N';
		}

		return dmslat_dir + dmslat_d + '°' + dmslat_m + '\'' + dmslat_s + '"';

	},

	lngDecToDMS : function () {
		var lngdec = this.marker.getPosition().lng();
		var dmslng_d = parseInt(Math.abs(lngdec), 10);
		var dmslng_m_float = 60 * (Math.abs(lngdec).toFloat() - dmslng_d.toFloat());
		var dmslng_m = parseInt(dmslng_m_float, 10);
		var dmslng_s_float = 60 * (dmslng_m_float.toFloat() - dmslng_m.toFloat());
		// var dmslng_s = Math.round(dmslng_s_float.toFloat()*100)/100;
		var dmslng_s = dmslng_s_float.toFloat();

		if (dmslng_s === 60) {
			dmslng_m.value = dmslng_m.toFloat() + 1;
			dmslng_s.value = 0;
		}
		if (dmslng_m === 60) {
			dmslng_d.value = dmslng_d.toFloat() + 1;
			dmslng_m.value = 0;
		}

		var dmslng_dir = '';
		if (lngdec.toString().indexOf('-') !== -1) {
			dmslng_dir = 'W';
		} else {
			dmslng_dir = 'E';
		}

		return dmslng_dir + dmslng_d + '°' + dmslng_m + '\'' + dmslng_s + '"';

	},

	geoCode : function (e) {
		var address = '';
		if (this.options.geocode === '2') {
			this.options.geocode_fields.each(function (field) {
				address += document.id(field).value + ',';
			});
			address = address.slice(0, -1);
		} else {
			address = document.id(this.element.id).getElement('.geocode_input').value;
		}
		this.geocoder.geocode({'address': address}, function (results, status) {
			if (status !== google.maps.GeocoderStatus.OK || results.length === 0) {
				fconsole(address + " not found!");
			} else {
				this.marker.setPosition(results[0].geometry.location);
				this.map.setCenter(results[0].geometry.location, this.map.getZoom());
				this.field.value = results[0].geometry.location + ":" + this.map.getZoom();
				if (this.options.latlng === true) {
					document.id(this.element.id).getElement('.lat').value = results[0].geometry.location.lat() + '° N';
					document.id(this.element.id).getElement('.lng').value = results[0].geometry.location.lng() + '° E';
				}
				if (this.options.latlng_dms === true) {
					document.id(this.element.id).getElement('.latdms').value = this.latDecToDMS();
					document.id(this.element.id).getElement('.lngdms').value = this.lngDecToDMS();
				}
			}
		}.bind(this));
	},

	watchGeoCode : function () {
		if (!this.options.geocode || !this.options.editable) {
			return false;
		}
		if (this.options.geocode === '2') {
			if (this.options.geocode_event !== 'button') {
				this.options.geocode_fields.each(function (field) {
					if (typeOf(document.id(field)) !== 'null') {
						document.id(field).addEvent('keyup', this.geoCode.bindWithEvent(this));
					}
				}.bind(this));
			} else {
				if (this.options.geocode_event === 'button') {
					document.id(this.element).getElement('.geocode').addEvent('click', this.geoCode.bindWithEvent(this));
				}
			}
		}
		if (this.options.geocode === '1' && document.id(this.element).getElement('.geocode_input')) {
			if (this.options.geocode_event === 'button') {
				document.id(this.element.id).getElement('.geocode').addEvent('click', this.geoCode.bindWithEvent(this));
			} else {
				document.id(this.element.id).getElement('.geocode_input').addEvent('keyup', this.geoCode.bindWithEvent(this));
			}
		}
	},

	unclonableProperties : function () {
		return [ 'form', 'marker', 'map', 'maptype' ];
	},

	cloned : function (c) {
		var f = [];
		this.options.geocode_fields.each(function (field) {
			var bits = $A(field.split('_'));
			var i = bits.getLast();
			if (i !== i.toInt()) {
				return bits.join('_');
			}
			i++;
			bits.splice(bits.length - 1, 1, i);
			f.push(bits.join('_'));
		});
		this.options.geocode_fields = f;
		this.makeMap();
	},

	update : function (v) {
		v = v.split(':');
		if (v.length < 2) {
			v[1] = this.options.zoomlevel;
		}
		var zoom = v[1].toInt();
		this.map.setZoom(zoom);
		v[0] = v[0].replace('(', '');
		v[0] = v[0].replace(')', '');
		var pnts = v[0].split(',');
		if (pnts.length < 2) {
			pnts[0] = this.options.lat;
			pnts[1] = this.options.lon;
		}
		// $$$ hugh - updateFromLatLng blows up if not displayinbg lat lng
		// also, not sure why we would do this, as all we want to do is set map back
		// to default
		// location, not read location from lat lng fields?
		// this.updateFromLatLng(pnts[0], pnts[1]);
		// So instead, lets just set marker to default and recenter
		var pnt = new google.maps.LatLng(pnts[0], pnts[1]);
		this.marker.setPosition(pnt);
		this.map.setCenter(pnt, this.map.getZoom());
	},

	geoCenter : function (p) {
		var pnt = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
		this.marker.setPosition(pnt);
		this.map.setCenter(pnt);
	},

	geoCenterErr : function (p) {
		fconsole('geo location error=' + p.message);
	},
	
	/*
	 * Testing some stuff to try and get maps to display properly when they are in the
	 * tab template.  If a map is in a tab which isn't selected on page load, the map
	 * will not render properly, and needs to be refreshed when the tab it is in is selected.
	 * NOTE that this stuff is very specific to the Fabrik tabs template, using J!'s tabs.
	 */
    
	doTab: function (event) {
		(function () {
			//this.map.checkResize();
			google.maps.event.trigger(this.map, 'resize');
			var center = new google.maps.LatLng(this.options.lat, this.options.lon);
			this.map.setCenter(center);
			this.map.setZoom(this.map.getZoom());
			this.options.tab_dt.removeEvent('click', this.doTabBound);
		}.bind(this)).delay(500);
	},
    
	watchTab: function () {
		var tab_dl = this.element.getParent('.tabs');
		if (tab_dl) {
			this.options.tab_dt = this.element.getParent('.fabrikGroup').getPrevious();
			if (!this.options.tab_dt.hasClass('open')) {
				this.doTabBound = this.doTab.bindWithEvent(this);
				this.options.tab_dt.addEvent('click', this.doTabBound);
			}
		}
	}

});