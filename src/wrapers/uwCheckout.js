import { useCheckoutFlow } from "../talons/useCheckoutFlow";


/**
 * Allow extending useCheckout to overwrite function of the hook
 *
 * @param origUseCheckout
 * @returns {function(*): *&{orderNumber: *, placeOrderLoading: boolean, clearCart: ((function(): Promise<void>)|*), orderDetailsLoading: boolean, handlePlaceOrder: ((function(): void)|*), adyenCheckoutAction: *, orderDetailsData: *}}
 */
export default function wrapUseCheckout(origUseCheckout) {
    return function(props) {
        // we cloud also overwrite some props before we execute the useCheckout function.
        const originalReturn = origUseCheckout(props);

        // we partly overwrite the result and extend it
        return { ...originalReturn,...useCheckoutFlow(originalReturn) };
    };
}
