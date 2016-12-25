angular.module("app")
    .provider("state", function StateProvider() {
        this.$get = [function stateFactory() {
            return {
                state:{
                    
                }
            };
        }];
    });