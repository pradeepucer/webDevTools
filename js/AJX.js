class AJXX {
    constructor(conf) {
        var default_conf = {
            loader: true,
            toastr: true,
            loader_type: 'spin',
            loader_message: 'Processing....',
        }
        this.processing = false;
        this.callback = false;
        this.el = false;
        this.event = false;
        this.method = 'GET';
        this.params = {do_confirm:false,confirm_message:'Are You Sure?'}
        //alert(this['processing'])
        this.conf = {
            ...default_conf,
            ...conf
        };
        //alert(this['conf']['loader_type'])
        if (this.conf.loader) {
            this.create_loader();
        }
        if (this.conf.toastr) {
            this.create_toastr();
        }
    }

    settings(settings) {
        this.conf = {
            ...this.conf,
            ...settings
        };
        //alert(this.conf.toastr)
        return this;
    }
    method(method) {
        this.method = method;
        return this;
    }
    el(el) {
        this.el = element;
        return this;
    }
    callback(callback) {
        this.callback = callback;
        return this;
    }

    set_params(params) {
        this.params = {
            ...this.params,
            ...params
        };
        return this;
    }
    set_data_attribute_params(elem) {

        if (elem) {
            var data_attr = elem.dataset;
            for (const k in data_attr) {
                if (Object.hasOwnProperty.call(data_attr, k)) {
                    const element = data_attr[k];
                    this.params.push(k, data_attr[k]);

                }
            }

        }

        return this;
    }

    get_params(key, default_=false) {
        if( this.params[key] ) {
            return this.params[key] ;
         } 
         return default_;
    }

    buildFormData(formData, data, parentKey) {
        if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
            Object.keys(data).forEach(key => {
                this.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
            });
        } else {
            const value = data == null ? '' : data;

            formData.append(parentKey, value);
        }
        return formData;
    }
    buildQueryString(obj) {
        let getPairs = (obj, keys = []) =>
            Object.entries(obj).reduce((pairs, [key, value]) => {
                if (typeof value === 'object')
                    pairs.push(...getPairs(value, [...keys, key]));
                else
                    pairs.push([
                        [...keys, key], value
                    ]);
                return pairs;
            }, []);

        let x = getPairs(obj)
            .map(([
                    [key0, ...keysRest], value
                ]) =>
                `${key0}${keysRest.map(a => `[${a}]`).join('')}=${value}`)
            .join('&');
        //console.log(x);
        return x;
    }
    appendDataAttributes(formData) {
        var data_attr = this.el.dataset;
        for (const k in data_attr) {
            if (Object.hasOwnProperty.call(data_attr, k)) {
                const element = data_attr[k];
                formData.append('data[' + k + ']', data_attr[k]);

            }
        }
        return formData;
    }


    async post(frm, e, callback) {
        if (this.processing) {
            console.log('Already Processing Request');
            return;
        }

        this.el = frm;
        this.callback = callback;
        this.event = e;
        this.event.preventDefault();
        if( this.params.do_confirm ) {
            if( ! confirm(this.params.confirm_message)) {
                return false;
             } 
        }

        
        this.init_request();

        let formData = new FormData(frm);

        let action = frm.getAttribute('action');

        formData = this.appendDataAttributes(formData);

        const self = this;
        await fetch(action, {
                method: "POST",
                body: formData
            })
            .then(resp => resp.text())
            .then((resp) => {
                try {
                    return JSON.parse(resp);
                    self.responseType = 'json';
                } catch (err) {
                    self.responseType = 'text';
                    return resp;
                }

            }).then(function(resp) {
                self.handle_response(resp)

            })
            .catch((err) => {
                this.handle_error(err)
            });;
    }

    async postJson(data, elem, e, callback) {
        if (this.processing) {
            console.log('Already Processing Request');
            return;
        }

        this.el = elem;
        this.callback = callback;
        this.event = e;
        this.event.preventDefault();
        this.init_request();

        let formData = new FormData();

        formData = this.buildFormData(formData, data, 'payload')
        formData = this.appendDataAttributes(formData);

        let action = this.el.getAttribute('action');



        const self = this;
        await fetch(action, {
                method: "POST",
                body: formData
            })
            .then(resp => resp.text())
            .then((resp) => {
                try {
                    return JSON.parse(resp);
                    self.responseType = 'json';
                } catch (err) {
                    self.responseType = 'text';
                    return resp;
                }

            }).then(function(resp) {
                self.handle_response(resp)

            })
            .catch((err) => {
                this.handle_error(err)
            });;
    }
    async get(elem, e, callback) {
        if (this.processing) {
            console.log('Request In Progress');
            return; 
        }

        this.el = elem;
        this.callback = callback;
        this.event = e;
        this.event.preventDefault();

        if( this.params.do_confirm ) {
            if( ! confirm(this.params.confirm_message)) {
                return false;
             } 
        }

        this.init_request();

        var qs = this.buildQueryString(this.el.dataset);

        let action = this.el.getAttribute('action');
        if( ! action ) {
            action = this.el.getAttribute('href');
        } 
        if( ! action ) {
            action = this.url;
        } 
        if (qs) {
            if (action.indexOf('?') != -1) {
                action = action + '&' + qs;
            } else {
                action = action + '?' + qs;
            }

        }
        //alert(action);

        const self = this;
        await fetch(action, {
                method: "GET",
            })
            .then(resp => resp.text())
            .then((resp) => {
                try {
                    return JSON.parse(resp);
                    self.responseType = 'json';
                } catch (err) {
                    self.responseType = 'text';
                    return resp;
                }

            }).then(function(resp) {
                self.handle_response(resp)

            })
            .catch((err) => {
                this.handle_error(err)
            });;
    }
    async chain(url, type = 'first', params = false, callback) {
        if (this.processing) {
            alert('inprogess');
        }

        var qs = this.buildQueryString(params);

        let action = url;
        if (qs) {
            if (action.indexOf('?') != -1) {
                action = action + '&' + qs;
            } else {
                action = action + '?' + qs;
            }

        }
        this.el = null;
        this.callback = callback;
        //this.event = e;
        //this.event.preventDefault();
        this.init_request();



        alert(action);



        const self = this;
        /* const resp = await fetch(action).then(response => response.json()).then( response => {
            alert('I am done with First step')
            return response;
        }); */
        const resp = await fetch(action).then(response => response.json());
        if (resp.next_url) {
            this.processing = false;
            this.chain(resp.next_url, 'next');
        } else {
            self.handle_response(resp);
        }
        

    }
    //Fix me
    handle_response(resp) {
        this.end_request();
        const event = new CustomEvent('ajx_response', {
            detail: {
                resp: resp,
                'elem': this.el
            }
        });
        document.dispatchEvent(event);
        if (typeof(this.callback) == 'function') {
            this.callback(resp, this.el)
            return;
        }

        let ajx_callbacks = this.el.getAttribute('ajx_callbacks');
        if (ajx_callbacks) {
            this.call_backs(ajx_callbacks, resp, this.el);
            return;
        }
        if (this.el) {
            var target = this.el.getAttribute('ajx_target');

            if (target) {
                document.querySelector(target).innerHTML = resp;

            }

        }

        if (this.conf.toastr) {
            this.show_toastr('Request Processed successfully', 'success', 3000);
        }


        //this.show_toastr('Record updated successfully');

    }
    async handle_response_json(resp, elem) {
        if (resp.status == 'F') {
            document.body.classList.add('ajx-error');
            document.body.classList.remove('ajx-success');
            let ajx_callbacks = this.el.getAttribute('ajx_callbacks_error');
            if (ajx_callbacks) {
                this.call_backs(ajx_callbacks, resp, elem);
                return;
            } else {
                this.show_toastr(resp.error, 'error', false);
            }

        } else {
            document.body.classList.remove('ajx-error');
            document.body.classList.add('ajx-success');
            let ajx_callbacks = this.el.getAttribute('ajx_callbacks_success');
            if (ajx_callbacks) {
                this.call_backs(ajx_callbacks, resp, elem);
                return;
            } else {
                var target = elem.getAttribute('ajx_target');
                if (target) {
                    document.querySelector(target).innerHTML = resp.body;
                }
                this.show_toastr(resp.message, 'success', 3000);
            }
        }
    }
    async handle_response_text(resp, elem) {
        var target = elem.getAttribute('ajx_target');
        if (target) {
            document.querySelector(target).innerHTML = resp;

        }
        this.show_toastr('Request Processed successfully', 'success', 3000);
    }
    /**
     * call comma separated callbacks
     */
    async call_backs(ajx_callbacks, resp, elem) {
        let callbacks = ajx_callbacks.split(',');
        for (const callback of callbacks) {
            if (typeof(this[callback]) == 'function') {
                this[callback](resp, elem);
            }

        }
        return;

    }
    handle_error(data) {

        //alert(data)
    }

    init_request(el) {
        this.processing = true;
        document.body.classList.add('ajx-processing');
        document.body.classList.remove('ajx-done');
        if (this.el) {
            this.el.classList.add('ajx-processing');

            this.el.classList.remove('ajx-done');
        }


    }
    end_request(el) {
        this.processing = false;
        document.body.classList.remove('ajx-processing');

        document.body.classList.add('ajx-done');

        if (this.el) {
            this.el.classList.add('ajx-done');

            this.el.classList.remove('ajx-processing');
        }



    }
    create_loader() {

        var l = document.querySelector('.ajx-loader');
        if (l) {
            return;
        }
        this.loader = document.createElement('div');
        this.loader.className = 'ajx-loader-wrapper';




        if (this.conf.loader_type == 'spin') {
            var d = document.createElement('div');
            d.className = 'ajx-loader';
            this.loader.appendChild(d);

        } else {
            var d = document.createElement('div');
            d.className = 'ajx-loader-text';
            d.innerHTML = `<span>${this.conf.loader_message}<span class="ajx-loading"></span></span>`;
            this.loader.appendChild(d);

        }
        var css = document.createElement('style');
        css.innerText = '.ajx-loader{position:relative;border:16px solid #f3f3f3;border-radius:50%;border-top:16px solid #3498db;width:70px;height:70px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}.ajx-loader-wrapper{position:fixed;top:0;left:0;width:100%;height:100%;background:#000;opacity:.5;display:none;align-items:center;justify-content:center}.ajx-container{position:relative}.ajx-loader-text{color:#fff}.ajx-loading{display:inline-block;overflow:hidden;height:1.3em;margin-top:-.3em;line-height:1.5em;vertical-align:text-bottom}.ajx-loading::after{display:inline-table;white-space:pre;text-align:left}.ajx-loading::after{ content: "\\A.\\A..\\A...";animation:spin4 2s steps(4) infinite}@keyframes spin1{to{transform:translateY(-1.5em)}}@keyframes spin2{to{transform:translateY(-3em)}}@keyframes spin3{to{transform:translateY(-4.5em)}}@keyframes spin4{to{transform:translateY(-6em)}}@keyframes spin5{to{transform:translateY(-7.5em)}}@keyframes spin6{to{transform:translateY(-9em)}}@keyframes spin7{to{transform:translateY(-10.5em)}}@keyframes spin8{to{transform:translateY(-12em)}}@keyframes spin9{to{transform:translateY(-13.5em)}}@keyframes spin10{to{transform:translateY(-15em)}}@keyframes spin11{to{transform:translateY(-16.5em)}}@keyframes spin12{to{transform:translateY(-18em)}}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0)}100%{-webkit-transform:rotate(360deg)}}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}';
        css.innerText = css.innerText + '.ajx-processing .ajx-loader-wrapper{display:grid}';
        this.loader.appendChild(css);
        document.body.appendChild(this.loader);


    }

    create_toastr() {
        this.toaster = document.createElement('div');
        this.toaster.className = 'ajx-toaster';

        var d = document.createElement('div');
        d.className = 'content';
        this.toaster.appendChild(d);

        var cl = document.createElement('div');
        cl.className = 'close';
        cl.innerHTML = '&#10006;'
        cl.addEventListener('click', () => this.remove_toaster());
        this.toaster.appendChild(cl);

        var css = document.createElement('style');
        css.innerText = '.ajx-toaster{opacity: 0;transition: all 1s linear;width:fit-content;background:#3cb38d;color:#fff;border-radius:4px;padding:20px;text-align:center;position:absolute;top:10px;right:10px;box-shadow:0 10px 20px rgba(75,50,50,.05);transition: all 1s linear;z-index:9999}.ajx-toaster.error{background:#990f0f;}.ajx-toaster .close{color:red;position:absolute;right:10px;cursor:pointer}';
        this.toaster.appendChild(css);
        document.body.appendChild(this.toaster);
        /* window.addEventListener("message", (event) => {
            alert(event.origin)
            if (event.origin !== "http://example.com:8080")
                //return;

                this.show_toastr(event.data);

            // event.source is window.opener

        }); */

    }

    show_toastr(message, type = 'success', timeout = 3000) {
        this.toaster.querySelector('.content').innerHTML = message;
        var y = window.scrollY
        this.toaster.style.cssText += 'display:grid;opacity:1;top:'+y+'px;';
        this.toaster.classList.add(type);
        if (timeout) {
            setTimeout(() => this.remove_toaster(), 3000);
        }

    }

    remove_toaster() {
        this.toaster.style.cssText += 'opacity:0';
    }


    async reset_form(resp, elem) {
        if (resp.status == 'S') {
            elem.reset();
        }
    }

    async replace_data(resp, elem) {

    }
    async redirect(resp, elem) {
        if (resp.status == 'S') {
            var redirect = this.el.getAttribute('ajx_redirect');
            if (redirect) {
                window.location.href = redirect;

            }
        }
    }
    async reload(resp, elem) {
        if (resp.status == 'S') {
            window.location.reload();
        }
    }

    async hide_parent(resp, elem) {
        if (resp.status == 'S') {
            elem.closest(this.params.parent_element).style.display='none';
        }
    }

    async display_toastr(resp, elem, timeout = 3000) {
        if (resp.status == 'S') {
            this.show_toastr(resp.message,'success');
        } else {
            this.show_toastr(resp.error,'error');
        }

    }



}
document.addEventListener("DOMContentLoaded", function(event) {
    AJX_OBJ = new AJXX({
        loader: true,
        toastr: true,
    });

});