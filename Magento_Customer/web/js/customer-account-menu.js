define([
    'jquery',
    'uiComponent',
    'mage/storage',
    'mage/url',
    'Magento_Customer/js/action/login',
    'Magento_Customer/js/customer-data'
], function($, Element, Storage, Url, loginAction, customerData) {
    return Element.extend({
        defaults: {
            askLogin: false,
            email: null,
            password: null
        },

        fields: {
            email: '#customer_email',
            password: '#customer_password'
        },

        previousEmail: null,

        initObservable: function() {
            this._super();

            this.observe([
                'askLogin',
                'email',
                'password'
            ]);

            return this;
        },

        checkEmail: function() {
            var self = this;

            if (this.isEmailEmpty()) {
                return this;
            }

            if (!this.emailChanged()) {
                this.proceedToLogin();
                return this;
            }

            this.previousEmail = this.email();
            this.persistEmail();

            this.isEmailAvailable()
                .done(function(isAvailable) {
                    if (isAvailable) {
                        self.proceedToRegistration();
                        return;
                    }

                    self.proceedToLogin();
                })
                .fail(function(xhr, status, error) {
                    console.error(error);

                    if (xhr.responseText.length > 0) {
                        console.error(JSON.parse(xhr.responseText));
                    }

                    self.discardEmail();
                });
        },

        discardEmail: function() {
            var data = customerData.get('customer')() || {};

            if (data.hasOwnProperty('email')) {
                delete data.email;
            }

            customerData.set('customer', data);
        },

        editEmail: function() {
            this.askLogin(false);
            this.password(null);

            $(this.fields.email).focus();
        },

        emailChanged: function() {
            return (this.previousEmail != this.email());
        },

        isEmailAvailable: function(email) {
            var data = JSON.stringify({ customerEmail: this.email() });

            return Storage.post('rest/V1/customers/isEmailAvailable', data);
        },

        isEmailEmpty: function() {
            var email = this.email();

            if (typeof email != 'string') {
                return true;
            }

            email = email.trim();

            return (email.lenght === 0);
        },

        login: function() {
            loginAction({
                username: this.email(),
                password: this.password()
            });
        },

        persistEmail: function() {
            var data = customerData.get('customer')() || {};
            data.email = this.email();

            customerData.set('customer', data);
        },

        proceedToLogin: function() {
            this.askLogin(true);

            $(this.fields.password).focus();
        },

        proceedToRegistration: function() {
            this.redirectTo('customer/account/create');
        },

        redirectTo: function(path) {
            window.location.href = Url.build(path);
        }
    });
});
