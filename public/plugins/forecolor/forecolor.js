fe.plugin.forecolor = function(e,tg,fns){
	var div = fe('<div unselectable="on">'),
		editor = this,
		html = '';

	fe.each(editor.options.colors,function(){
		html += '<span class="fe-btn fe-btn-default" unselectable="on" style="background:'+this+'" data-fe-val="'+this+'"> </span>';
	});
	div.html(html);

	var dialog = editor.dialog({
		header: '颜色板',
		body: div,
		ok: false,
		cancel: false,
		css: {'maxWidth':'600px'}
	},'fe-dialog-forecolor');

	div.on('click', function handle(e){
		var target = e.target || e.srcElement,
			dataval = target.getAttribute('data-fe-val');

		div.off('click',handle);
		dialog.hide();

		if(!dataval) return;
		dialog.exec('color',dataval);
	});
}