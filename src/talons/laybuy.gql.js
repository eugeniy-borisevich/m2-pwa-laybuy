import { gql } from '@apollo/client';

export const GET_LAYBUY_CONFIG_DATA = gql`
    query storeConfigData {
        storeConfig {
            store_code
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

export const GET_LAY_BUY_DATA = gql`
    query GetLayBuyData($email:String, $cartId:String!) {
        data: getLayBuyData(email:$email, cartId:$cartId) {
            success,
            redirect_url
        }
    }
`;
export default {
    getLaybuyConfigQuery: GET_LAYBUY_CONFIG_DATA,
    setPaymentMethodOnCartMutation: SET_PAYMENT_METHOD_ON_CART,
    getLaybuyDataQuery: GET_LAY_BUY_DATA
};
