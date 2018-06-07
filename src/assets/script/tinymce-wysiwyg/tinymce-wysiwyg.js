import tinymceWysiwygConfig from './tinymce-wysiwyg-config.js'
import { addTinyMceToolbarButtons } from './tinymce-wysiwyg-toolbar.js'

(function () {

    class externalTinymceWysiwyg {

        constructor(name, id, host, options, config) {
            this.name = name;
            this.id = id;
            this.host = host;
            this.options = options;
            this.config = config;
        }

        initialize(host, options, id) {
            // if (!this.host) {
            //     this.host = {};
            // }
            this.host = host;
            this.options = options;
            this.id = id;
            // this.options = somethingWithCallbacks.options;
            console.log('myComponent initialize', this.host);
            // this.host.update('update value');
        }

        render(container) {
            console.log('render id:', this.id);

            container.innerHTML = `<div class="wrap-float-label">
            <div id="` + this.id + `" class="field-string-wysiwyg-mce-box wrap-float-label"></div>
            </div>`;

            var settings = {
                enableContentBlocks: false,
                auto_focus: false,
            };

            //TODO: add languages
            // angular.extend($scope.tinymceOptions, {
            //     language: lang2,
            //     language_url: "../i18n/lib/tinymce/" + lang2 + ".js"
            // });

            var selectorOptions = {
                selector: '#' + this.id,
                //init_instance_callback: this.tinyMceInitCallback
                setup: this.tinyMceInitCallback.bind(this),
                // content_css: '/tinymce-wysiwyg.css',
            };

            var options = Object.assign(selectorOptions, this.config.getDefaultOptions(settings));
            console.log('options');
            console.table(options);

            tinymce.init(options);


            // var divElements = container.getElementsByTagName('div');
            // console.log('elements value', divElements[1].innerHTML);

            // elements[0].addEventListener('change', () => {
            //     console.log('input clcik');
            //     // this.changeCheck(event, divElements[1].innerHTML);
            // })

            // divElements[1].addEventListener('change', () => {
            //     console.log('divElements clcik');
            //     this.changeCheck(event, divElements[1].innerHTML);
            // })
        }

        /**
         * function call on change
         * @param {*} event 
         * @param {*} value 
         */
        changeCheck(event, value) {
            console.log('changeCheck event', event);
            console.log('changeCheck value', value);

            // do validity checks
            var isValid = this.validateValue(value);
            if (isValid) {
                this.host.update(value);
            }
        }

        /**
         * For validating value
         * @param {*} value 
         */
        validateValue(value) {
            // if (value.length < 3) {
            //     return false;
            // }
            //TODO: show validate message ???
            return true;
        }

        /**
         * On render and change set configuration of control
         * @param {*} container - is html container for component
         * @param {*} disabled 
         */
        setOptions(container, disabled) {
            console.log('set disable 1', tinymce.get(this.id));
            var isReadOnly = tinymce.get(this.id).readonly;
            if (disabled && !isReadOnly) {
                tinymce.get(this.id).setMode('readonly');
            }
            else if (!disabled && isReadOnly) {
                tinymce.get(this.id).setMode('code');
            }
        }

        /**
         * New value from the form into the view
         * This function can be triggered from outside when value changed
         * @param {} container 
         * @param {*} newValue 
         */
        setValue(container, newValue) {
            // var elements = container.getElementsByTagName('div');
            // console.log('Exernal outside valu:', elements[1].innerHTML);
            // console.log('Exernal outside newvalue:', newValue);
            // if (elements[1].innerHTML !== newValue)
            //     elements[1].innerHTML = newValue;

            // TODO: write like this:
            tinymce.get(this.id).setContent(newValue);
        }

        /**
         * on tinyMce setup we set toolbarButtons and change event listener
         * @param {*} editor 
         */
        tinyMceInitCallback(editor) {
            console.log("Editor1: " + editor.id + " is now initialized.");
            console.log("Editor host: ", this.host);
            var imgSizes = this.config.svc().imgSizes;
            addTinyMceToolbarButtons(this.host, editor, imgSizes);

            editor.on('change', e => {
                console.log('Editor was change', editor.getContent());
                this.changeCheck(e, editor.getContent())
            });
        }
    }

    function externalComponentFactory(name) {
        var config = new tinymceWysiwygConfig();
        console.log('customTinymce', config);
        return new externalTinymceWysiwyg(name, null, null, null, config);
    }

    window.addOn.register(externalComponentFactory('tinymce-wysiwyg'));
})();