import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import {StoreTitle} from "@magento/venia-ui/lib/components/Head";
import { FormattedMessage, useIntl } from 'react-intl';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/OrderConfirmationPage/orderConfirmationPage.css';
import axios from "axios";
import BrowserPersistence from "@magento/peregrine/lib/util/simplePersistence";
import {LAYBUY_M2_BACKEND_URL} from "../config";

const LayBuyOrderComplete = () => {
    const { orderID = "" } = useParams();
    const classes = defaultClasses;
    const { formatMessage } = useIntl();
    const [orderDetailsData, setOrderDetailsdata] = useState(0);
    const storage = new BrowserPersistence();

    async function getData() {
        const response = await axios.get(LAYBUY_M2_BACKEND_URL, {
            params: {
                fromPwa: 'true',
                orderId: orderID
            }
        })

        return response;
    }
    const laybuyConfimed = storage.getItem('laybuyConfimed-' + orderID);

    if (!laybuyConfimed) {
        getData().then(data => {
            setOrderDetailsdata(data.data.details);
            storage.setItem('laybuyConfimed-' + orderID, true);
        });
    }

    return orderDetailsData !== 0 && orderID ?
        <div>
            <div className={classes.root}>
                <StoreTitle>
                    {formatMessage({
                        id: 'checkoutPage.titleReceipt',
                        defaultMessage: 'Receipt'
                    })}
                </StoreTitle>
                <div className={classes.mainContainer}>
                    <h2 className={classes.heading}>
                        <FormattedMessage
                            id={'checkoutPage.thankYou'}
                            defaultMessage={'Thank you for your order!'}
                        />
                    </h2>
                    <div className={classes.orderNumber}>
                        <FormattedMessage
                            id={'orderNumber'}
                            defaultMessage={'Order Number'}
                            values={orderID}
                        />
                    </div>
                    <div className={classes.orderNumber}>
                        <FormattedMessage
                            id={'orderNumberID'}
                            defaultMessage={orderID}
                            values={orderID}
                        />
                    </div>
                    <div className={classes.shippingInfoHeading}>
                        <FormattedMessage
                            id={'global.shippingInformation'}
                            defaultMessage={'Shipping Information'}
                        />
                    </div>
                    <div className={classes.shippingInfo}>
                        <span className={classes.email}>{orderDetailsData.customer_email}</span>
                        <span className={classes.name}>{orderDetailsData.customer_firstname} {orderDetailsData.customer_firstname}</span>
                        {orderDetailsData.shipping_street}
                        <span className={classes.addressAdditional}>
                        {orderDetailsData.shipping_city}, {orderDetailsData.shipping_state}, {orderDetailsData.shipping_postcode}, {orderDetailsData.shipping_country_code}
                    </span>
                    </div>
                    <div className={classes.shippingMethodHeading}>
                        <FormattedMessage
                            id={'global.shippingMethod'}
                            defaultMessage={'Shipping Method'}
                        />
                    </div>
                    <div className={classes.shippingMethod}>{orderDetailsData.shipping_method}</div>
                    <div className={classes.itemsReview}>

                    </div>
                    <div className={classes.additionalText}>
                        <FormattedMessage
                            id={'checkoutPage.additionalText'}
                            defaultMessage={
                                'You will also receive an email with the details and we will let you know when your order has shipped.'
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
            :
                <div>
                    <div className={classes.root}>
                        <div className={classes.mainContainer}>
                            <h2 className={classes.heading}>
                                <FormattedMessage
                                    id={'checkoutPage.error'}
                                    defaultMessage={'Empty cart'}
                                />
                            </h2>
                        </div>
                    </div>
                </div>;
}

export default LayBuyOrderComplete;
