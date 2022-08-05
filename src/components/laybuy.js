import React from 'react';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { shape, string, bool, func } from 'prop-types';
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';
import { useLaybuy } from '../talons/useLaybuy';
import defaultClasses from './laybuy.css';

/**
 * The CheckMo component renders all information to handle checkmo payment.
 *
 * @param {String} props.payableTo shop owner name where you need to send.
 * @param {String} props.mailingAddress shop owner post address where you need to send.
 * @param {Boolean} props.shouldSubmit boolean value which represents if a payment nonce request has been submitted
 * @param {Function} props.onPaymentSuccess callback to invoke when the a payment nonce has been generated
 * @param {Function} props.onDropinReady callback to invoke when the braintree dropin component is ready
 * @param {Function} props.onPaymentError callback to invoke when component throws an error
 * @param {Function} props.resetShouldSubmit callback to reset the shouldSubmit flag
 */
const Laybuy = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    const { paymentData, cartItems, resetShouldSubmit, onPaymentSuccess, onPaymentError } = props;

    const {
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess,
    } = useLaybuy({
        paymentData,
        cartItems,
        resetShouldSubmit,
        onPaymentSuccess,
        onPaymentError
    });

    return (
        <div className={classes.root}>
            <BillingAddress
                resetShouldSubmit={props.resetShouldSubmit}
                shouldSubmit={props.shouldSubmit}
                onBillingAddressChangedError={onBillingAddressChangedError}
                onBillingAddressChangedSuccess={onBillingAddressChangedSuccess}
            />
        </div>
    );
};

Laybuy.propTypes = {
    classes: shape({ root: string }),
    payableTo: string,
    mailingAddress: string,
    shouldSubmit: bool.isRequired,
    onPaymentSuccess: func,
    onDropinReady: func,
    onPaymentError: func,
    resetShouldSubmit: func.isRequired
};
Laybuy.defaultProps = {
    payableTo: 'Venia Inc',
    mailingAddress: 'Venia Inc\r\nc/o Payment\r\nPO 122334\r\nAustin Texas'
};

export default Laybuy;
