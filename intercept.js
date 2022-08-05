module.exports = targets => {
    const { specialFeatures } = targets.of('@magento/pwa-buildpack');
    specialFeatures.tap(flags => {
        /**
         *  Wee need to activate esModules, cssModules and GQL Queries to allow build pack to load our extension
         * {@link https://magento.github.io/pwa-studio/pwa-buildpack/reference/configure-webpack/#special-flags}.
         */
        flags[targets.name] = {
            esModules: true,
            cssModules: true,
            graphqlQueries: true
        };
    });
    targets.of("@magento/venia-ui").routes.tap(routes => {
        routes.push({
            name: "LayBuyOrderComplete",
            pattern: "/laybuyOrderComplete/:orderID?",
            path: require.resolve("./src/components/laybuyOrderComplete.js")
        });
        return routes;
    });

    const { checkoutPagePaymentTypes } = targets.of('@magento/venia-ui');

    checkoutPagePaymentTypes.tap(payments => {
                payments.add({
                    paymentCode: 'laybuy_payment',
                    importPath:
                        '@raisetech/pwa-laybuy/src/components/laybuy.js'
                })

        }
    );
};
