define(['Magento_Customer/js/customer-data'], function(customerData) {
    function isValidConfig(config) {
        return (
            typeof config == 'object'
            && config.hasOwnProperty('data')
            && config.data.hasOwnProperty('section')
            && config.data.hasOwnProperty('index')
        );
    }

    var Collection = function(section) {
        this.section = section;
        this.data = customerData.get(section)() || {};
    };

    Collection.prototype.get = function(index) {
        if (!this.has(index)) {
            return null;
        }

        return this.data[index];
    };

    Collection.prototype.has = function(index) {
        return this.data.hasOwnProperty(index);
    };

    Collection.prototype.unset = function(index) {
        if (!this.has(index)) return;

        delete this.data[index];
        customerData.set(this.section, this.data);

        return this;
    };

    return function(config, element) {
        if (!isValidConfig(config)) {
            return;
        }

        var collection = new Collection(config.data.section);
        element.value = collection.get(config.data.index);

        collection.unset(config.data.index);
    };
});
