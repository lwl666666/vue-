class Lue{
    constructor(options){
        const vm = this;
        vm.$options = options;
        let data = vm._data = vm.$options.data;
        observe(vm._data);
        new compiler(vm.$options.el,vm);
    }
}

function observe(value){
    if(!value || typeof value !== 'object'){
        return;
    }
    return new Observer(value);
}

class Observer{
    constructor(value){
        this.walk(value);
    }
    walk(obj){
        Object.keys(obj).forEach(key =>{
            if(typeof obj[key] === 'object'){
                this.walk(obj[key]);
            }
            defineReactive(obj,key,obj[key]);
        })
    }
}

function defineReactive(obj,key,value){
    let dep = new Dep();
    Object.defineProperty(obj,key,{
        get(){
            if(Dep.target){
                dep.depend();
            }
            return value;
        },
        set(newValue){
            if(newValue === value || (newValue !== newValue && value !== value)){
                return;
            }
            value = newValue;
            observe(newValue);
            dep.notify();
        }
    })
}

class Dep{
    constructor(){
        this.subs = [];
    }
    depend(){
        if(Dep.target){
            Dep.target.addDep(this);
        }
    }
    addSub(sub){
        this.subs.push(sub);
    }
    notify(){
        this.subs.forEach(sub =>{
            sub.update();
        })
    }
}
let targetStack = [];
Dep.target = null;
function pushTarget (target) {
    targetStack.push(target)
    Dep.target = target
  }
  
function popTarget () {
    targetStack.pop()
    Dep.target = targetStack[targetStack.length - 1]
}
function parsePath (path) {
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
}
class Watcher{
    constructor(vm,exp,cb){
        this.vm = vm;
        this.exp = parsePath(exp);
        this.cb = cb;
        this.get();
    }
    get(){
        pushTarget(this);
        this.value = this.exp.call(this.vm, this.vm._data)
        popTarget();
    }
    update(){
        let val = this.exp.call(this.vm, this.vm._data);
        this.cb.call(this.vm, val, this.value)
    }
    addDep(dep){
        dep.addSub(this);
    }
}

class compiler {
    constructor(el,vm){
        vm.$el = document.querySelector(el);
        this.parse(vm.$el,vm);
    }
    parse(root,vm){
        Array.from(root.childNodes).forEach(node =>{
            if(node.nodeType === 3){
                let reg = /\{\{(.*?)\}\}/g;
                let txt = node.textContent.trim();
                if(reg.test(txt)){
                    let val = parsePath(RegExp.$1)(vm._data);
                    node.textContent = txt.replace(reg,val);
                    new Watcher(vm,RegExp.$1,(newVal)=>{
                        node.textContent = txt.replace(reg,newVal);
                    })
                }
            }
            if(node.nodeType === 1){
                let nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(attr =>{
                    let attrName = attr.name;
                    let attrValue = attr.value;
                    if(attrName === 'l-model'){
                        node.value = parsePath(attrValue)(vm._data);
                    }
                    new Watcher(vm,attrValue,(newVal =>{
                        node.value = newVal;  
                    }))
                    node.addEventListener('input',e =>{
                        let newVal = e.target.value;
                        let arr = attrValue.split(".");
                        let val = vm._data;
                        arr.forEach((key,i)=>{
                            if(i === arr.length -1){
                                val[key] = newVal;
                                return;
                            }
                            val = val[key];
                        })
                    })
                })
            }
            if(node.childNodes && node.childNodes.length>0){
                this.parse(node,vm);
            }
        })
    }
}
