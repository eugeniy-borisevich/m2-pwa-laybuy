import {useCallback, useEffect, useMemo, useState} from 'react';
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import {useLazyQuery} from "@apollo/client";
import mergeOperations from "@magento/peregrine/lib/util/shallowMerge";
import DEFAULT_OPERATIONS from "@magento/peregrine/lib/talons/CheckoutPage/checkoutPage.gql";
import {useCheckoutContext} from "@magento/peregrine/lib/context/checkout";
import {gql, useQuery, useMutation} from '@apollo/client';
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import actions from "@magento/peregrine/lib/store/actions/checkout";
import {useSummary} from "@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/useSummary";
import {useEventingContext} from "@magento/peregrine/lib/context/eventing";

export const useCheckoutFlow = (props) => {

    const GET_LAY_BUY_DATA = gql`
        query GetLayBuyData($email:String, $cartId:String!) {
            data: getLayBuyData(email:$email, cartId:$cartId) {
                success,
                redirect_url
            }
        }
    `;

    const GET_ORDER_DATA = gql`
        query GetOrderData($cartId: String!) {
            getOrderData(cartId: $cartId) {
                order {
                    order_number
                }
            }
        }
    `;


    const [, { dispatch }] = useEventingContext();
    const [{ cartId }] = useCartContext();
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations);

    const [isOrderChecked, setIsOrderChecked] = useState(false);
    const [isOrderConfirmation, setIsOrderConfirmation] = useState(false);
    const [isOrderData, setIsOrderData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        getOrderDetailsQuery,
        getCheckoutDetailsQuery
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
        getOrderData,
        { data: placeOrderData, loading: placeOrderDataLoading }
    ] = useLazyQuery(GET_ORDER_DATA, {
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
    const {
        data: checkoutData,
        networkStatus: checkoutQueryNetworkStatus
    } = useQuery(getCheckoutDetailsQuery, {
        /**
         * Skip fetching checkout details if the `cartId`
         * is a falsy value.
         */
        skip: !cartId,
        notifyOnNetworkStatusChange: true,
        variables: {
            cartId
        }
    });

    const cartItems = useMemo(() => {
        return (checkoutData && checkoutData?.cart?.items) || [];
    }, [checkoutData]);

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

    useEffect(() => {
        async function checkOrderPlaced() {

            await getOrderData({
                variables: {
                    cartId
                }
            });

        }


        if (!placeOrderData && !isOrderChecked) {
            setIsOrderChecked(true);
            checkOrderPlaced();
        }

    }, [
        cartId,
        getOrderData,
        isOrderChecked
    ]);

    if (isMyPaymentFlow() === false) {
        return {
            ...props
        };
    }

    if (placeOrderData && placeOrderData.getOrderData[0].order.order_number !== '' && !isOrderData) {
        setIsOrderData(true);
        getOrderDetails({
            variables: {
                cartId
            }
        });
    }

    if (placeOrderData && placeOrderData.getOrderData[0].order.order_number == '' && !isOrderData) {
        setIsOrderData(true);
        setIsLoading(false);
    }

    if (orderDetailsData && orderDetailsData.cart && placeOrderData && !isOrderConfirmation) {
        setIsOrderConfirmation(true);
        const shipping =
            orderDetailsData.cart?.shipping_addresses &&
            orderDetailsData.cart.shipping_addresses.reduce(
                (result, item) => {
                    return [
                        ...result,
                        {
                            ...item.selected_shipping_method
                        }
                    ];
                },
                []
            );
        const eventPayload = {
            cart_id: cartId,
            amount: orderDetailsData.cart.prices,
            shipping: shipping,
            payment: orderDetailsData.cart.selected_payment_method,
            products: orderDetailsData.cart.items
        };
        dispatch({
            type: 'ORDER_CONFIRMATION_PAGE_VIEW',
            payload: {
                order_number:
                placeOrderData.getOrderData[0].order.order_number,
                ...eventPayload
            }
        });
    }

    return {
        orderNumber:
            (placeOrderData && placeOrderData.getOrderData[0].order.order_number) ||
            null,
        orderDetailsData,
        handlePlaceOrder: handleLaybuyPlaceOrder,
        isLoading: isLoading
    };
};
