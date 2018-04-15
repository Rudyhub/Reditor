export default {
    range(rg){
        let s = window.getSelection();
        if(rg){
            if(s.rangeCount > 0)  s.removeAllRanges();
            if(rg.rangeCount){
                s.addRange(rg.getRangeAt(0))
            }else{
                s.addRange(rg);
            }
        }else{
            if(s.rangeCount) return s.getRangeAt(0);
            else return s;
        }
    },
    dialog(o, context){
        /*
            o = {title, type, body, css, yes, no, oncreated, onclose, onsure, oncancel, onhide}
        */
        let box, wrapper, header, body, footer, close, yes, no, inputs;

        context = context && context.nodeType === 1 ? context : document.body;

        box = document.querySelector('.re-dialog');
        wrapper = document.createElement('div');
        header = document.createElement('header');
        body = document.createElement('div');
        footer = document.createElement('footer');
        close = document.createElement('b');
        yes = document.createElement('button');
        no = document.createElement('button');

        if(o.type || !box) box = document.createElement('div');

        box.className = 're-dialog';
        wrapper.className = 're-dialog-wrapper';
        header.className = 're-dialog-header '+(o.type === 1 ? 're-danger': (o.type === 2 ? 're-warning' : 're-success'));
        body.className = 're-dialog-body';
        footer.className = 're-dialog-footer';
        close.className = 're-dialog-close';
        yes.className = 're-btn-success re-btn-m';
        no.className = 're-btn-warning re-btn-m';

        header.innerHTML = o.title || '弹窗';
        close.innerHTML = '&times;';
        yes.innerHTML = o.yes || '确定';
        no.innerHTML = o.no || '取消';

        if(o.type === 1) yes.style.display = no.style.display = 'none';

        box.innerHTML = '';
        box.removeAttribute('style');

        if(typeof o.css === 'string') wrapper.setAttribute('style', o.css);

        if(o.body){
            if(typeof o.body === 'string') body.innerHTML = o.body;
            if(o.body.nodeType === 1) body.appendChild(o.body);
        }

        header.appendChild(close);

        footer.appendChild(yes);
        footer.appendChild(no);

        wrapper.appendChild(header);
        wrapper.appendChild(body);
        wrapper.appendChild(footer);

        box.appendChild(wrapper);
        context.appendChild(box);

        close.addEventListener('click', closeFn, false);
        yes.addEventListener('click', sureFn, false);
        no.addEventListener('click', closeFn, false);

        function closeFn(e){
            if(typeof o.oncancel === 'function') o.oncancel(e);
            if(typeof o.onclose === 'function') o.onclose(e);
            destory();
        }
        function sureFn(e){
            e.params = {};
            inputs = body.querySelectorAll('[name]');
            for(let i=0, len=inputs.length; i<len; i++) e.params[ inputs[i].name ] = inputs[i].value;
            if(typeof o.onsure === 'function') o.onsure(e);
            destory();
        }
        function destory(){
            close.removeEventListener('click', closeFn, false);
            yes.removeEventListener('click', sureFn, false);
            no.removeEventListener('click', closeFn, false);
            context.removeChild(box);
            if(typeof o.onhide === 'function') o.onhide();
        }

        if(typeof o.oncreated === 'function') o.oncreated();
    },
    tab(id){
        let context, tabs, tabbody, data, len, blen, i=0;

        if(typeof id === 'string'){
            context = document.getElementById(id);
        }else if(id && id.nodeType === 1){
            context = id;
        }else{
            throw 'The parameter of tab must be id or element!';
        }

        id = null;
        tabs = context.querySelectorAll('[data-tab]');
        tabbody = context.querySelectorAll('[data-tabbody]');
        len = tabs.length;
        blen = tabbody.length;

        for(; i<len; i++){
            tabs[i].addEventListener('click', handler, false);
        }

        function handler(e){
            for(i=0; i<len; i++){
                tabs[i].classList.remove('active');
            }
            this.classList.add('active');
            if(data = e.currentTarget.getAttribute('data-tab')){
                for(i=0; i<blen; i++){
                    if(tabbody[i].getAttribute('data-tabbody') === data){
                        tabbody[i].classList.add('active');
                    }else{
                        tabbody[i].classList.remove('active');
                    }
                }
            }
        }

        function destory(){
            try{
                for(i=0; i<len; i++) tabs[i].removeEventListener('click', handler, false);
            }catch (e) {}
        }

        return {destory};
    },
    menu(o, context) {
        if(typeof o !== 'object' || typeof o.items !== 'object'){
            throw 'The first parameter (options && options.items) of menu must be given!';
        }
        let _this = this,
            menu = document.createElement('div'),
            len = o.items.length,
            i = 0,
            item,
            div,
            target;

        menu.className = 're-menu';
        for (; i < len; i++) {
            item = o.items[i];
            div = document.createElement('div');
            if (typeof item.data === 'object') {
                for (let k in item.data) {
                    if (item.data.hasOwnProperty(k)) div.setAttribute('data-' + k, item.data[k]);
                }
            }
            div.className = 're-menu-item';
            if (typeof item.css === 'string') div.setAttribute('style', item.css);
            if (typeof item.html === 'string') div.innerHTML = item.html;
            div.addEventListener('click', handle, false);
            menu.appendChild(div);
        }

        context = (context) && (context.nodeType === 1) ? context : document.body;
        context.appendChild(menu);

        document.addEventListener('mouseup', upFn, false);
        menu.style.left = (o.x || 0) + 'px';
        menu.style.top  = (o.y || 0) + 'px';

        function handle(e) {
            target = e.currentTarget;
            if(typeof o.onclick === 'function') o.onclick(target);
            leaveFn();
        }

        function upFn(e) {
            if(!menu.contains(e.target) && e.target !== menu) leaveFn();
        }

        function leaveFn() {
            if(typeof o.onhide === 'function') o.onhide();
            if (target) target.removeEventListener('click', handle, false);
            document.removeEventListener('mouseup', upFn, false);
            context.removeChild(menu);
        }
        return menu;
    },
    exec(name, val, range){
        if(!range || range.collapsed) return;

        this.range(range);
        
        let islink = name === 'link',
            uniqid = islink ? val : 'http://reditor.'+new Date().getTime()+'.com';

        document.execCommand('createLink', false, uniqid);

        if(!islink){
            let spans = document.querySelectorAll('a[href="'+uniqid+'"]'),
                len=spans.length,
                i = 0,
                span,

                inner,
                jlen,
                j = 0;

            for(; i<len; i++){
                //移除内部节点的相同样式
                inner = spans[i].querySelectorAll('*');
                jlen = inner.length;
                for(; j<jlen; j++){
                    inner[j].style[name] = '';
                }
                span = document.createElement('span');
                span.style[name] = val;

                span.innerHTML = spans[i].innerHTML;

                spans[i].parentNode.replaceChild(span, spans[i]);
            }
        }
    }
}