import { gql } from '@apollo/client';

export const GET_LAYBUY_CONFIG_DATA = gql`
    query storeConfigData {
        storeConfig {
            payment_laybuy_payable_to @client
            payment_laybuy_mailing_address @client
        }
    }
`;

export const SET_PAYMENT_METHOD_ON_CART = gql`
    mutation setPaymentMethodOnCart($cartId: String!) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: { code: "laybuy_payment" } }
        ) @connection(key: "setPaymentMethodOnCart") {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;


export default {
    getLaybuyConfigQuery: GET_LAYBUY_CONFIG_DATA,
    setPaymentMethodOnCartMutation: SET_PAYMENT_METHOD_ON_CART,
};
