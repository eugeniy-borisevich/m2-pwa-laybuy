import {useCallback, useEffect} from 'react';
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useLazyQuery} from "@apollo/client";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/CheckoutPage/checkoutPage.gql";
import {useCheckoutContext} from "@magento/peregrine/lib/context/checkout";
import {gql, useQuery, useMutation} from '@apollo/client';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import actions from "@magento/peregrine/lib/store/actions/checkout";
import {useSummary} from "@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/useSummary";

export const useCheckoutFlow = (props) => {

    const GET_LAY_BUY_DATA = gql`
        query GetLayBuyData($email:String, $cartId:String!) {
            data: getLayBuyData(email:$email, cartId:$cartId) {
                success,
                redirect_url
            }
        }
    `;


    const [{ cartId }] = useCartContext();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const {
        getOrderDetailsQuery
    } = operations;
    const [
        getOrderDetails,
        { data: orderDetailsData, loading: orderDetailsLoading }
    ] = useLazyQuery(getOrderDetailsQuery, {
        // We use this query to fetch details _just_ before submission, so we
        // want to make sure it is fresh. We also don't want to cache this data
        // because it may contain PII.
        fetchPolicy: 'no-cache'
    });

    const [
        getLaybuyData,
        { data: laybuyData, loading: laybuyDataLoading }
    ] = useLazyQuery(GET_LAY_BUY_DATA, {
        fetchPolicy: 'no-cache'
    });

    const talonProps = useSummary();

    const { selectedPaymentMethod } = talonProps;

    const handleLaybuyPlaceOrder = useCallback(() => {
        async function placeOrderAndCleanup() {
            const layBuy = await getLaybuyData({
                variables: {
                    'email': '',
                    cartId
                }
            });
            if (layBuy.data) {
                if (layBuy.data.data[0].success) {
                    window.location = layBuy.data.data[0].redirect_url;
                }
            }
        }

        placeOrderAndCleanup();
    }, [cartId, getOrderDetails, laybuyData]);

    /**
     * @param methodeCode string
     * @returns {*}
     */
    const isMyPaymentFlow = () => {
        if (!selectedPaymentMethod) {
            return false;
        }
        let paymentMethod = selectedPaymentMethod.code;
        return paymentMethod.startsWith('laybuy_payment');
    };

    if (isMyPaymentFlow() === false) {
        return {
            ...props
        };
    }


    return {
        handlePlaceOrder: handleLaybuyPlaceOrder
    };
};
