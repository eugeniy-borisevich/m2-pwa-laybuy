import { useCallback, useEffect } from 'react';
import {useQuery, useMutation} from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import DEFAULT_OPERATIONS from './laybuy.gql';
import axios from 'axios';
import {LAYBUY_M2_BACKEND_URL} from "../config";

/**
 * Talon to handle laybuy payment.
 *
 * @param {Boolean} props.shouldSubmit boolean value which represents if a payment nonce request has been submitted
 * @param {Function} props.onPaymentSuccess callback to invoke when the a payment nonce has been generated
 * @param {Function} props.onPaymentError callback to invoke when component throws an error
 * @param {Function} props.resetShouldSubmit callback to reset the shouldSubmit flag
 * @param {DocumentNode} props.operations.getCheckmoConfigQuery query to fetch config from backend
 * @param {DocumentNode} props.operations.setPaymentMethodOnCartMutation mutation to set checkmo as payment
 *
 * @returns {
 *  payableTo: String,
 *  mailingAddress: String,
 *  onBillingAddressChangedError: Function,
 *  onBillingAddressChangedSuccess: Function
 * }
 */
export const useLaybuy = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS, props.operations)
    const {
        getLaybuyConfigQuery,
        setPaymentMethodOnCartMutation,
    } = operations;

    const [{ cartId }] = useCartContext();
    const { data } = useQuery(getLaybuyConfigQuery);
    const { resetShouldSubmit, onPaymentSuccess, onPaymentError } = props;

    const [
        updatePaymentMethod,
        {
            error: paymentMethodMutationError,
            called: paymentMethodMutationCalled,
            loading: paymentMethodMutationLoading
        }
    ] = useMutation(setPaymentMethodOnCartMutation);

    /**
     * This function will be called if cant not set address.
     */
    const onBillingAddressChangedError = useCallback(() => {
        resetShouldSubmit();
    }, [resetShouldSubmit]);

    /**
     * This function will be called if address was successfully set.
     */
    const onBillingAddressChangedSuccess = useCallback(() => {
        updatePaymentMethod({
            variables: { cartId }
        });
    }, [updatePaymentMethod, cartId]);


    useEffect(() => {
        const paymentMethodMutationCompleted =
            paymentMethodMutationCalled && !paymentMethodMutationLoading;

        if (paymentMethodMutationCompleted && !paymentMethodMutationError) {
            axios.get( LAYBUY_M2_BACKEND_URL,{
                params: {
                    fromPwa: 'true',
                    cartId: cartId,
                }
            }).then(function (response) {
                if (response.data.redirect_url){
                    window.location.href = response.data.redirect_url;
                }
            })
            onPaymentSuccess();
        }

        if (paymentMethodMutationCompleted && paymentMethodMutationError) {
            onPaymentError();
        }
    }, [
        paymentMethodMutationError,
        paymentMethodMutationLoading,
        paymentMethodMutationCalled,
        onPaymentSuccess,
        onPaymentError,
        resetShouldSubmit,
        cartId,
    ]);

    return {
        payableTo:
            data &&
            data.storeConfig &&
            data.storeConfig.payment_checkmo_payable_to,
        mailingAddress:
            data &&
            data.storeConfig &&
            data.storeConfig.payment_checkmo_mailing_address,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess
    };
};
