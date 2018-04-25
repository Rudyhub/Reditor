import utils from '../utils';
import options from '../options';
import Item from './upload/Item';
import Ajax from './upload/Ajax';
import Mange from './upload/Manage';
import Logo from './upload/Logo';

let dialog,
    choser = document.createElement('input'),
    typeLimit = [],    //用来保存可支持的文件类型，以方便判断
    opt = options.upload,
    date = new Date(),
    tab,
    list,
    choserBtn,
    startBtn,
    clearBtn,
    dateInput,
    seartchBtn;

choser.type = 'file';
choser.multiple = true;

//将支持的所有类型都加入到typeLimit
for(let type in opt.type){
    if(opt.type.hasOwnProperty(type)){
        opt.type[type].forEach(function(v){
            typeLimit.push(v);
        });
    }
}

//input type=file的change事件
choser.on('change', ()=>{
    let file, len, i=0, ext, type, size, fragMent,id;
    if(choser.files){
        len = choser.files.length;
        fragMent = document.createDocumentFragment();
        for(; i<len; i++){
            file = choser.files[i];
            ext = file.name.slice(file.name.lastIndexOf('.')+1).toLowerCase();
            type = file.type.split(/\//g)[0];
            size = (file.size/1048576).toFixed(2);//MB
            id = 're'+file.lastModified+file.size;
            //判断文件类型
            if(!typeLimit.includes(ext)){
                utils.dialog({
                    css: 'max-width: 360px;',
                    title: '格式错误',
                    colorType: 'danger',
                    overlay: true,
                    yes: false,
                    no: false,
                    body: `不支持“${ext}”，仅支持以下类型：
                    <ul>
                        <li>图片：${opt.type.image.join(', ')}</li>
                        <li>视频：${opt.type.video.join(', ')}</li>
                        <li>音频：${opt.type.audio.join(', ')}</li>
                        <li>其他：${opt.type.other.join(', ')}</li>
                    </ul>`
                });
                break;
            }
            //判断文件大小
            if( size > opt.size[type]){
                utils.dialog({
                    colorType: 'danger',
                    overlay: true,
                    css: 'max-width: 360px;',
                    title: '文件大小超出',
                    yes: false,
                    no: false,
                    body: `文件“${file.name}”大小（${size}MB）超出上限，文件大小上限详情如下：
                    <ul>
                        <li>图片：${opt.size.image}(MB)</li>
                        <li>视频：${opt.size.video}(MB)</li>
                        <li>音频：${opt.size.audio}(MB)</li>
                        <li>其他：${opt.size.other}(MB)</li>
                    </ul>`
                });
                break;
            }
            //判断相同的文件
            if(Ajax.files[id]){
                utils.dialog({
                    colorType: 'danger',
                    css: 'max-width: 360px;',
                    overlay: true,
                    title: '文件重复',
                    yes: false,
                    no: false,
                    body: '文件“'+file.name+'”可能是重复的，请检查。'
                });
                break;
            }
            //生成html
            fragMent.appendChild(Item.create({
                id,
                type,
                ext,
                mime: file.type,
                src: window.createURL(file),
                desc: '',
                name: file.name,
                logo: opt.logo
            }));
            //添加要上传的数据到ajax，以备上传
            Ajax.files[id] = {
                file,
                query: {desc: ''}
            }
        }
        list[0].append(fragMent);
        fragMent = null;
    }
},false);

//添加文件
function fireChoser(){
    document.body.append(choser);
    choser.value = '';
    choser.click();
    choser.remove();
}
//开始上传
function fireStart(){
    //更新上传的数据
    list[0].children.forEach(child=>{
        Ajax.files[child.id].query.desc = child.find('.re-upload-textarea')[0].value;
    });
    //添加水印
    let logoImgs = list[0].find('.re-upload-logo.active'),
        i = 0;
    function recursion(logoImg){
        Logo.canvasFile(logoImg, file=>{
            Ajax.files[ logoImg.attr('data-file-id') ].file = file;
            i++;
            if(logoImgs[i]){
                recursion(logoImgs[i]);
            }else{
                //启动上传
                Ajax.send(opt.path);
            }
        });
    }
    recursion(logoImgs[0]);
}
//清除
function fireClear(){
    Item.remove(list[0]);
}

//处理上传成功
Ajax.then = function(data){
    list[0].children.addClass('re-uploaded active');
    list[0].find('textarea').attr('disabled','disabled');
    console.log(data);
};


//处理管理面板查询文件
function fireSearch(){
    console.log(dateInput.value)
    if(/\d{8}/.test(dateInput.value)){
        Mange.send(dateInput.value, opt.path);
    }else{
        utils.dialog({
            title: '日期错误',
            css: 'max-width:360px',
            body: '输入用于查询的日期错误，必须是8位数字，如：'+date.format('Ymd'),
            colorType: 'danger',
            overlay: true,
            yes: false,
            no: false
        });
    }
}
//处理管理面板请求数据成功
Mange.then = function(data){
   console.log(data);
};

export default (reditor)=>{
    utils.dialog({
        title: '文件上传与管理',
        css: 'width: 80%',
        body: `
        <div id="re-upload" class="re-upload">
            <div class="re-tabs">
                <span class="re-tab active" data-tab="upload">上传</span>
                <span class="re-tab" data-tab="manage">管理</span>
            </div>
            <div class="re-tabbody active" data-tabbody="upload">
                <div class="re-upload-toolbar">
                    <button id="re-upload-u-choser" class="re-btn-m re-btn-success">添加</button>
                    <button id="re-upload-u-start" class="re-btn-m re-btn-warning">上传</button>
                    <button id="re-upload-u-clear" class="re-btn-m re-btn-danger">清空</button>
                </div>
                <div class="re-upload-list"></div>
            </div>
            <div class="re-tabbody" data-tabbody="manage">
                <div class="re-upload-toolbar">
                    <input id="re-upload-m-date" class="re-input-m" type="text" placeholder="输入日期">
                    <button id="re-upload-m-search" class="re-btn-m re-btn-success">查看</button>
                </div>
                <div class="re-upload-list"></div>
            </div>
        </div>`,
        oncreated(){
            dialog = document.find('#re-upload');
            //创建tab
            tab = utils.tab(dialog);

            //获取上传、管理列表
            list = dialog.find('.re-upload-list');

            //获取上传面板按钮，并绑定事件
            choserBtn = document.find('#re-upload-u-choser');
            startBtn = document.find('#re-upload-u-start');
            clearBtn = document.find('#re-upload-u-clear');
            choserBtn.on('click', fireChoser);
            startBtn.on('click', fireStart);
            clearBtn.on('click', fireClear);

            //获取管理面板查询按钮，并绑定事件
            dateInput = document.find('#re-upload-m-date');
            seartchBtn = document.find('#re-upload-m-search');
            seartchBtn.on('click', fireSearch);
            dateInput.value = date.format('YMD');
        },
        onsure(e){

        },
        onhide(){
            if(tab) tab.destory();
            try{
                choserBtn.off('click', fireChoser, false);
                startBtn.off('click', fireStart, false);
                clearBtn.off('click', fireClear, false);
            }catch (e) {}
        }
    });
}