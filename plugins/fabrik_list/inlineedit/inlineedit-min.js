var FbListInlineEdit=new Class({Extends:FbListPlugin,initialize:function(a){this.parent(a);this.defaults={};this.editors={};this.inedit=false;this.addbutton=new Asset.image(Fabrik.liveSite+"media/com_fabrik/images/action_check.png",{alt:"save","class":""});this.cancelbutton=new Asset.image(Fabrik.liveSite+"media/com_fabrik/images/delete.png",{alt:"delete","class":""});head.ready(function(){if(typeOf(this.getList().getForm())==="null"){return false}this.listid=this.options.listid;this.setUp()}.bind(this));Fabrik.addEvent("fabrik.table.clearrows",function(){this.cancel()}.bind(this));Fabrik.addEvent("fabrik.list.inlineedit.stopEditing",function(){this.stopEditing()}.bind(this));Fabrik.addEvent("fabrik.table.updaterows",function(){this.watchCells()}.bind(this));Fabrik.addEvent("fabrik.table.ini",function(){var b=Fabrik.blocks["list_"+this.options.listid];var c=b.form.toQueryString().toObject();c.format="raw";var d=new Request({url:"index.php",data:c,onSuccess:function(e){e=Json.evaluate(e.stripScripts());b.options.data=e.data}.bind(this)}).send()}.bind(this))},setUp:function(){if(typeOf(this.getList().getForm())==="null"){return}this.scrollFx=new Fx.Scroll(window,{wait:false});this.watchCells();document.addEvent("keydown",this.checkKey.bindWithEvent(this))},watchCells:function(){var a=false;this.getList().getForm().getElements(".fabrik_element").each(function(c,b){if(!a&&this.options.loadFirst){a=this.edit(null,c);if(a){this.select(null,c)}}if(!this.isEditable(c)){return}this.setCursor(c);c.removeEvents();c.addEvent(this.options.editEvent,this.edit.bindWithEvent(this,[c]));c.addEvent("click",this.select.bindWithEvent(this,[c]));if(this.canEdit(c)){c.addEvent("mouseenter",function(d){if(!this.isEditable(c)){c.setStyle("cursor","pointer")}}.bind(this));c.addEvent("mouseleave",function(d){c.setStyle("cursor","")})}}.bind(this))},checkKey:function(d){var c,f,a;if(typeOf(this.td)!=="element"){return}switch(d.code){case 39:if(this.inedit){return}if(typeOf(this.td.getNext())==="element"){d.stop();this.select(d,this.td.getNext())}break;case 9:if(this.inedit){if(this.options.tabSave){if(typeOf(this.editing)==="element"){this.save(d,this.editing)}else{this.edit(d,this.td)}}var b=d.shift?this.getPreviousEditable(this.td):this.getNextEditable(this.td);if(typeOf(b)==="element"){d.stop();this.select(d,b);this.edit(d,this.td)}return}d.stop();if(d.shift){if(typeOf(this.td.getPrevious())==="element"){this.select(d,this.td.getPrevious())}}else{if(typeOf(this.td.getNext())==="element"){this.select(d,this.td.getNext())}}break;case 37:if(this.inedit){return}if(typeOf(this.td.getPrevious())==="element"){d.stop();this.select(d,this.td.getPrevious())}break;case 40:if(this.inedit){return}f=this.td.getParent();if(typeOf(f)==="null"){return}a=f.getElements("td").indexOf(this.td);if(typeOf(f.getNext())==="element"){d.stop();c=f.getNext().getElements("td");this.select(d,c[a])}break;case 38:if(this.inedit){return}f=this.td.getParent();if(typeOf(f)==="null"){return}a=f.getElements("td").indexOf(this.td);if(typeOf(f.getPrevious())==="element"){d.stop();c=f.getPrevious().getElements("td");this.select(d,c[a])}break;case 27:d.stop();this.select(d,this.editing);this.cancel(d);break;case 13:d.stop();if(typeOf(this.editing)==="element"){this.save(d,this.editing)}else{this.edit(d,this.td)}break}},select:function(f,h){if(!this.isEditable(h)){return}var b=this.getElementName(h);var c=this.options.elements[b];if(typeOf(c)===false){return}if(typeOf(this.td)==="element"){this.td.removeClass(this.options.focusClass)}this.td=h;if(typeOf(this.td)==="element"){this.td.addClass(this.options.focusClass)}if(typeOf(this.td)==="null"){return}var d=this.td.getPosition();var a=d.x-(window.getSize().x/2)-(this.td.getSize().x/2);var g=d.y-(window.getSize().y/2)+(this.td.getSize().y/2);this.scrollFx.start(a,g)},getElementName:function(d){var b=d.className.split(" ").filter(function(e,c){return e!=="fabrik_element"&&e!=="fabrik_row"});var a=b[0].replace("fabrik_row___","");return a},setCursor:function(c){var a=this.getElementName(c);var b=this.options.elements[a];if(typeOf(b)==="null"){return}c.addEvent("mouseover",function(d){if(this.isEditable(d.target)){d.target.setStyle("cursor","pointer")}});c.addEvent("mouseleave",function(d){if(this.isEditable(d.target)){d.target.setStyle("cursor","")}})},isEditable:function(a){if(a.hasClass("fabrik_uneditable")||a.hasClass("fabrik_ordercell")||a.hasClass("fabrik_select")||a.hasClass("fabrik_actions")){return false}return true},getPreviousEditable:function(d){var c=false;var b=this.getList().getForm().getElements(".fabrik_element");for(var a=b.length;a>=0;a--){if(c){if(this.canEdit(b[a])){return b[a]}}if(b[a]===d){c=true}}return false},getNextEditable:function(c){var b=false;var a=this.getList().getForm().getElements(".fabrik_element").filter(function(e,d){if(b){if(this.canEdit(e)){b=false;return true}}if(e===c){b=true}return false}.bind(this));return a.getLast()},canEdit:function(c){if(!this.isEditable(c)){return false}var a=this.getElementName(c);var b=this.options.elements[a];if(typeOf(b)==="null"){return false}return true},edit:function(h,i){if(this.inedit){return}if(!this.canEdit(i)){return false}if(typeOf(h)!=="null"){h.stop()}var c=this.getElementName(i);var f=i.getParent(".fabrik_row").id.replace("list_"+this.list.id+"_row_","");var a="index.php?option=com_fabrik&task=element.display&format=raw";var d=this.options.elements[c];if(typeOf(d)==="null"){return}this.inedit=true;this.editing=i;this.defaults[f+"."+d.elid]=i.innerHTML;var g=this.getDataFromTable(i);if(typeOf(this.editors[d.elid])==="null"||typeOf(Fabrik["inlineedit_"+d.elid])==="null"){Fabrik.loader.start(i);new Request({evalScripts:function(e,j){this.javascript=e}.bind(this),evalResponse:false,url:a,data:{element:c,elid:d.elid,plugin:d.plugin,rowid:f,listid:this.options.listid,inlinesave:this.options.showSave,inlinecancel:this.options.showCancel},onComplete:function(e){Fabrik.loader.stop(i);(function(){$exec(this.javascript)}.bind(this)).delay(1000);i.empty().set("html",e);e=e+'<script type="text/javascript">'+this.javascript+"<\/script>";this.editors[d.elid]=e;this.watchControls(i);this.setFocus(i)}.bind(this)}).send()}else{this.javascript;var b=this.editors[d.elid].stripScripts(function(e){this.javascript=e}.bind(this));i.empty().set("html",b);$exec(this.javascript);Fabrik.addEvent("fabrik.list.inlineedit.setData",function(){Fabrik["inlineedit_"+d.elid].update(g);Fabrik["inlineedit_"+d.elid].select();this.watchControls(i);this.setFocus(i)}.bind(this))}return true},getDataFromTable:function(e){var c=Fabrik.blocks["list_"+this.options.listid].options.data;var b=this.getElementName(e);var d=e.getParent(".fabrik_row").id;var a=false;this.vv=[];c.each(function(h){if(typeOf(h)==="array"){for(var f=0;f<h.length;f++){if(h[f].id===d){this.vv.push(h[f])}}}else{var g=h.filter(function(i){return i.id===d})}}.bind(this));if(this.vv.length>0){a=this.vv[0].data[b+"_raw"]}return a},setTableData:function(d,b,c){ref=d.id;var a=Fabrik.blocks["list_"+this.options.listid].options.data;$H(a).each(function(e){e.each(function(f){if(f.id===ref){f.data[b]=c}})})},setFocus:function(a){if(typeOf(a.getElement(".fabrikinput"))!=="null"){a.getElement(".fabrikinput").focus()}},watchControls:function(a){if(typeOf(a.getElement("a.inline-save"))!=="null"){a.getElement("a.inline-save").addEvent("click",this.save.bindWithEvent(this,[a]))}if(typeOf(a.getElement("a.inline-cancel"))!=="null"){a.getElement("a.inline-cancel").addEvent("click",this.cancel.bindWithEvent(this,[a]))}},save:function(j,f){Fabrik.fireEvent("fabrik.table.updaterows");this.inedit=false;j.stop();var i=this.getElementName(f);var b="index.php?option=com_fabrik&task=element.save&format=raw";var a=this.options.elements[i];var m=this.editing.getParent(".fabrik_row");var d=m.id.replace("list_"+this.list.id+"_row_","");f.removeClass(this.options.focusClass);var c=Fabrik["inlineedit_"+a.elid];if(typeOf(c)==="null"){fconsole("issue saving from inline edit: eObj not defined");this.cancel(j);return false}delete c.element;c.getElement();var l=c.getValue();var g="value";this.setTableData(m,i,l);var h={element:i,elid:a.elid,plugin:a.plugin,rowid:d,listid:this.options.listid};h[c.token]=1;h[g]=l;new Request({url:b,data:h,evalScripts:true,onComplete:function(e){f.empty().set("html",e)}.bind(this)}).send();this.editing=null},stopEditing:function(a){var b=this.editing;if(b!==false){b.removeClass(this.options.focusClass)}this.editing=null;this.inedit=false},cancel:function(f){if(f){f.stop()}if(typeOf(this.editing)!=="element"){return}var g=this.editing.getParent(".fabrik_row");if(g===false){return}var d=g.id.replace("list_"+this.getList().id+"_row_","");var i=this.editing;if(i!==false){var a=this.getElementName(i);var b=this.options.elements[a];var h=this.defaults[d+"."+b.elid];i.set("html",h)}this.stopEditing()}});