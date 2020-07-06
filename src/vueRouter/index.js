/*
 * @Author: your name
 * @Date: 2020-06-28 19:58:33
 * @LastEditTime: 2020-07-06 21:02:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Editort
 * @FilePath: /vue-compiler/src/vuerouter/index.js
 */ 

let _Vue = null

export default class VueRouter {
    static install(Vue) {
        // 1. 判断当前插件是否已被安装
        if(VueRouter.install.installed) {
            return 
        }
        VueRouter.install.installed = true
        // 2. 把Vue构造函数记录到全局变量，以便后续代码中使用
        _Vue = Vue
        // 3. 把创建Vue实例时候传入的router对象注入到Vue实例上(new Vue时传入了router),让所有实例共享一个成员
        // 给所有vue实例混入一个选项
        _Vue.mixin({
            beforeCreate() {
                if(this.$options.router) { // 只由路由页面才有this.$options.router,组件中没有
                    _Vue.prototype.$router = this.$options.router // VueRouter实例
                    this.$options.router.init()
                }
            }
        })
    }

    constructor(options) {
        this.options = options
        this.routeMap = {}
        this.mode = options.mode || 'hash'
        this.data = _Vue.observable({ // 创建一个响应式对象
            current: this.getPath(this.mode, '/') // 当前路由
        })
    }

    getPath(mode, path) {
        let upPath = this[mode+'GetPath']
        if(upPath) {
            return upPath(path)
        }
    }

    historyGetPath(path) {
        return path
    }

    hashGetPath(path) {
        return `#${path}`
    }

    init() {
        this.createRouteMap()
        this.initComponents(_Vue)
        this.initEvent(this.mode)
    }

    // 遍历路由规则，解析为键值对形式，存储到routeMap中
    createRouteMap() {
        this.options.routes.forEach(route => {
            let path = this.getPath(this.mode, route.path)
            this.routeMap[path] = route.component
        })
    }

    // 运行时不支持模版编译，此时有两种办法
    // 1. 改为完整版编译，新建vue.config.js,设置runtimeCompiler: true
    // 2. 还是运行时编译，将template模版改为render函数
    initComponents(Vue) {
        Vue.component('router-link', {
            props: {
                to: String
            },
            // template: '<a :href="to"><slot></slot></a>'
            render(h) {
                return h('a', {
                    attrs: {
                        href: this.to
                    },
                    on: {
                        click: this.clickHandler
                    }
                }, [this.$slots.default])
            },
            methods: {
                clickHandler (e) {
                    // 第一个参数是data
                    // 第二个参数是标题
                    // 第三个参数是路由
                    let path = this.$router.getPath(this.$router.mode, this.to)
                    this.$router.data.current = path
                    history.pushState({}, '', path)
                    
                    // 因为这里是一个组件，所以这里的this指vue实例
                    e.preventDefault()
                }
            }
        })

        let _self = this

        Vue.component('router-view', {
            render(h) {
                // data时响应式数据，改变后重新渲染
                const component = _self.routeMap[_self.data.current]
                if(this.$router.mode === 'hash') {
                    if(_self.data.current !== window.location.hash) {
                        window.location.hash = _self.data.current
                    }
                } else if(this.$router.mode === 'history') {
                    if(_self.data.current !== window.location.pathname) {
                        window.location.pathname = _self.data.current
                    }
                }
                return h(component)
            }
        })
    }

    initEvent(mode) {
        if(mode === 'hash') {
            window.addEventListener('hashchange', () => {
                this.data.current = window.location.hash
            }, false)
        } else if(mode === 'history') {
            window.addEventListener('popstate', () => { // 监听popstate事件，导航栏改变时当前路由对应的component也要变
                this.data.current = window.location.pathname
            })
        }
    }
}
